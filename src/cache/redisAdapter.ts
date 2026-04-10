import Redis from 'ioredis'
import type { CacheAdapter } from './cacheAdapter'
import { tryCatch, fromPromise } from '@/utils/result'

export interface RedisConfig {
  host?: string
  port?: number
  password?: string
  db?: number
}

type RedisConnection = Redis | string

/**
 * Redis adapter implementing the CacheAdapter interface.
 * Uses ioredis for Redis connectivity.
 */
export class RedisAdapter implements CacheAdapter {
  private readonly redis: Redis

  constructor(connection: RedisConnection | RedisConfig) {
    if (typeof connection === 'string') {
      this.redis = new Redis(connection)
    } else if (connection instanceof Redis) {
      this.redis = connection
    } else {
      this.redis = new Redis({
        host: connection.host ?? 'localhost',
        port: connection.port ?? 6379,
        password: connection.password,
        db: connection.db,
      })
    }
  }

  async get<V>(key: string): Promise<import('@/utils/result').Result<V | undefined, Error>> {
    return fromPromise(
      this.redis.get(key).then((value) => {
        if (value === null) return undefined
        // Try to parse JSON, fall back to raw string
        try {
          return JSON.parse(value) as V
        } catch {
          return value as V
        }
      })
    )
  }

  async set<V>(key: string, value: V, ttl?: number): Promise<import('@/utils/result').Result<void, Error>> {
    const serialized = JSON.stringify(value)
    return fromPromise(
      ttl !== undefined
        ? ttl >= 1000
          ? this.redis.set(key, serialized, 'EX', Math.floor(ttl / 1000)).then(() => undefined)
          : this.redis.set(key, serialized, 'PX', ttl).then(() => undefined)
        : this.redis.set(key, serialized).then(() => undefined)
    )
  }

  async delete(key: string): Promise<import('@/utils/result').Result<void, Error>> {
    return fromPromise(this.redis.del(key).then(() => undefined as void))
  }
}