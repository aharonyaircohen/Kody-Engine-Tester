import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MemoryCacheAdapter } from './memoryAdapter'

describe('MemoryCacheAdapter', () => {
  let adapter: MemoryCacheAdapter

  beforeEach(() => {
    adapter = new MemoryCacheAdapter()
  })

  describe('basic operations', () => {
    it('stores and retrieves a value', async () => {
      await adapter.set('a', 1)
      expect(await adapter.get('a')).toBe(1)
    })

    it('returns undefined for missing keys', async () => {
      expect(await adapter.get('missing')).toBeUndefined()
    })

    it('has() returns true for existing keys', async () => {
      await adapter.set('a', 1)
      expect(await adapter.has('a')).toBe(true)
    })

    it('has() returns false for missing keys', async () => {
      expect(await adapter.has('missing')).toBe(false)
    })

    it('delete() removes a key', async () => {
      await adapter.set('a', 1)
      await adapter.delete('a')
      expect(await adapter.get('a')).toBeUndefined()
    })

    it('clear() removes all keys', async () => {
      await adapter.set('a', 1)
      await adapter.set('b', 2)
      await adapter.clear()
      expect(await adapter.get('a')).toBeUndefined()
      expect(await adapter.get('b')).toBeUndefined()
    })
  })

  describe('TTL expiry', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('get() returns value before TTL expires', async () => {
      adapter = new MemoryCacheAdapter({ defaultTTL: 1000 })
      await adapter.set('a', 42)
      vi.advanceTimersByTime(999)
      expect(await adapter.get('a')).toBe(42)
    })

    it('get() returns undefined after TTL expires', async () => {
      adapter = new MemoryCacheAdapter({ defaultTTL: 1000 })
      await adapter.set('a', 42)
      vi.advanceTimersByTime(1001)
      expect(await adapter.get('a')).toBeUndefined()
    })
  })

  describe('stats()', () => {
    it('tracks hits and misses', async () => {
      await adapter.set('a', 1)
      await adapter.get('a')
      await adapter.get('missing')
      const s = await adapter.stats()
      expect(s.hits).toBe(1)
      expect(s.misses).toBe(1)
    })
  })
})