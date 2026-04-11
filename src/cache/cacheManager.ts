import { CacheAdapter, createMemoryAdapter } from './memoryAdapter'
import { RedisAdapterOptions, createRedisAdapter, createRedisClient } from './redisAdapter'

export type CacheMode = 'memory' | 'redis'

export interface CacheManagerOptions<V> {
  mode?: CacheMode
  memory?: {
    maxSize?: number
    defaultTTL?: number
  }
  redis?: RedisAdapterOptions
}

export interface CacheManager<V> {
  get(key: string): Promise<V | undefined>
  set(key: string, value: V, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  has(key: string): Promise<boolean>
  mode: CacheMode
}

let memoryAdapter: CacheAdapter<unknown> | null = null

export async function createCacheManager<V>(
  options: CacheManagerOptions<V> = {},
): Promise<CacheManager<V>> {
  const mode = options.mode ?? 'memory'

  if (mode === 'redis') {
    const client = await createRedisClient(options.redis)
    const adapter = createRedisAdapter<V>(client)
    return wrapAdapter(adapter, mode)
  }

  if (!memoryAdapter) {
    memoryAdapter = createMemoryAdapter<V>(options.memory ?? {})
  }

  return wrapAdapter(memoryAdapter as CacheAdapter<V>, mode)
}

function wrapAdapter<V>(adapter: CacheAdapter<V>, mode: CacheMode): CacheManager<V> {
  return {
    mode,

    async get(key: string): Promise<V | undefined> {
      return adapter.get(key)
    },

    async set(key: string, value: V, ttl?: number): Promise<void> {
      return adapter.set(key, value, ttl) as Promise<void>
    },

    async delete(key: string): Promise<void> {
      return adapter.delete(key) as Promise<void>
    },

    async clear(): Promise<void> {
      return adapter.clear() as Promise<void>
    },

    async has(key: string): Promise<boolean> {
      return adapter.has(key) as Promise<boolean>
    },
  }
}

export function clearMemoryCache(): void {
  if (memoryAdapter) {
    memoryAdapter.clear()
  }
}