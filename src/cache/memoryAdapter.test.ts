import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryAdapter } from './memoryAdapter'
import { Cache } from '@/utils/cache'

describe('MemoryAdapter', () => {
  let adapter: MemoryAdapter
  let cache: Cache<string, string>

  beforeEach(() => {
    vi.clearAllMocks()
    cache = new Cache<string, string>()
    adapter = new MemoryAdapter({ cache })
  })

  describe('get', () => {
    it('returns Ok with value when cache hit', async () => {
      cache.set('key1', 'value1')

      const result = await adapter.get<string>('key1')

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toBe('value1')
      }
    })

    it('returns Ok with undefined when cache miss', async () => {
      const result = await adapter.get<string>('nonexistent')

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toBeUndefined()
      }
    })

    it('returns Ok with undefined when entry is expired', async () => {
      cache.set('expiredKey', 'expiredValue', -1000) // Already expired

      const result = await adapter.get<string>('expiredKey')

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toBeUndefined()
      }
    })

    it('returns Err on cache error', async () => {
      // Create a broken cache that throws on get
      const brokenCache = {
        get: vi.fn().mockImplementation(() => {
          throw new Error('Cache error')
        }),
      } as unknown as Cache<string, string>
      const brokenAdapter = new MemoryAdapter({ cache: brokenCache })

      const result = await brokenAdapter.get<string>('key1')

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(Error)
        expect(result.error.message).toBe('Cache error')
      }
    })
  })

  describe('set', () => {
    it('returns Ok when setting a value without TTL', async () => {
      const result = await adapter.set('key1', 'value1')

      expect(result.isOk()).toBe(true)
      expect(cache.get('key1')).toBe('value1')
    })

    it('returns Ok when setting a value with TTL', async () => {
      const result = await adapter.set('key1', 'value1', 5000)

      expect(result.isOk()).toBe(true)
      expect(cache.get('key1')).toBe('value1')
    })

    it('overwrites existing value', async () => {
      cache.set('key1', 'oldValue')

      const result = await adapter.set('key1', 'newValue')

      expect(result.isOk()).toBe(true)
      expect(cache.get('key1')).toBe('newValue')
    })

    it('returns Err on cache error', async () => {
      const brokenCache = {
        set: vi.fn().mockImplementation(() => {
          throw new Error('Cache set error')
        }),
      } as unknown as Cache<string, string>
      const brokenAdapter = new MemoryAdapter({ cache: brokenCache })

      const result = await brokenAdapter.set('key1', 'value1')

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(Error)
        expect(result.error.message).toBe('Cache set error')
      }
    })
  })

  describe('delete', () => {
    it('returns Ok when deleting existing key', async () => {
      cache.set('key1', 'value1')

      const result = await adapter.delete('key1')

      expect(result.isOk()).toBe(true)
      expect(cache.get('key1')).toBeUndefined()
    })

    it('returns Ok when deleting nonexistent key', async () => {
      const result = await adapter.delete('nonexistent')

      expect(result.isOk()).toBe(true)
    })

    it('returns Err on cache error', async () => {
      const brokenCache = {
        delete: vi.fn().mockImplementation(() => {
          throw new Error('Cache delete error')
        }),
      } as unknown as Cache<string, string>
      const brokenAdapter = new MemoryAdapter({ cache: brokenCache })

      const result = await brokenAdapter.delete('key1')

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(Error)
        expect(result.error.message).toBe('Cache delete error')
      }
    })
  })

  describe('constructor', () => {
    it('creates adapter with default cache when no options provided', () => {
      const defaultAdapter = new MemoryAdapter()

      expect(defaultAdapter).toBeInstanceOf(MemoryAdapter)
    })

    it('creates adapter with custom cache options', () => {
      const customAdapter = new MemoryAdapter({ maxSize: 100, defaultTTL: 60000 })

      expect(customAdapter).toBeInstanceOf(MemoryAdapter)
    })

    it('creates adapter with injected cache', () => {
      const injectedCache = new Cache<string, string>()
      const adapterWithCache = new MemoryAdapter({ cache: injectedCache })

      expect(adapterWithCache).toBeInstanceOf(MemoryAdapter)
    })
  })
})