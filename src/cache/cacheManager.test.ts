import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createCacheManager } from './cacheManager'
import type { CacheAdapter } from './memoryAdapter'

// Mock cache adapter for testing with optional TTL support
function createMockAdapter(_name: string): CacheAdapter<unknown> {
  interface Entry {
    value: unknown
    expiresAt: number | null
  }
  const store: Map<string, Entry> = new Map()
  let hits = 0
  let misses = 0
  const evictions = 0

  return {
    get(key: string): unknown {
      const entry = store.get(key)
      if (entry === undefined) {
        misses++
        return undefined
      }
      if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
        store.delete(key)
        misses++
        return undefined
      }
      hits++
      return entry.value
    },
    set(key: string, value: unknown, ttl?: number): void {
      const expiresAt = ttl !== undefined ? Date.now() + ttl : null
      if (store.has(key)) {
        store.delete(key)
      }
      store.set(key, { value, expiresAt })
    },
    delete(key: string): void {
      store.delete(key)
    },
    has(key: string): boolean {
      const entry = store.get(key)
      if (entry === undefined) return false
      if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
        store.delete(key)
        return false
      }
      return true
    },
    clear(): void {
      store.clear()
    },
    stats() {
      return { hits, misses, evictions, size: store.size }
    },
  }
}

