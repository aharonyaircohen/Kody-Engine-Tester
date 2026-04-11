import type { CacheAdapter } from './memoryAdapter'

export type CacheAdapterName = 'memory' | 'redis' | 'disk'

export interface CacheManagerConfig {
  adapters: Record<CacheAdapterName, CacheAdapter<unknown>>
  defaultAdapter?: CacheAdapterName
}

export interface CacheManager {
  get<V>(key: string, adapterName?: CacheAdapterName): V | undefined
  set<V>(key: string, value: V, ttl?: number, adapterName?: CacheAdapterName): void
  delete(key: string, adapterName?: CacheAdapterName): void
  has(key: string, adapterName?: CacheAdapterName): boolean
  clear(adapterName?: CacheAdapterName): void
  stats(adapterName?: CacheAdapterName): Record<string, unknown>
}

export function createCacheManager(config: CacheManagerConfig): CacheManager {
  const { adapters, defaultAdapter = 'memory' } = config

  function resolveAdapter(name?: CacheAdapterName): CacheAdapter<unknown> {
    return adapters[name ?? defaultAdapter]
  }

  return {
    get<V>(key: string, adapterName?: CacheAdapterName): V | undefined {
      return resolveAdapter(adapterName).get(key) as V | undefined
    },

    set<V>(key: string, value: V, ttl?: number, adapterName?: CacheAdapterName): void {
      resolveAdapter(adapterName).set(key, value, ttl)
    },

    delete(key: string, adapterName?: CacheAdapterName): void {
      resolveAdapter(adapterName).delete(key)
    },

    has(key: string, adapterName?: CacheAdapterName): boolean {
      return resolveAdapter(adapterName).has(key)
    },

    clear(adapterName?: CacheAdapterName): void {
      if (adapterName) {
        adapters[adapterName].clear()
      } else {
        Object.values(adapters).forEach((adapter) => adapter.clear())
      }
    },

    stats(adapterName?: CacheAdapterName): Record<string, unknown> {
      if (adapterName) {
        return { [adapterName]: adapters[adapterName].stats() }
      }
      return Object.fromEntries(
        Object.entries(adapters).map(([name, adapter]) => [name, adapter.stats()])
      )
    },
  }
}