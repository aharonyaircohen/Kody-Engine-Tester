import { Cache } from '../utils/cache'

export interface MemoryAdapterConfig {
  maxSize?: number
  defaultTTL?: number
}

export interface CacheAdapter<V> {
  get(key: string): V | undefined
  set(key: string, value: V, ttl?: number): void
  delete(key: string): void
  has(key: string): boolean
  clear(): void
  stats(): { hits: number; misses: number; evictions: number; size: number }
}

export function createMemoryAdapter<V>(config: MemoryAdapterConfig = {}): CacheAdapter<V> {
  const cache = new Cache<string, V>({
    maxSize: config.maxSize,
    defaultTTL: config.defaultTTL,
  })

  return {
    get(key: string): V | undefined {
      return cache.get(key)
    },

    set(key: string, value: V, ttl?: number): void {
      cache.set(key, value, ttl)
    },

    delete(key: string): void {
      cache.delete(key)
    },

    has(key: string): boolean {
      return cache.has(key)
    },

    clear(): void {
      cache.clear()
    },

    stats() {
      return cache.stats()
    },
  }
}