describe('createCacheManager', () => {
  let memoryAdapter: CacheAdapter<unknown>
  let redisAdapter: CacheAdapter<unknown>

  beforeEach(() => {
    memoryAdapter = createMockAdapter('memory')
    redisAdapter = createMockAdapter('redis')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('basic operations with default adapter', () => {
    it('get() retrieves from default memory adapter', () => {
      const manager = createCacheManager({
        adapters: { memory: memoryAdapter, redis: redisAdapter, disk: createMockAdapter('disk') },
        defaultAdapter: 'memory',
      })
      manager.set('key', 'value')
      expect(manager.get('key')).toBe('value')
    })

    it('set() stores in default adapter', () => {
      const manager = createCacheManager({
        adapters: { memory: memoryAdapter, redis: redisAdapter, disk: createMockAdapter('disk') },
        defaultAdapter: 'memory',
      })
      manager.set('key', 'value')
      expect(memoryAdapter.get('key')).toBe('value')
    })

    it('delete() removes from default adapter', () => {
      const manager = createCacheManager({
        adapters: { memory: memoryAdapter, redis: redisAdapter, disk: createMockAdapter('disk') },
        defaultAdapter: 'memory',
      })
      manager.set('key', 'value')
      manager.delete('key')
      expect(manager.get('key')).toBeUndefined()
    })

    it('has() checks default adapter', () => {
      const manager = createCacheManager({
        adapters: { memory: memoryAdapter, redis: redisAdapter, disk: createMockAdapter('disk') },
        defaultAdapter: 'memory',
      })
      manager.set('key', 'value')
      expect(manager.has('key')).toBe(true)
      manager.delete('key')
      expect(manager.has('key')).toBe(false)
    })

    it('clear() clears all adapters when no adapter specified', () => {
      const manager = createCacheManager({
        adapters: { memory: memoryAdapter, redis: redisAdapter, disk: createMockAdapter('disk') },
        defaultAdapter: 'memory',
      })
      manager.set('a', '1')
      manager.set('b', '2')
      manager.clear()
      expect(manager.get('a')).toBeUndefined()
      expect(manager.get('b')).toBeUndefined()
    })
  })

  describe('adapter routing', () => {
    it('get() retrieves from specified adapter', () => {
      const manager = createCacheManager({
        adapters: { memory: memoryAdapter, redis: redisAdapter, disk: createMockAdapter('disk') },
        defaultAdapter: 'memory',
      })
      manager.set('key', 'value', undefined, 'redis')
      expect(manager.get('key', 'redis')).toBe('value')
      expect(manager.get('key', 'memory')).toBeUndefined()
    })

    it('set() stores in specified adapter', () => {
      const manager = createCacheManager({
        adapters: { memory: memoryAdapter, redis: redisAdapter, disk: createMockAdapter('disk') },
        defaultAdapter: 'memory',
      })
      manager.set('key', 'memoryValue', undefined, 'memory')
      manager.set('key', 'redisValue', undefined, 'redis')

      expect(manager.get('key', 'memory')).toBe('memoryValue')
      expect(manager.get('key', 'redis')).toBe('redisValue')
    })

    it('delete() removes from specified adapter', () => {
      const manager = createCacheManager({
        adapters: { memory: memoryAdapter, redis: redisAdapter, disk: createMockAdapter('disk') },
        defaultAdapter: 'memory',
      })
      manager.set('key', 'value', undefined, 'redis')
      manager.delete('key', 'redis')
      expect(manager.get('key', 'redis')).toBeUndefined()
    })

    it('has() checks specified adapter', () => {
      const manager = createCacheManager({
        adapters: { memory: memoryAdapter, redis: redisAdapter, disk: createMockAdapter('disk') },
        defaultAdapter: 'memory',
      })
      manager.set('key', 'value', undefined, 'redis')
      expect(manager.has('key', 'redis')).toBe(true)
      expect(manager.has('key', 'memory')).toBe(false)
    })

    it('clear() clears specified adapter only', () => {
      const manager = createCacheManager({
        adapters: { memory: memoryAdapter, redis: redisAdapter, disk: createMockAdapter('disk') },
        defaultAdapter: 'memory',
      })
      manager.set('a', '1', undefined, 'memory')
      manager.set('b', '2', undefined, 'redis')
      manager.clear('memory')
      expect(manager.get('a', 'memory')).toBeUndefined()
      expect(manager.get('b', 'redis')).toBe('2')
    })

    it('falls back to default adapter when adapter not specified', () => {
      const manager = createCacheManager({
        adapters: { memory: memoryAdapter, redis: redisAdapter, disk: createMockAdapter('disk') },
        defaultAdapter: 'redis',
      })
      manager.set('key', 'value')
      expect(manager.get('key')).toBe('value')
      expect(redisAdapter.get('key')).toBe('value')
    })
  })

  describe('stats()', () => {
    it('returns stats for specific adapter', () => {
      const manager = createCacheManager({
        adapters: { memory: memoryAdapter, redis: redisAdapter, disk: createMockAdapter('disk') },
        defaultAdapter: 'memory',
      })
      manager.set('a', '1', undefined, 'memory')
      manager.set('b', '2', undefined, 'redis')

      const memoryStats = manager.stats('memory')
      expect(memoryStats).toHaveProperty('memory')
      expect((memoryStats as Record<string, unknown>).memory).toHaveProperty('size', 1)
    })

    it('returns stats for all adapters when none specified', () => {
      const manager = createCacheManager({
        adapters: { memory: memoryAdapter, redis: redisAdapter, disk: createMockAdapter('disk') },
        defaultAdapter: 'memory',
      })
      manager.set('a', '1', undefined, 'memory')
      manager.set('b', '2', undefined, 'redis')

      const allStats = manager.stats()
      expect(allStats).toHaveProperty('memory')
      expect(allStats).toHaveProperty('redis')
      expect(allStats).toHaveProperty('disk')
    })

    it('aggregates individual adapter stats', () => {
      const manager = createCacheManager({
        adapters: { memory: memoryAdapter, redis: redisAdapter, disk: createMockAdapter('disk') },
        defaultAdapter: 'memory',
      })
      manager.get('missing') // miss on memory
      manager.set('key', 'value', undefined, 'redis')
      manager.get('key', 'redis') // hit on redis

      const stats = manager.stats()
      expect((stats as Record<string, { misses: number }>).memory.misses).toBe(1)
      expect((stats as Record<string, { hits: number }>).redis.hits).toBe(1)
    })
  })

  describe('TTL support', () => {
    it('passes TTL to adapter set', () => {
      vi.useFakeTimers()
      const manager = createCacheManager({
        adapters: { memory: memoryAdapter, redis: redisAdapter, disk: createMockAdapter('disk') },
        defaultAdapter: 'memory',
      })
      manager.set('key', 'value', 5000, 'memory')
      vi.advanceTimersByTime(6000)
      expect(manager.get('key', 'memory')).toBeUndefined()
      vi.useRealTimers()
    })
  })
})