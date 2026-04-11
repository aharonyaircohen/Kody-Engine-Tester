import { Cache } from '../utils/cache'

export interface CacheAdapter<V> {
  get(key: string): Promise<V | undefined> | V | undefined
  set(key: string, value: V, ttl?: number): Promise<void> | void
  delete(key: string): Promise<void> | void
  clear(): Promise<void> | void
  has(key: string): Promise<boolean> | boolean
}

export interface MemoryAdapterOptions {
  maxSize?: number
  defaultTTL?: number
}

export function createMemoryAdapter<V>(
  options: MemoryAdapterOptions = {},
): CacheAdapter<V> {
  const cache = new Cache<string, V>({
    maxSize: options.maxSize,
    defaultTTL: options.defaultTTL,
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

    clear(): void {
      cache.clear()
    },

    has(key: string): boolean {
      return cache.has(key)
    },
  }
}