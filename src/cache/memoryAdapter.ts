import { Cache } from '@/utils/cache'
import { createToken, type Token } from '@/utils/di-container'
import { ok, err, type Result } from '@/utils/result'

export interface MemoryCacheAdapter {
  get(key: string): Promise<Result<string | undefined, Error>>
  set(key: string, value: string, ttlMs?: number): Promise<Result<void, Error>>
  delete(key: string): Promise<Result<void, Error>>
  clear(): Promise<Result<void, Error>>
  has(key: string): Promise<Result<boolean, Error>>
}

export const MEMORY_ADAPTER_TOKEN = createToken<MemoryCacheAdapter>('memory-adapter')

export interface MemoryAdapterConfig {
  maxSize?: number
  defaultTTL?: number
}

export class MemoryCacheAdapterImpl implements MemoryCacheAdapter {
  private readonly cache: Cache<string, string>

  constructor(config: MemoryAdapterConfig = {}) {
    this.cache = new Cache<string, string>({
      maxSize: config.maxSize ?? Infinity,
      defaultTTL: config.defaultTTL,
    })
  }

  async get(key: string): Promise<Result<string | undefined, Error>> {
    try {
      const value = this.cache.get(key)
      return ok(value)
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)))
    }
  }

  async set(key: string, value: string, ttlMs?: number): Promise<Result<void, Error>> {
    try {
      const ttl = ttlMs !== undefined ? ttlMs : undefined
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
      const result = this.cache.has(key)
      return ok(result)
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)))
    }
  }

  stats() {
    return this.cache.stats()
  }
}

export function createMemoryAdapter(config?: MemoryAdapterConfig): MemoryCacheAdapter {
  return new MemoryCacheAdapterImpl(config)
}
