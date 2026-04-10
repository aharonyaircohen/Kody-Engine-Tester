export interface CacheAdapter {
  get<T>(key: string): Promise<T | undefined>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  has(key: string): Promise<boolean>
}

export interface CacheAdapterStats {
  hits: number
  misses: number
  evictions: number
  size: number
}

export interface MonitoringCacheAdapter extends CacheAdapter {
  stats(): Promise<CacheAdapterStats>
}