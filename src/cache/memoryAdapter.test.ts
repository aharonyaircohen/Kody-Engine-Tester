import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createMemoryAdapter } from './memoryAdapter'

describe('createMemoryAdapter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('basic operations', () => {
    it('should set and get a value', async () => {
      const adapter = createMemoryAdapter<string>()

      await adapter.set('key1', 'value1')
      const result = await adapter.get('key1')

      expect(result).toBe('value1')
    })

    it('should return undefined for missing key', async () => {
      const adapter = createMemoryAdapter<string>()

      const result = await adapter.get('nonexistent')

      expect(result).toBeUndefined()
    })

    it('should check if key exists', async () => {
      const adapter = createMemoryAdapter<string>()

      await adapter.set('key1', 'value1')
      const hasKey = await adapter.has('key1')
      const hasMissing = await adapter.has('nonexistent')

      expect(hasKey).toBe(true)
      expect(hasMissing).toBe(false)
    })

    it('should delete a key', async () => {
      const adapter = createMemoryAdapter<string>()

      await adapter.set('key1', 'value1')
      await adapter.delete('key1')
      const result = await adapter.get('key1')

      expect(result).toBeUndefined()
    })

    it('should clear all keys', async () => {
      const adapter = createMemoryAdapter<string>()

      await adapter.set('key1', 'value1')
      await adapter.set('key2', 'value2')
      await adapter.clear()
      const result1 = await adapter.get('key1')
      const result2 = await adapter.get('key2')

      expect(result1).toBeUndefined()
      expect(result2).toBeUndefined()
    })
  })

  describe('TTL expiry', () => {
    it('should expire entries after TTL', async () => {
      const adapter = createMemoryAdapter<string>()

      await adapter.set('key1', 'value1', 5000) // 5 seconds TTL
      vi.advanceTimersByTime(6000) // Advance 6 seconds

      const result = await adapter.get('key1')
      expect(result).toBeUndefined()
    })

    it('should not expire entries before TTL', async () => {
      const adapter = createMemoryAdapter<string>()

      await adapter.set('key1', 'value1', 5000) // 5 seconds TTL
      vi.advanceTimersByTime(4000) // Advance 4 seconds

      const result = await adapter.get('key1')
      expect(result).toBe('value1')
    })

    it('should use default TTL when set', async () => {
      const adapter = createMemoryAdapter<string>({ defaultTtl: 3000 })

      await adapter.set('key1', 'value1') // Uses default TTL of 3 seconds
      vi.advanceTimersByTime(4000) // Advance 4 seconds

      const result = await adapter.get('key1')
      expect(result).toBeUndefined()
    })

    it('should not expire when defaultTtl is null', async () => {
      const adapter = createMemoryAdapter<string>({ defaultTtl: null })

      await adapter.set('key1', 'value1')
      vi.advanceTimersByTime(100000) // Advance way past any reasonable TTL

      const result = await adapter.get('key1')
      expect(result).toBe('value1')
    })

    it('should override default TTL with set TTL', async () => {
      const adapter = createMemoryAdapter<string>({ defaultTtl: 1000 })

      await adapter.set('key1', 'value1', 5000) // Override to 5 seconds
      vi.advanceTimersByTime(2000) // Advance 2 seconds - within default TTL

      const result1 = await adapter.get('key1')
      expect(result1).toBe('value1')

      vi.advanceTimersByTime(4000) // Total 6 seconds - past set TTL
      const result2 = await adapter.get('key1')
      expect(result2).toBeUndefined()
    })

    it('should expire has() returns false for expired entries', async () => {
      const adapter = createMemoryAdapter<string>()

      await adapter.set('key1', 'value1', 5000)
      vi.advanceTimersByTime(6000)

      const hasKey = await adapter.has('key1')
      expect(hasKey).toBe(false)
    })
  })

  describe('LRU eviction', () => {
    it('should evict LRU entry when maxSize is exceeded', async () => {
      const adapter = createMemoryAdapter<string>({ maxSize: 2 })

      await adapter.set('key1', 'value1')
      await adapter.set('key2', 'value2')
      await adapter.set('key3', 'value3') // Should evict key1

      const result1 = await adapter.get('key1')
      const result2 = await adapter.get('key2')
      const result3 = await adapter.get('key3')

      expect(result1).toBeUndefined()
      expect(result2).toBe('value2')
      expect(result3).toBe('value3')
    })

    it('should refresh LRU position on access', async () => {
      const adapter = createMemoryAdapter<string>({ maxSize: 2 })

      await adapter.set('key1', 'value1')
      await adapter.set('key2', 'value2')
      await adapter.get('key1') // Access key1 to refresh LRU position
      await adapter.set('key3', 'value3') // Should evict key2 (least recently used)

      const result1 = await adapter.get('key1')
      const result2 = await adapter.get('key2')
      const result3 = await adapter.get('key3')

      expect(result1).toBe('value1')
      expect(result2).toBeUndefined()
      expect(result3).toBe('value3')
    })

    it('should refresh LRU position on set of existing key', async () => {
      const adapter = createMemoryAdapter<string>({ maxSize: 2 })

      await adapter.set('key1', 'value1')
      await adapter.set('key2', 'value2')
      await adapter.set('key1', 'value1updated') // Update key1 to refresh LRU position
      await adapter.set('key3', 'value3') // Should evict key2

      const result1 = await adapter.get('key1')
      const result2 = await adapter.get('key2')

      expect(result1).toBe('value1updated')
      expect(result2).toBeUndefined()
    })
  })

  describe('stats', () => {
    it('should track hits and misses', async () => {
      const adapter = createMemoryAdapter<string>()

      await adapter.set('key1', 'value1')
      await adapter.get('key1') // hit
      await adapter.get('key2') // miss
      await adapter.get('key2') // miss

      const stats = await adapter.stats()
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(2)
    })

    it('should track evictions', async () => {
      const adapter = createMemoryAdapter<string>({ maxSize: 2 })

      await adapter.set('key1', 'value1')
      await adapter.set('key2', 'value2')
      await adapter.set('key3', 'value3') // evicts key1
      await adapter.set('key4', 'value4') // evicts key2

      const stats = await adapter.stats()
      expect(stats.evictions).toBe(2)
    })

    it('should track size', async () => {
      const adapter = createMemoryAdapter<string>({ maxSize: 5 })

      await adapter.set('key1', 'value1')
      await adapter.set('key2', 'value2')
      await adapter.delete('key1')

      const stats = await adapter.stats()
      expect(stats.size).toBe(1)
    })
  })
})
