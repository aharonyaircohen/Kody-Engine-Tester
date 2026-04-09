import { ok, err, fromPromise, type Result } from '@/utils/result'
import { createToken, type Token } from '@/utils/di-container'

export interface RedisCacheAdapter {
  get(key: string): Promise<Result<string | undefined, Error>>
  set(key: string, value: string, ttlMs?: number): Promise<Result<void, Error>>
  delete(key: string): Promise<Result<void, Error>>
  clear(): Promise<Result<void, Error>>
  has(key: string): Promise<Result<boolean, Error>>
}

export const REDIS_ADAPTER_TOKEN = createToken<RedisCacheAdapter>('redis-adapter')

export interface RedisAdapterConfig {
  host?: string
  port?: number
  password?: string
  db?: number
  keyPrefix?: string
}

export interface RedisClient {
  get(key: string, callback: (err: Error | null, result: string | null) => void): void
  set(key: string, value: string, callback: (err: Error | null) => void): void
  setex(key: string, seconds: number, value: string, callback: (err: Error | null) => void): void
  del(key: string, callback: (err: Error | null, result: number) => void): void
  exists(key: string, callback: (err: Error | null, result: number) => void): void
  connect(callback: (err: Error | null) => void): void
  quit(callback: (err: Error | null) => void): void
  scanStream(options: { match: string; count: number }): NodeJS.ReadableStream
}

export class RedisCacheAdapterImpl implements RedisCacheAdapter {
  private readonly client: RedisClient
  private readonly keyPrefix: string

  constructor(client: RedisClient, config: RedisAdapterConfig = {}) {
    this.keyPrefix = config.keyPrefix ?? 'cache:'
    this.client = client
  }

  private prefixedKey(key: string): string {
    return `${this.keyPrefix}${key}`
  }

  async connect(): Promise<Result<void, Error>> {
    return fromPromise(
      new Promise<void>((resolve, reject) => {
        this.client.connect((err) => {
          if (err) reject(err)
          else resolve()
        })
      })
    )
  }

  async get(key: string): Promise<Result<string | undefined, Error>> {
    return fromPromise(
      new Promise<string | undefined>((resolve, reject) => {
        this.client.get(this.prefixedKey(key), (err, result) => {
          if (err) reject(err)
          else resolve(result ?? undefined)
        })
      })
    )
  }

  async set(key: string, value: string, ttlMs?: number): Promise<Result<void, Error>> {
    return fromPromise(
      new Promise<void>((resolve, reject) => {
        if (ttlMs !== undefined && ttlMs > 0) {
          const ttlSeconds = Math.ceil(ttlMs / 1000)
          this.client.setex(this.prefixedKey(key), ttlSeconds, value, (err) => {
            if (err) reject(err)
            else resolve()
          })
        } else {
          this.client.set(this.prefixedKey(key), value, (err) => {
            if (err) reject(err)
            else resolve()
          })
        }
      })
    )
  }

  async delete(key: string): Promise<Result<void, Error>> {
    return fromPromise(
      new Promise<void>((resolve, reject) => {
        this.client.del(this.prefixedKey(key), (err) => {
          if (err) reject(err)
          else resolve()
        })
      })
    )
  }

  async clear(): Promise<Result<void, Error>> {
    return fromPromise(
      new Promise<void>((resolve, reject) => {
        const pattern = `${this.keyPrefix}*`
        const stream = this.client.scanStream({
          match: pattern,
          count: 100,
        })

        const keysToDelete: string[] = []

        stream.on('data', (keys: string[]) => {
          keysToDelete.push(...keys)
        })

        stream.on('end', async () => {
          if (keysToDelete.length === 0) {
            resolve()
            return
          }

          try {
            for (const key of keysToDelete) {
              await new Promise<void>((res, rej) => {
                this.client.del(key, (e) => {
                  if (e) rej(e)
                  else res()
                })
              })
            }
            resolve()
          } catch (e) {
            reject(e instanceof Error ? e : new Error(String(e)))
          }
        })

        stream.on('error', (e) => {
          reject(e)
        })
      })
    )
  }

  async has(key: string): Promise<Result<boolean, Error>> {
    return fromPromise(
      new Promise<boolean>((resolve, reject) => {
        this.client.exists(this.prefixedKey(key), (err, result) => {
          if (err) reject(err)
          else resolve(result === 1)
        })
      })
    )
  }

  async disconnect(): Promise<Result<void, Error>> {
    return fromPromise(
      new Promise<void>((resolve, reject) => {
        this.client.quit((err) => {
          if (err) reject(err)
          else resolve()
        })
      })
    )
  }

  getClient(): RedisClient {
    return this.client
  }
}

export function createRedisAdapter(client: RedisClient, config?: RedisAdapterConfig): RedisCacheAdapter {
  return new RedisCacheAdapterImpl(client, config)
}
