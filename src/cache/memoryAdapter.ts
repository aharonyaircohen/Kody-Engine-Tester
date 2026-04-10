import type { CacheAdapter, CacheAdapterConfig } from './types'
import type { Result } from '@/utils/result'
import { Cache } from '@/utils/cache'
import { ok, err } from '@/utils/result'

export class MemoryCacheAdapter<V> implements CacheAdapter<V> {
  private readonly cache: Cache<string, V>

  constructor(config: CacheAdapterConfig = {}) {
    this.cache = new Cache<string, V>({
      maxSize: config.maxSize ?? Infinity,
      defaultTTL: config.ttl,
    })
  }

  async get(key: string): Promise<Result<V | null, Error>> {
    try {
      const value = this.cache.get(key)
      return ok(value ?? null)
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)))
    }
  }

  async set(key: string, value: V, ttl?: number): Promise<Result<void, Error>> {
    try {
      this.cache.set(key, value, ttl)
      return ok(undefined)
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)))
    }
  }

  async delete(key: string): Promise<Result<void, Error>> {
    try {
      this.cache.delete(key)
      return ok(undefined)
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)))
    }
  }

  async clear(): Promise<Result<void, Error>> {
    try {
      this.cache.clear()
      return ok(undefined)
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)))
    }
  }

  async has(key: string): Promise<Result<boolean, Error>> {
    try {
      return ok(this.cache.has(key))
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)))
    }
  }
}