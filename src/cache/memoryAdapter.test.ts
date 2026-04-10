import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MemoryCacheAdapter } from './memoryAdapter'

describe('MemoryCacheAdapter', () => {
  describe('basic operations', () => {
    it('stores and retrieves a value', async () => {
      const adapter = new MemoryCacheAdapter<number>()
      await adapter.set('key', 42)
      const result = await adapter.get('key')
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })

    it('returns null for missing keys', async () => {
      const adapter = new MemoryCacheAdapter<number>()
      const result = await adapter.get('missing')
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(null)
    })

    it('deletes a key', async () => {
      const adapter = new MemoryCacheAdapter<number>()
      await adapter.set('key', 42)
      await adapter.delete('key')
      const result = await adapter.get('key')
      expect(result.unwrap()).toBe(null)
    })

    it('clears all keys', async () => {
      const adapter = new MemoryCacheAdapter<number>()
      await adapter.set('a', 1)
      await adapter.set('b', 2)
      await adapter.clear()
      const resultA = await adapter.get('a')
      const resultB = await adapter.get('b')
      expect(resultA.unwrap()).toBe(null)
      expect(resultB.unwrap()).toBe(null)
    })

    it('has() returns correct boolean', async () => {
      const adapter = new MemoryCacheAdapter<number>()
      await adapter.set('key', 42)
      const hasResult = await adapter.has('key')
      const missingResult = await adapter.has('missing')
      expect(hasResult.unwrap()).toBe(true)
      expect(missingResult.unwrap()).toBe(false)
    })
  })

  describe('TTL support', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('respects TTL expiry', async () => {
      const adapter = new MemoryCacheAdapter<number>({ ttl: 1000 })
      await adapter.set('key', 42)
      vi.advanceTimersByTime(999)
      const result = await adapter.get('key')
      expect(result.unwrap()).toBe(42)
      vi.advanceTimersByTime(2)
      const expired = await adapter.get('key')
      expect(expired.unwrap()).toBe(null)
    })

    it('per-key TTL overrides default', async () => {
      const adapter = new MemoryCacheAdapter<number>({ ttl: 5000 })
      await adapter.set('short', 1, 100)
      vi.advanceTimersByTime(101)
      const shortResult = await adapter.get('short')
      expect(shortResult.unwrap()).toBe(null)
    })
  })
})