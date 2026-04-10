import type { Result } from '@/utils/result'

/**
 * Interface for cache adapters.
 * Both MemoryAdapter and RedisAdapter implement this interface.
 */
export interface CacheAdapter {
  get<V>(key: string): Promise<Result<V | undefined, Error>>
  set<V>(key: string, value: V, ttl?: number): Promise<Result<void, Error>>
  delete(key: string): Promise<Result<void, Error>>
}