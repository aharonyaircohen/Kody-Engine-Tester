import type { CacheAdapter, CacheAdapterConfig } from './types'
import type { Result } from '@/utils/result'
import { ok, err } from '@/utils/result'

// ioredis is not installed — this sub-task should fail
import Redis from 'ioredis'

export class RedisCacheAdapter<V> implements CacheAdapter<V> {
  private readonly client: Redis
  private readonly prefix: string
  private readonly defaultTTL?: number

  constructor(config: CacheAdapterConfig & { url?: string } = {}) {
    this.client = new Redis(config.url ?? process.env.REDIS_URL ?? 'redis://localhost:6379')
    this.prefix = config.prefix ?? 'cache:'
    this.defaultTTL = config.ttl
  }

  private serialize(value: V): string {
    return JSON.stringify(value)
  }

  private deserialize(data: string): V {
    return JSON.parse(data) as V
  }

  async get(key: string): Promise<Result<V | null, Error>> {
    try {
      const data = await this.client.get(`${this.prefix}${key}`)
      if (data === null) return ok(null)
      return ok(this.deserialize(data))
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)))
    }
  }

  async set(key: string, value: V, ttl?: number): Promise<Result<void, Error>> {
    try {
      const serialized = this.serialize(value)
      const expiry = ttl ?? this.defaultTTL
      if (expiry) {
        await this.client.setex(`${this.prefix}${key}`, expiry, serialized)
      } else {
        await this.client.set(`${this.prefix}${key}`, serialized)
      }
      return ok(undefined)
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)))
    }
  }

  async delete(key: string): Promise<Result<void, Error>> {
    try {
      await this.client.del(`${this.prefix}${key}`)
      return ok(undefined)
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)))
    }
  }

  async clear(): Promise<Result<void, Error>> {
    try {
      const keys = await this.client.keys(`${this.prefix}*`)
      if (keys.length > 0) {
        await this.client.del(...keys)
      }
      return ok(undefined)
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)))
    }
  }

  async has(key: string): Promise<Result<boolean, Error>> {
    try {
      const exists = await this.client.exists(`${this.prefix}${key}`)
      return ok(exists === 1)
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)))
    }
  }
}