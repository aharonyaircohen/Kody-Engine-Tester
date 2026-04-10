import { Cache } from '@/utils/cache'
import type {
  CacheAdapter,
  MonitoringCacheAdapter,
  CacheAdapterStats,
} from './adapters'

export class MemoryCacheAdapter implements MonitoringCacheAdapter {
  private readonly cache: Cache<string, unknown>

  constructor(options: { maxSize?: number; defaultTTL?: number } = {}) {
    this.cache = new Cache(options)
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get(key) as T | undefined
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    this.cache.set(key, value, ttl)
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  async has(key: string): Promise<boolean> {
    return this.cache.has(key)
  }

  async stats(): Promise<CacheAdapterStats> {
    const s = this.cache.stats()
    return {
      hits: s.hits,
      misses: s.misses,
      evictions: s.evictions,
      size: s.size,
    }
  }
}