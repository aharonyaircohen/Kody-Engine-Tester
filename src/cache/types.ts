import type { Result } from '@/utils/result'

export interface CacheAdapter<V> {
  get(key: string): Promise<Result<V | null, Error>>
  set(key: string, value: V, ttl?: number): Promise<Result<void, Error>>
  delete(key: string): Promise<Result<void, Error>>
  clear(): Promise<Result<void, Error>>
  has(key: string): Promise<Result<boolean, Error>>
}

export interface CacheAdapterConfig {
  ttl?: number
  maxSize?: number
  prefix?: string
}