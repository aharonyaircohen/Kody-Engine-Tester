import type { CacheAdapter, CacheManagerConfig, CacheStats } from './types'

/**
 * Cache manager that provides a unified interface for caching.
 * Selects the appropriate adapter based on configuration.
 */
export interface CacheManager<V = unknown> {
  /**
   * Retrieves a value from the cache.
   * @param key - The cache key
   * @returns The cached value or undefined if not found/expired
   */
  get(key: string): Promise<V | undefined>

  /**
   * Stores a value in the cache.
   * @param key - The cache key
   * @param value - The value to cache
   * @param ttl - Optional TTL in milliseconds
   */
  set(key: string, value: V, ttl?: number): Promise<void>

  /**
   * Checks if a key exists in the cache (not expired).
   * @param key - The cache key
   * @returns True if the key exists and is not expired
   */
  has(key: string): Promise<boolean>

  /**
   * Deletes a key from the cache.
   * @param key - The cache key
   */
  delete(key: string): Promise<void>

  /**
   * Clears all entries from the cache.
   */
  clear(): Promise<void>

  /**
   * Gets cache statistics.
   */
  stats(): Promise<CacheStats>
}

/**
 * Creates a cache manager with the specified adapter and configuration.
 * @param config - Configuration including the adapter to use
 * @returns A CacheManager instance
 */
export function createCacheManager<V = unknown>(config: CacheManagerConfig): CacheManager<V> {
  const adapter = config.adapter as CacheAdapter<V>
  const keyPrefix = config.keyPrefix ?? ''
  const defaultTtl = config.defaultTtl

  function wrapKey(key: string): string {
    return keyPrefix ? `${keyPrefix}:${key}` : key
  }

  async function get(key: string): Promise<V | undefined> {
    return adapter.get(wrapKey(key))
  }

  async function set(key: string, value: V, ttl?: number): Promise<void> {
    const resolvedTtl = ttl !== undefined ? ttl : defaultTtl
    return adapter.set(wrapKey(key), value, resolvedTtl)
  }

  async function has(key: string): Promise<boolean> {
    return adapter.has(wrapKey(key))
  }

  async function deleteFn(key: string): Promise<void> {
    return adapter.delete(wrapKey(key))
  }

  async function clear(): Promise<void> {
    return adapter.clear()
  }

  async function stats(): Promise<CacheStats> {
    return adapter.stats()
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
