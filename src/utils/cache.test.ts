import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Cache } from './cache'

describe('Cache', () => {
  describe('basic operations', () => {
    it('stores and retrieves a value', () => {
      const cache = new Cache<string, number>()
      cache.set('a', 1)
      expect(cache.get('a')).toBe(1)
    })

    it('returns undefined for missing keys', () => {
      const cache = new Cache<string, number>()
      expect(cache.get('missing')).toBeUndefined()
    })

    it('has() returns true for existing keys', () => {
      const cache = new Cache<string, number>()
      cache.set('a', 1)
      expect(cache.has('a')).toBe(true)
    })

    it('has() returns false for missing keys', () => {
      const cache = new Cache<string, number>()
      expect(cache.has('missing')).toBe(false)
    })

    it('delete() removes a key', () => {
      const cache = new Cache<string, number>()
      cache.set('a', 1)
      cache.delete('a')
      expect(cache.get('a')).toBeUndefined()
    })

    it('clear() removes all keys', () => {
      const cache = new Cache<string, number>()
      cache.set('a', 1)
      cache.set('b', 2)
      cache.clear()
      expect(cache.get('a')).toBeUndefined()
      expect(cache.get('b')).toBeUndefined()
      expect(cache.stats().size).toBe(0)
    })

    it('overwrites an existing key', () => {
      const cache = new Cache<string, number>()
      cache.set('a', 1)
      cache.set('a', 2)
      expect(cache.get('a')).toBe(2)
    })
  })

  describe('TTL expiry', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('get() returns value before TTL expires', () => {
      const cache = new Cache<string, number>({ defaultTTL: 1000 })
      cache.set('a', 42)
      vi.advanceTimersByTime(999)
      expect(cache.get('a')).toBe(42)
    })

    it('get() returns undefined after TTL expires', () => {
      const cache = new Cache<string, number>({ defaultTTL: 1000 })
      cache.set('a', 42)
      vi.advanceTimersByTime(1001)
      expect(cache.get('a')).toBeUndefined()
    })

    it('has() returns false after TTL expires', () => {
      const cache = new Cache<string, number>({ defaultTTL: 500 })
      cache.set('a', 42)
      vi.advanceTimersByTime(501)
      expect(cache.has('a')).toBe(false)
    })

    it('per-key TTL overrides defaultTTL', () => {
      const cache = new Cache<string, number>({ defaultTTL: 1000 })
      cache.set('short', 1, 200)
      cache.set('long', 2, 2000)

      vi.advanceTimersByTime(500)
      expect(cache.get('short')).toBeUndefined()
      expect(cache.get('long')).toBe(2)
    })

    it('no TTL when defaultTTL not set and no per-key ttl', () => {
      const cache = new Cache<string, number>()
      cache.set('a', 99)
      vi.advanceTimersByTime(9999999)
      expect(cache.get('a')).toBe(99)
    })
  })

  describe('LRU eviction', () => {
    it('evicts least recently used when maxSize exceeded', () => {
      const cache = new Cache<string, number>({ maxSize: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4) // 'a' should be evicted

      expect(cache.get('a')).toBeUndefined()
      expect(cache.get('b')).toBe(2)
      expect(cache.get('c')).toBe(3)
      expect(cache.get('d')).toBe(4)
    })

    it('accessing a key refreshes its LRU position', () => {
      const cache = new Cache<string, number>({ maxSize: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a') // 'a' is now MRU; 'b' is now LRU
      cache.set('d', 4) // 'b' should be evicted

      expect(cache.get('b')).toBeUndefined()
      expect(cache.get('a')).toBe(1)
      expect(cache.get('c')).toBe(3)
      expect(cache.get('d')).toBe(4)
    })

    it('re-setting an existing key refreshes its LRU position', () => {
      const cache = new Cache<string, number>({ maxSize: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('a', 10) // refresh 'a'; 'b' becomes LRU
      cache.set('d', 4) // 'b' should be evicted

      expect(cache.get('b')).toBeUndefined()
      expect(cache.get('a')).toBe(10)
      expect(cache.get('c')).toBe(3)
      expect(cache.get('d')).toBe(4)
    })

    it('size never exceeds maxSize', () => {
      const cache = new Cache<string, number>({ maxSize: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.stats().size).toBe(2)
    })
  })

  describe('stats()', () => {
    it('tracks hits', () => {
      const cache = new Cache<string, number>()
      cache.set('a', 1)
      cache.get('a')
      cache.get('a')
      expect(cache.stats().hits).toBe(2)
    })

    it('tracks misses for missing keys', () => {
      const cache = new Cache<string, number>()
      cache.get('missing')
      expect(cache.stats().misses).toBe(1)
    })

    it('tracks misses for expired keys', () => {
      vi.useFakeTimers()
      const cache = new Cache<string, number>({ defaultTTL: 100 })
      cache.set('a', 1)
      vi.advanceTimersByTime(200)
      cache.get('a')
      expect(cache.stats().misses).toBe(1)
      vi.useRealTimers()
    })

    it('tracks evictions', () => {
      const cache = new Cache<string, number>({ maxSize: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4)
      expect(cache.stats().evictions).toBe(2)
    })

    it('reports correct size', () => {
      const cache = new Cache<string, number>()
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.stats().size).toBe(2)
      cache.delete('a')
      expect(cache.stats().size).toBe(1)
    })

    it('initial stats are all zero', () => {
      const cache = new Cache<string, number>()
      expect(cache.stats()).toEqual({ hits: 0, misses: 0, evictions: 0, size: 0 })
    })
  })
})
