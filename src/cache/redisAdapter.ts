import { CacheAdapter } from './memoryAdapter'

export interface RedisAdapterOptions {
  url?: string
  host?: string
  port?: number
  password?: string
  keyPrefix?: string
  connectTimeout?: number
  retryDelayMs?: number
}

export interface RedisClient {
  get(key: string): Promise<string | null>
  set(key: string, value: string, px?: number): Promise<'OK'>
  del(key: string): Promise<number>
  flushdb(): Promise<'OK'>
  ping(): Promise<string>
}

export async function createRedisClient(options: RedisAdapterOptions = {}): Promise<RedisClient> {
  const url = options.url ?? `redis://${options.host ?? 'localhost'}:${options.port ?? 6379}`

  // Dynamic import for ioredis - must be installed separately
  const Redis = (await import('ioredis')).default
  const client = new Redis(url, {
    password: options.password,
    connectTimeout: options.connectTimeout ?? 5000,
    retryStrategy: (times: number) => {
      if (times > 3) return null
      return options.retryDelayMs ?? Math.min(times * 100, 3000)
    },
  })

  return {
    get(key: string): Promise<string | null> {
      return client.get(key)
    },

    set(key: string, value: string, px?: number): Promise<'OK'> {
      if (px) {
        return client.set(key, value, 'PX', px)
      }
      return client.set(key, value)
    },

    del(key: string): Promise<number> {
      return client.del(key)
    },

    flushdb(): Promise<'OK'> {
      return client.flushdb()
    },

    ping(): Promise<string> {
      return client.ping()
    },
  }
}

export function createRedisAdapter<V>(
  client: RedisClient,
  options: { keyPrefix?: string; serialize?: (value: V) => string; deserialize?: (value: string) => V } = {},
): CacheAdapter<V> {
  const keyPrefix = options.keyPrefix ?? 'cache:'
  const serialize = options.serialize ?? JSON.stringify
  const deserialize = options.deserialize ?? JSON.parse

  return {
    async get(key: string): Promise<V | undefined> {
      const value = await client.get(`${keyPrefix}${key}`)
      if (value === null) return undefined
      return deserialize(value) as V
    },

    async set(key: string, value: V, ttl?: number): Promise<void> {
      const serialized = serialize(value)
      const px = ttl ? ttl : undefined
      await client.set(`${keyPrefix}${key}`, serialized, px)
    },

    async delete(key: string): Promise<void> {
      await client.del(`${keyPrefix}${key}`)
    },

    async clear(): Promise<void> {
      await client.flushdb()
    },

    async has(key: string): Promise<boolean> {
      const value = await client.get(`${keyPrefix}${key}`)
      return value !== null
    },
  }
}