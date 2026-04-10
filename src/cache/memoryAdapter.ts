import type { CacheAdapter } from './cacheAdapter'
import { Cache } from '@/utils/cache'
import { tryCatch, type Result } from '@/utils/result'

export interface MemoryAdapterOptions {
  maxSize?: number
  defaultTTL?: number
  cache?: Cache<string, unknown>
}

/**
 * Memory adapter that wraps the existing Cache class.
 * Provides get/set/delete methods returning Result types.
 */
export class MemoryAdapter implements CacheAdapter {
  private readonly cache: Cache<string, unknown>

  constructor(options: MemoryAdapterOptions = {}) {
    this.cache = options.cache ?? new Cache<string, unknown>({
      maxSize: options.maxSize,
      defaultTTL: options.defaultTTL,
    })
  }

  async get<V>(key: string): Promise<Result<V | undefined, Error>> {
    return tryCatch(() => {
      const value = this.cache.get(key)
      return value as V | undefined
    })
  }

  async set<V>(key: string, value: V, ttl?: number): Promise<Result<void, Error>> {
    return tryCatch(() => {
      this.cache.set(key, value, ttl)
    })
  }

  async delete(key: string): Promise<Result<void, Error>> {
    return tryCatch(() => {
      this.cache.delete(key)
    })
  }
}