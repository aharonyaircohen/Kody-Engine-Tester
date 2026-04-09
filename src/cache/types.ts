/**
 * Cache adapter interface for type-safe caching implementations.
 * Both memory and Redis adapters must conform to this contract.
 */
export interface CacheAdapter<V> {
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

export interface CacheStats {
  hits: number
  misses: number
  evictions: number
  size: number
}

/**
 * Configuration for the cache manager.
 */
export interface CacheManagerConfig {
  /**
   * Cache adapter to use.
   */
  adapter: CacheAdapter<unknown>

  /**
   * Default TTL in milliseconds for cache entries.
   */
  defaultTtl?: number

  /**
   * Prefix for all cache keys to avoid collisions.
   */
  keyPrefix?: string
}

/**
 * Redis-specific configuration for the Redis adapter.
 */
export interface RedisAdapterConfig {
  /**
   * Redis connection URL.
   */
  url: string

  /**
   * Key prefix for namespacing (optional).
   */
  keyPrefix?: string

  /**
   * Default TTL in milliseconds for cache entries (optional).
   */
  defaultTtl?: number
}

/**
 * Memory adapter-specific configuration.
 */
export interface MemoryAdapterConfig {
  /**
   * Maximum number of entries in the cache.
   * @default Infinity
   */
  maxSize?: number

  /**
   * Default TTL in milliseconds for cache entries.
   * @default null (no expiry)
   */
  defaultTtl?: number | null
}