import type { MonitoringCacheAdapter } from './adapters'
import { MemoryCacheAdapter } from './memoryAdapter'
import {
  RedisCacheAdapter,
  type RedisCacheAdapterOptions,
} from './redisAdapter'

export type CacheManagerOptions = {
  adapter?: 'memory' | 'redis'
  redis?: RedisCacheAdapterOptions
  memory?: { maxSize?: number; defaultTTL?: number }
}

export class CacheManager implements MonitoringCacheAdapter {
  private readonly adapter: MonitoringCacheAdapter

  constructor(options: CacheManagerOptions = {}) {
    const adapterType = options.adapter ?? (process.env.REDIS_URL ? 'redis' : 'memory')

    if (adapterType === 'redis') {
      this.adapter = new RedisCacheAdapter(options.redis)
    } else {
      this.adapter = new MemoryCacheAdapter(options.memory)
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.adapter.get<T>(key)
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    return this.adapter.set(key, value, ttl)
  }

  async delete(key: string): Promise<void> {
    return this.adapter.delete(key)
  }

  async clear(): Promise<void> {
    return this.adapter.clear()
  }

  async has(key: string): Promise<boolean> {
    return this.adapter.has(key)
  }

  async stats(): Promise<{ hits: number; misses: number; evictions: number; size: number }> {
    return this.adapter.stats()
  }
}

export const cacheManager = new CacheManager()