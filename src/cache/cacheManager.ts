import { createToken, type Token, type Container } from '@/utils/di-container'
import { ok, err, type Result } from '@/utils/result'
import { REDIS_ADAPTER_TOKEN } from './redisAdapter'
import { MEMORY_ADAPTER_TOKEN } from './memoryAdapter'

export interface CacheAdapter {
  get(key: string): Promise<Result<string | undefined, Error>>
  set(key: string, value: string, ttlMs?: number): Promise<Result<void, Error>>
  delete(key: string): Promise<Result<void, Error>>
  clear(): Promise<Result<void, Error>>
  has(key: string): Promise<Result<boolean, Error>>
}

export const CACHE_MANAGER_TOKEN = createToken<CacheManager>('cache-manager')

export interface CacheManagerConfig {
  defaultTTL?: number
  keyPrefix?: string
}

export class CacheManager {
  private readonly adapters: Map<string, CacheAdapter> = new Map()
  private primaryAdapterName: string | null = null
  private readonly defaultTTL: number | undefined
  private readonly keyPrefix: string

  constructor(config: CacheManagerConfig = {}) {
    this.defaultTTL = config.defaultTTL
    this.keyPrefix = config.keyPrefix ?? ''
  }

  registerAdapter(name: string, adapter: CacheAdapter, setAsPrimary = false): void {
    this.adapters.set(name, adapter)
    if (setAsPrimary || this.primaryAdapterName === null) {
      this.primaryAdapterName = name
    }
  }

  setPrimaryAdapter(name: string): Result<void, Error> {
    if (!this.adapters.has(name)) {
      return err(new Error(`Adapter '${name}' is not registered`))
    }
    this.primaryAdapterName = name
    return ok(undefined)
  }

  getAdapter(name: string): Result<CacheAdapter, Error> {
    const adapter = this.adapters.get(name)
    if (!adapter) {
      return err(new Error(`Adapter '${name}' is not registered`))
    }
    return ok(adapter)
  }

  getPrimaryAdapter(): Result<CacheAdapter, Error> {
    if (!this.primaryAdapterName) {
      return err(new Error('No primary adapter is registered'))
    }
    return this.getAdapter(this.primaryAdapterName)
  }

  private prefixedKey(key: string): string {
    return `${this.keyPrefix}${key}`
  }

  async get(key: string, adapterName?: string): Promise<Result<string | undefined, Error>> {
    const adapterResult =
      adapterName !== undefined ? this.getAdapter(adapterName) : this.getPrimaryAdapter()

    if (adapterResult.isErr()) {
      return err(adapterResult.error)
    }

    const adapter = adapterResult.value
    const prefixed = this.prefixedKey(key)

    try {
      const result = await adapter.get(prefixed)
      return result
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)))
    }
  }

  async set(
    key: string,
    value: string,
    ttlMs?: number,
    adapterName?: string
  ): Promise<Result<void, Error>> {
    const adapterResult =
      adapterName !== undefined ? this.getAdapter(adapterName) : this.getPrimaryAdapter()

    if (adapterResult.isErr()) {
      return err(adapterResult.error)
    }

    const adapter = adapterResult.value
    const prefixed = this.prefixedKey(key)
    const resolvedTTL = ttlMs ?? this.defaultTTL

    try {
      const result = await adapter.set(prefixed, value, resolvedTTL)
      return result
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)))
    }
  }

  async delete(key: string, adapterName?: string): Promise<Result<void, Error>> {
    const adapterResult =
      adapterName !== undefined ? this.getAdapter(adapterName) : this.getPrimaryAdapter()

    if (adapterResult.isErr()) {
      return err(adapterResult.error)
    }

    const adapter = adapterResult.value
    const prefixed = this.prefixedKey(key)

    try {
      const result = await adapter.delete(prefixed)
      return result
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)))
    }
  }

  async clear(adapterName?: string): Promise<Result<void, Error>> {
    if (adapterName !== undefined) {
      const adapterResult = this.getAdapter(adapterName)
      if (adapterResult.isErr()) {
        return err(adapterResult.error)
      }
      try {
        return await adapterResult.value.clear()
      } catch (e) {
        return err(e instanceof Error ? e : new Error(String(e)))
      }
    }

    const errors: Error[] = []
    for (const [, adapter] of this.adapters) {
      try {
        const result = await adapter.clear()
        if (result.isErr()) {
          errors.push(result.error)
        }
      } catch (e) {
        errors.push(e instanceof Error ? e : new Error(String(e)))
      }
    }

    if (errors.length > 0) {
      return err(new Error(`Clear failed on ${errors.length} adapter(s): ${errors.map((e) => e.message).join('; ')}`))
    }

    return ok(undefined)
  }

  async has(key: string, adapterName?: string): Promise<Result<boolean, Error>> {
    const adapterResult =
      adapterName !== undefined ? this.getAdapter(adapterName) : this.getPrimaryAdapter()

    if (adapterResult.isErr()) {
      return err(adapterResult.error)
    }

    const adapter = adapterResult.value
    const prefixed = this.prefixedKey(key)

    try {
      const result = await adapter.has(prefixed)
      return result
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)))
    }
  }

  getAdapterNames(): string[] {
    return Array.from(this.adapters.keys())
  }
}

export function createCacheManager(config?: CacheManagerConfig): CacheManager {
  return new CacheManager(config)
}

export function registerCacheAdapters(
  container: Container,
  manager: CacheManager
): void {
  const redisAdapter = container.resolve(REDIS_ADAPTER_TOKEN)
  const memoryAdapter = container.resolve(MEMORY_ADAPTER_TOKEN)

  manager.registerAdapter('memory', memoryAdapter, true)
  manager.registerAdapter('redis', redisAdapter, false)
}
