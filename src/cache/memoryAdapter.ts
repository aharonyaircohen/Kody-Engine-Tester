import type { CacheAdapter, CacheStats, MemoryAdapterConfig } from './types'

interface CacheEntry<V> {
  value: V
  expiresAt: number | null
}

/**
 * Creates an in-memory cache adapter with TTL support and LRU eviction.
 * @param config - Optional configuration for the memory adapter
 * @returns A CacheAdapter implementation backed by an in-memory Map
 */
export function createMemoryAdapter<V = unknown>(
  config: MemoryAdapterConfig = {}
): CacheAdapter<V> {
  const maxSize = config.maxSize ?? Infinity
  const defaultTtl = config.defaultTtl ?? null

  const map = new Map<string, CacheEntry<V>>()
  let hits = 0
  let misses = 0
  let evictions = 0

  async function get(key: string): Promise<V | undefined> {
    const entry = map.get(key)
    if (entry === undefined) {
      misses++
      return undefined
    }

    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      map.delete(key)
      misses++
      return undefined
    }

    // Refresh LRU position
    map.delete(key)
    map.set(key, entry)
    hits++
    return entry.value
  }

  async function set(key: string, value: V, ttl?: number): Promise<void> {
    const resolvedTtl = ttl !== undefined ? ttl : defaultTtl
    const expiresAt = resolvedTtl !== null ? Date.now() + resolvedTtl : null

    // Refresh position if key already exists
    if (map.has(key)) {
      map.delete(key)
    } else if (map.size >= maxSize) {
      // Evict LRU entry (first key in insertion order)
      const lruKey = map.keys().next().value as string
      map.delete(lruKey)
      evictions++
    }

    map.set(key, { value, expiresAt })
  }

  async function has(key: string): Promise<boolean> {
    const entry = map.get(key)
    if (entry === undefined) return false

    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      map.delete(key)
      return false
    }

    return true
  }

  async function deleteFn(key: string): Promise<void> {
    map.delete(key)
  }

  async function clear(): Promise<void> {
    map.clear()
  }

  async function stats(): Promise<CacheStats> {
    return {
      hits,
      misses,
      evictions,
      size: map.size,
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
