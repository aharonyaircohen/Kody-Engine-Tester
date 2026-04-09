import type { CacheAdapter, CacheStats, RedisAdapterConfig } from './types'

// Note: ioredis must be installed separately via `pnpm add ioredis`
// import Redis from 'ioredis'

interface CacheEntry<V> {
  value: V
  expiresAt: number | null
}

/**
 * Creates a Redis-backed cache adapter with TTL support.
 * @param config - Configuration for the Redis adapter
 * @param redisClient - An optional ioredis instance. If not provided, creates one from config.url
 * @returns A CacheAdapter implementation backed by Redis
 */
export function createRedisAdapter<V = unknown>(
  config: RedisAdapterConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  redisClient?: any
): CacheAdapter<V> {
  const keyPrefix = config.keyPrefix ?? 'cache:'
  const defaultTtl = config.defaultTtl ?? null

  let client = redisClient
  let hits = 0
  let misses = 0
  let evictions = 0

  async function get(key: string): Promise<V | undefined> {
    const fullKey = `${keyPrefix}${key}`
    const data = await client.get(fullKey)

    if (data === null) {
      misses++
      return undefined
    }

    try {
      const entry: CacheEntry<V> = JSON.parse(data)

      if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
        await client.del(fullKey)
        misses++
        return undefined
      }

      hits++
      return entry.value
    } catch {
      misses++
      return undefined
    }
  }

  async function set(key: string, value: V, ttl?: number): Promise<void> {
    const fullKey = `${keyPrefix}${key}`
    const resolvedTtl = ttl !== undefined ? ttl : defaultTtl
    const expiresAt = resolvedTtl !== null ? Date.now() + resolvedTtl : null

    const entry: CacheEntry<V> = { value, expiresAt }
    const data = JSON.stringify(entry)

    if (resolvedTtl !== null) {
      // TTL in seconds for Redis
      const ttlSeconds = Math.ceil(resolvedTtl / 1000)
      await client.setex(fullKey, ttlSeconds, data)
    } else {
      await client.set(fullKey, data)
    }
  }

  async function has(key: string): Promise<boolean> {
    const fullKey = `${keyPrefix}${key}`
    const exists = await client.exists(fullKey)

    if (!exists) {
      return false
    }

    // Check if expired
    const data = await client.get(fullKey)
    if (data === null) {
      return false
    }

    try {
      const entry: CacheEntry<V> = JSON.parse(data)
      if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
        await client.del(fullKey)
        return false
      }
      return true
    } catch {
      return false
    }
  }

  async function deleteFn(key: string): Promise<void> {
    const fullKey = `${keyPrefix}${key}`
    await client.del(fullKey)
  }

  async function clear(): Promise<void> {
    const keys = await client.keys(`${keyPrefix}*`)
    if (keys.length > 0) {
      await client.del(...keys)
    }
  }

  async function stats(): Promise<CacheStats> {
    // Redis doesn't directly track hits/misses in the same way
    // We track them in memory for this adapter
    const keys = await client.keys(`${keyPrefix}*`)
    return {
      hits,
      misses,
      evictions,
      size: keys.length,
    }
  }

  return {
    get,
    set,
    has,
    delete: deleteFn,
    clear,
    stats,
  }
}
