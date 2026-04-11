import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createMemoryAdapter } from './memoryAdapter'

describe('createMemoryAdapter', () => {
  describe('basic operations', () => {
    it('stores and retrieves a value', () => {
      const adapter = createMemoryAdapter<string>()
      adapter.set('key', 'value')
      expect(adapter.get('key')).toBe('value')
    })

    it('returns undefined for missing keys', () => {
      const adapter = createMemoryAdapter<string>()
      expect(adapter.get('missing')).toBeUndefined()
    })

    it('has() returns true for existing keys', () => {
      const adapter = createMemoryAdapter<string>()
      adapter.set('key', 'value')
      expect(adapter.has('key')).toBe(true)
    })

    it('has() returns false for missing keys', () => {
      const adapter = createMemoryAdapter<string>()
      expect(adapter.has('missing')).toBe(false)
    })

    it('delete() removes a key', () => {
      const adapter = createMemoryAdapter<string>()
      adapter.set('key', 'value')
      adapter.delete('key')
      expect(adapter.get('key')).toBeUndefined()
    })

    it('clear() removes all keys', () => {
      const adapter = createMemoryAdapter<string>()
      adapter.set('a', '1')
      adapter.set('b', '2')
      adapter.clear()
      expect(adapter.get('a')).toBeUndefined()
      expect(adapter.get('b')).toBeUndefined()
      expect(adapter.stats().size).toBe(0)
    })

    it('overwrites an existing key', () => {
      const adapter = createMemoryAdapter<string>()
      adapter.set('key', 'value1')
      adapter.set('key', 'value2')
      expect(adapter.get('key')).toBe('value2')
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
      const adapter = createMemoryAdapter<string>({ defaultTTL: 1000 })
      adapter.set('key', 'value')
      vi.advanceTimersByTime(999)
      expect(adapter.get('key')).toBe('value')
    })

    it('get() returns undefined after TTL expires', () => {
      const adapter = createMemoryAdapter<string>({ defaultTTL: 1000 })
      adapter.set('key', 'value')
      vi.advanceTimersByTime(1001)
      expect(adapter.get('key')).toBeUndefined()
    })

    it('has() returns false after TTL expires', () => {
      const adapter = createMemoryAdapter<string>({ defaultTTL: 500 })
      adapter.set('key', 'value')
      vi.advanceTimersByTime(501)
      expect(adapter.has('key')).toBe(false)
    })

    it('per-key TTL overrides defaultTTL', () => {
      const adapter = createMemoryAdapter<string>({ defaultTTL: 1000 })
      adapter.set('short', '1', 200)
      adapter.set('long', '2', 2000)

      vi.advanceTimersByTime(500)
      expect(adapter.get('short')).toBeUndefined()
      expect(adapter.get('long')).toBe('2')
    })

    it('no TTL when defaultTTL not set and no per-key ttl', () => {
      const adapter = createMemoryAdapter<string>()
      adapter.set('key', 'value')
      vi.advanceTimersByTime(9999999)
      expect(adapter.get('key')).toBe('value')
    })
  })

  describe('LRU eviction', () => {
    it('evicts least recently used when maxSize exceeded', () => {
      const adapter = createMemoryAdapter<string>({ maxSize: 3 })
      adapter.set('a', '1')
      adapter.set('b', '2')
      adapter.set('c', '3')
      adapter.set('d', '4') // 'a' should be evicted

      expect(adapter.get('a')).toBeUndefined()
      expect(adapter.get('b')).toBe('2')
      expect(adapter.get('c')).toBe('3')
      expect(adapter.get('d')).toBe('4')
    })

    it('accessing a key refreshes its LRU position', () => {
      const adapter = createMemoryAdapter<string>({ maxSize: 3 })
      adapter.set('a', '1')
      adapter.set('b', '2')
      adapter.set('c', '3')
      adapter.get('a') // 'a' is now MRU; 'b' is now LRU
      adapter.set('d', '4') // 'b' should be evicted

      expect(adapter.get('b')).toBeUndefined()
      expect(adapter.get('a')).toBe('1')
      expect(adapter.get('c')).toBe('3')
      expect(adapter.get('d')).toBe('4')
    })

    it('re-setting an existing key refreshes its LRU position', () => {
      const adapter = createMemoryAdapter<string>({ maxSize: 3 })
      adapter.set('a', '1')
      adapter.set('b', '2')
      adapter.set('c', '3')
      adapter.set('a', '10') // refresh 'a'; 'b' becomes LRU
      adapter.set('d', '4') // 'b' should be evicted

      expect(adapter.get('b')).toBeUndefined()
      expect(adapter.get('a')).toBe('10')
      expect(adapter.get('c')).toBe('3')
      expect(adapter.get('d')).toBe('4')
    })

    it('size never exceeds maxSize', () => {
      const adapter = createMemoryAdapter<string>({ maxSize: 2 })
      adapter.set('a', '1')
      adapter.set('b', '2')
      adapter.set('c', '3')
      expect(adapter.stats().size).toBe(2)
    })
  })

  describe('stats()', () => {
    it('tracks hits', () => {
      const adapter = createMemoryAdapter<string>()
      adapter.set('key', 'value')
      adapter.get('key')
      adapter.get('key')
      expect(adapter.stats().hits).toBe(2)
    })

    it('tracks misses for missing keys', () => {
      const adapter = createMemoryAdapter<string>()
      adapter.get('missing')
      expect(adapter.stats().misses).toBe(1)
    })

    it('tracks misses for expired keys', () => {
      vi.useFakeTimers()
      const adapter = createMemoryAdapter<string>({ defaultTTL: 100 })
      adapter.set('key', 'value')
      vi.advanceTimersByTime(200)
      adapter.get('key')
      expect(adapter.stats().misses).toBe(1)
      vi.useRealTimers()
    })

    it('tracks evictions', () => {
      const adapter = createMemoryAdapter<string>({ maxSize: 2 })
      adapter.set('a', '1')
      adapter.set('b', '2')
      adapter.set('c', '3')
      adapter.set('d', '4')
      expect(adapter.stats().evictions).toBe(2)
    })

    it('reports correct size', () => {
      const adapter = createMemoryAdapter<string>()
      adapter.set('a', '1')
      adapter.set('b', '2')
      expect(adapter.stats().size).toBe(2)
      adapter.delete('a')
      expect(adapter.stats().size).toBe(1)
    })

    it('initial stats are all zero', () => {
      const adapter = createMemoryAdapter<string>()
      expect(adapter.stats()).toEqual({ hits: 0, misses: 0, evictions: 0, size: 0 })
    })
  })
})