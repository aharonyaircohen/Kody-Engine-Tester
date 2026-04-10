import type { CacheAdapter, CacheAdapterConfig } from './types'
import { MemoryCacheAdapter } from './memoryAdapter'
import { ok, err } from '@/utils/result'
import type { Result } from '@/utils/result'

export type CacheManagerMode = 'memory' | 'redis' | 'auto'

export interface CacheManagerConfig {
  mode?: CacheManagerMode
  memoryConfig?: CacheAdapterConfig
  redisConfig?: CacheAdapterConfig & { url?: string }
}

export class CacheManager<V> {
  private memoryAdapter: CacheAdapter<V>
  private redisAdapter?: CacheAdapter<V>
  private mode: CacheManagerMode

  constructor(config: CacheManagerConfig = {}) {
    this.mode = config.mode ?? 'auto'
    this.memoryAdapter = new MemoryCacheAdapter<V>(config.memoryConfig ?? {})

    if (this.mode === 'redis' || this.mode === 'auto') {
      // Attempt to load Redis adapter; on failure, falls back to memory
      this.tryLoadRedisAdapter(config.redisConfig)
    }
  }

  private tryLoadRedisAdapter(config?: CacheAdapterConfig & { url?: string }): void {
    try {
      // Dynamic import to avoid hard failure at construction time
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { RedisCacheAdapter } = require('./redisAdapter') as { RedisCacheAdapter: new (config?: unknown) => CacheAdapter<V> }
      this.redisAdapter = new RedisCacheAdapter(config ?? {})
    } catch {
      // ioredis not installed or Redis unavailable — use memory only
      this.redisAdapter = undefined
    }
  }

  getAdapter(): CacheAdapter<V> {
    if (this.mode === 'memory') {
      return this.memoryAdapter
    }

    if (this.redisAdapter) {
      return this.redisAdapter
    }

    return this.memoryAdapter
  }

  async get(key: string): Promise<Result<V | null, Error>> {
    return this.getAdapter().get(key)
  }

  async set(key: string, value: V, ttl?: number): Promise<Result<void, Error>> {
    return this.getAdapter().set(key, value, ttl)
  }

  async delete(key: string): Promise<Result<void, Error>> {
    return this.getAdapter().delete(key)
  }

  async clear(): Promise<Result<void, Error>> {
    return this.getAdapter().clear()
  }

  async has(key: string): Promise<Result<boolean, Error>> {
    return this.getAdapter().has(key)
  }

  isRedisAvailable(): boolean {
    return this.redisAdapter !== undefined
  }
}