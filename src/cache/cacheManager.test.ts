import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createCacheManager } from './cacheManager'
import { createMemoryAdapter } from './memoryAdapter'
import type { CacheAdapter, CacheManagerConfig } from './types'

// Mock adapter for testing adapter selection and fallback
function createMockAdapter<V>(): CacheAdapter<V> & {
  shouldFail: boolean
  failNext: () => void
} {
  let shouldFail = false

  return {
    shouldFail,
    failNext: () => {
      shouldFail = true
    },
    get: vi.fn(async (key: string) => {
      if (shouldFail) throw new Error('Adapter error')
      return undefined
    }),
    set: vi.fn(async (key: string, value: V) => {
      if (shouldFail) throw new Error('Adapter error')
    }),
    has: vi.fn(async (key: string) => {
      if (shouldFail) throw new Error('Adapter error')
      return false
    }),
    delete: vi.fn(async (key: string) => {
      if (shouldFail) throw new Error('Adapter error')
    }),
    clear: vi.fn(async () => {
      if (shouldFail) throw new Error('Adapter error')
    }),
    stats: vi.fn(async () => ({
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
    })),
  }
}

describe('createCacheManager', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('basic operations with memory adapter', () => {
    it('should set and get values via memory adapter', async () => {
      const memoryAdapter = createMemoryAdapter<string>()
      const config: CacheManagerConfig = { adapter: memoryAdapter }
      const manager = createCacheManager<string>(config)

      await manager.set('key1', 'value1')
      const result = await manager.get('key1')

      expect(result).toBe('value1')
    })

    it('should return undefined for missing keys', async () => {
      const memoryAdapter = createMemoryAdapter<string>()
      const config: CacheManagerConfig = { adapter: memoryAdapter }
      const manager = createCacheManager<string>(config)

      const result = await manager.get('nonexistent')

      expect(result).toBeUndefined()
    })

    it('should check has correctly', async () => {
      const memoryAdapter = createMemoryAdapter<string>()
      const config: CacheManagerConfig = { adapter: memoryAdapter }
      const manager = createCacheManager<string>(config)

      await manager.set('key1', 'value1')
      const hasKey = await manager.has('key1')
      const hasMissing = await manager.has('nonexistent')

      expect(hasKey).toBe(true)
      expect(hasMissing).toBe(false)
    })

    it('should delete keys', async () => {
      const memoryAdapter = createMemoryAdapter<string>()
      const config: CacheManagerConfig = { adapter: memoryAdapter }
      const manager = createCacheManager<string>(config)

      await manager.set('key1', 'value1')
      await manager.delete('key1')
      const result = await manager.get('key1')

      expect(result).toBeUndefined()
    })

    it('should clear all keys', async () => {
      const memoryAdapter = createMemoryAdapter<string>()
      const config: CacheManagerConfig = { adapter: memoryAdapter }
      const manager = createCacheManager<string>(config)

      await manager.set('key1', 'value1')
      await manager.set('key2', 'value2')
      await manager.clear()
      const result1 = await manager.get('key1')
      const result2 = await manager.get('key2')

      expect(result1).toBeUndefined()
      expect(result2).toBeUndefined()
    })

    it('should return stats', async () => {
      const memoryAdapter = createMemoryAdapter<string>()
      const config: CacheManagerConfig = { adapter: memoryAdapter }
      const manager = createCacheManager<string>(config)

      await manager.set('key1', 'value1')
      await manager.get('key1')
      await manager.get('key2')

      const stats = await manager.stats()
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(1)
    })
  })

  describe('key prefix', () => {
    it('should apply key prefix to all operations', async () => {
      const memoryAdapter = createMemoryAdapter<string>()
      const config: CacheManagerConfig = {
        adapter: memoryAdapter,
        keyPrefix: 'myapp',
      }
      const manager = createCacheManager<string>(config)

      await manager.set('key1', 'value1')

      // Direct access to adapter should show prefixed key
      const directResult = await memoryAdapter.get('myapp:key1')
      expect(directResult).toBe('value1')

      // Non-prefixed key should not exist
      const nonPrefixedResult = await memoryAdapter.get('key1')
      expect(nonPrefixedResult).toBeUndefined()
    })

    it('should use empty prefix when not specified', async () => {
      const memoryAdapter = createMemoryAdapter<string>()
      const config: CacheManagerConfig = { adapter: memoryAdapter }
      const manager = createCacheManager<string>(config)

      await manager.set('key1', 'value1')

      const result = await memoryAdapter.get('key1')
      expect(result).toBe('value1')
    })
  })

  describe('TTL handling', () => {
    it('should pass TTL to adapter', async () => {
      const memoryAdapter = createMemoryAdapter<string>()
      const config: CacheManagerConfig = { adapter: memoryAdapter }
      const manager = createCacheManager<string>(config)

      await manager.set('key1', 'value1', 5000)
      vi.advanceTimersByTime(6000)

      const result = await manager.get('key1')
      expect(result).toBeUndefined()
    })

    it('should use default TTL from config', async () => {
      const memoryAdapter = createMemoryAdapter<string>()
      const config: CacheManagerConfig = {
        adapter: memoryAdapter,
        defaultTtl: 3000,
      }
      const manager = createCacheManager<string>(config)

      await manager.set('key1', 'value1') // Uses default TTL
      vi.advanceTimersByTime(4000)

      const result = await manager.get('key1')
      expect(result).toBeUndefined()
    })
  })

  describe('adapter selection', () => {
    it('should use the provided adapter', async () => {
      const memoryAdapter = createMemoryAdapter<string>()
      const config: CacheManagerConfig = { adapter: memoryAdapter }
      const manager = createCacheManager<string>(config)

      await manager.set('key1', 'value1')
      const result = await manager.get('key1')

      expect(result).toBe('value1')
      expect(memoryAdapter).toBeDefined()
    })

    it('should work with different value types', async () => {
      const memoryAdapter = createMemoryAdapter<{ name: string; age: number }>()
      const config: CacheManagerConfig = { adapter: memoryAdapter }
      const manager = createCacheManager<{ name: string; age: number }>(config)

      const obj = { name: 'John', age: 30 }
      await manager.set('user', obj)
      const result = await manager.get('user')

      expect(result).toEqual(obj)
    })
  })
})
