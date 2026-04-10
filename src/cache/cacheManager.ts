import { Container, createToken } from '@/utils/di-container'
import type { CacheAdapter } from './cacheAdapter'
import { MemoryAdapter } from './memoryAdapter'
import { RedisAdapter, type RedisConfig } from './redisAdapter'
import type { Result } from '@/utils/result'

export const CACHE_ADAPTER_TOKEN = createToken<CacheAdapter>('cache-adapter')

export interface CacheManagerConfig {
  adapter: 'memory' | 'redis'
  redisConfig?: RedisConfig
  maxSize?: number
  defaultTTL?: number
}

/**
 * Cache manager that selects and manages the appropriate cache adapter.
 * Uses token-based DI pattern for adapter selection.
 */
export class CacheManager {
  private readonly container: Container
  private readonly config: CacheManagerConfig

  constructor(config: CacheManagerConfig) {
    this.container = new Container()
    this.config = config
    this.registerAdapter()
  }

  private registerAdapter(): void {
    if (this.config.adapter === 'redis') {
      const redisAdapter = new RedisAdapter(
        this.config.redisConfig ?? {}
      )
      this.container.register(CACHE_ADAPTER_TOKEN, () => redisAdapter)
    } else {
      const memoryAdapter = new MemoryAdapter({
        maxSize: this.config.maxSize,
        defaultTTL: this.config.defaultTTL,
      })
      this.container.register(CACHE_ADAPTER_TOKEN, () => memoryAdapter)
    }
  }

  getAdapter(): CacheAdapter {
    return this.container.resolve(CACHE_ADAPTER_TOKEN)
  }

  async get<V>(key: string): Promise<Result<V | undefined, Error>> {
    const adapter = this.getAdapter()
    return adapter.get<V>(key)
  }

  async set<V>(key: string, value: V, ttl?: number): Promise<Result<void, Error>> {
    const adapter = this.getAdapter()
    return adapter.set<V>(key, value, ttl)
  }

  async delete(key: string): Promise<Result<void, Error>> {
    const adapter = this.getAdapter()
    return adapter.delete(key)
  }

  dispose(): void {
    this.container.dispose()
  }
}