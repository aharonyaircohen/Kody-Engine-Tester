import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { CacheManager } from './cacheManager'
import { MemoryCacheAdapterImpl, createMemoryAdapter } from './memoryAdapter'
import { RedisCacheAdapterImpl, createRedisAdapter, type RedisClient } from './redisAdapter'

describe('MemoryCacheAdapter', () => {
  describe('basic operations', () => {
    it('stores and retrieves a value', async () => {
      const adapter = createMemoryAdapter()
      await adapter.set('key1', 'value1')
      const result = await adapter.get('key1')
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toBe('value1')
      }
    })

    it('returns undefined for missing keys', async () => {
      const adapter = createMemoryAdapter()
      const result = await adapter.get('missing')
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toBeUndefined()
      }
    })

    it('has() returns true for existing keys', async () => {
      const adapter = createMemoryAdapter()
      await adapter.set('key1', 'value1')
      const result = await adapter.has('key1')
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toBe(true)
      }
    })

    it('has() returns false for missing keys', async () => {
      const adapter = createMemoryAdapter()
      const result = await adapter.has('missing')
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toBe(false)
      }
    })

    it('delete() removes a key', async () => {
      const adapter = createMemoryAdapter()
      await adapter.set('key1', 'value1')
      await adapter.delete('key1')
      const result = await adapter.get('key1')
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toBeUndefined()
      }
    })

    it('clear() removes all keys', async () => {
      const adapter = createMemoryAdapter()
      await adapter.set('key1', 'value1')
      await adapter.set('key2', 'value2')
      await adapter.clear()
      const get1 = await adapter.get('key1')
      const get2 = await adapter.get('key2')
      expect(get1.isOk() && get1.value).toBeUndefined()
      expect(get2.isOk() && get2.value).toBeUndefined()
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
      const adapter = createMemoryAdapter({ defaultTTL: 1000 })
      await adapter.set('key1', 'value1')
      vi.advanceTimersByTime(999)
      const result = await adapter.get('key1')
      expect(result.isOk() && result.value).toBe('value1')
    })

    it('get() returns undefined after TTL expires', async () => {
      const adapter = createMemoryAdapter({ defaultTTL: 1000 })
      await adapter.set('key1', 'value1')
      vi.advanceTimersByTime(1001)
      const result = await adapter.get('key1')
      expect(result.isOk() && result.value).toBeUndefined()
    })

    it('per-key TTL overrides defaultTTL', async () => {
      const adapter = createMemoryAdapter({ defaultTTL: 1000 })
      await adapter.set('short', '1', 200)
      await adapter.set('long', '2', 2000)

      vi.advanceTimersByTime(500)
      const shortResult = await adapter.get('short')
      const longResult = await adapter.get('long')
      expect(shortResult.isOk() && shortResult.value).toBeUndefined()
      expect(longResult.isOk() && longResult.value).toBe('2')
    })
  })

  describe('LRU eviction', () => {
    it('evicts least recently used when maxSize exceeded', async () => {
      const adapter = createMemoryAdapter({ maxSize: 3 })
      await adapter.set('a', '1')
      await adapter.set('b', '2')
      await adapter.set('c', '3')
      await adapter.set('d', '4')

      const aResult = await adapter.get('a')
      const bResult = await adapter.get('b')
      const cResult = await adapter.get('c')
      const dResult = await adapter.get('d')

      expect(aResult.isOk() && aResult.value).toBeUndefined()
      expect(bResult.isOk() && bResult.value).toBe('2')
      expect(cResult.isOk() && cResult.value).toBe('3')
      expect(dResult.isOk() && dResult.value).toBe('4')
    })
  })
})

describe('CacheManager', () => {
  describe('adapter registration', () => {
    it('registers a memory adapter', () => {
      const manager = new CacheManager()
      const adapter = createMemoryAdapter()
      manager.registerAdapter('memory', adapter, true)

      const result = manager.getAdapter('memory')
      expect(result.isOk()).toBe(true)
    })

    it('returns error for unregistered adapter', () => {
      const manager = new CacheManager()
      const result = manager.getAdapter('nonexistent')
      expect(result.isErr()).toBe(true)
    })

    it('sets primary adapter', () => {
      const manager = new CacheManager()
      const memoryAdapter = createMemoryAdapter()
      const redisClient = createMockRedisClient()
      const redisAdapter = createRedisAdapter(redisClient)

      manager.registerAdapter('memory', memoryAdapter, true)
      manager.registerAdapter('redis', redisAdapter, false)

      manager.setPrimaryAdapter('redis')
      const primary = manager.getPrimaryAdapter()
      expect(primary.isOk()).toBe(true)
    })
  })

  describe('CRUD operations', () => {
    it('sets and gets a value', async () => {
      const manager = new CacheManager()
      const adapter = createMemoryAdapter()
      manager.registerAdapter('memory', adapter, true)

      const setResult = await manager.set('key1', 'value1')
      expect(setResult.isOk()).toBe(true)

      const getResult = await manager.get('key1')
      expect(getResult.isOk()).toBe(true)
      if (getResult.isOk()) {
        expect(getResult.value).toBe('value1')
      }
    })

    it('returns undefined for missing key', async () => {
      const manager = new CacheManager()
      const adapter = createMemoryAdapter()
      manager.registerAdapter('memory', adapter, true)

      const result = await manager.get('missing')
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toBeUndefined()
      }
    })

    it('deletes a key', async () => {
      const manager = new CacheManager()
      const adapter = createMemoryAdapter()
      manager.registerAdapter('memory', adapter, true)

      await manager.set('key1', 'value1')
      const deleteResult = await manager.delete('key1')
      expect(deleteResult.isOk()).toBe(true)

      const getResult = await manager.get('key1')
      expect(getResult.isOk()).toBe(true)
      if (getResult.isOk()) {
        expect(getResult.value).toBeUndefined()
      }
    })

    it('checks has() correctly', async () => {
      const manager = new CacheManager()
      const adapter = createMemoryAdapter()
      manager.registerAdapter('memory', adapter, true)

      await manager.set('key1', 'value1')
      const hasResult = await manager.has('key1')
      expect(hasResult.isOk()).toBe(true)
      if (hasResult.isOk()) {
        expect(hasResult.value).toBe(true)
      }

      const hasMissingResult = await manager.has('missing')
      expect(hasMissingResult.isOk()).toBe(true)
      if (hasMissingResult.isOk()) {
        expect(hasMissingResult.value).toBe(false)
      }
    })

    it('clears all keys', async () => {
      const manager = new CacheManager()
      const adapter = createMemoryAdapter()
      manager.registerAdapter('memory', adapter, true)

      await manager.set('key1', 'value1')
      await manager.set('key2', 'value2')
      const clearResult = await manager.clear()
      expect(clearResult.isOk()).toBe(true)

      const get1 = await manager.get('key1')
      const get2 = await manager.get('key2')
      expect(get1.isOk() && get1.value).toBeUndefined()
      expect(get2.isOk() && get2.value).toBeUndefined()
    })
  })

  describe('TTL handling', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('respects default TTL', async () => {
      const manager = new CacheManager({ defaultTTL: 1000 })
      const adapter = createMemoryAdapter()
      manager.registerAdapter('memory', adapter, true)

      await manager.set('key1', 'value1')
      vi.advanceTimersByTime(999)
      const beforeResult = await adapter.get('key1')
      expect(beforeResult.isOk() && beforeResult.value).toBe('value1')

      vi.advanceTimersByTime(2)
      const afterResult = await adapter.get('key1')
      expect(afterResult.isOk() && afterResult.value).toBeUndefined()
    })

    it('uses per-key TTL when provided', async () => {
      const manager = new CacheManager({ defaultTTL: 5000 })
      const adapter = createMemoryAdapter()
      manager.registerAdapter('memory', adapter, true)

      await manager.set('key1', 'value1', 1000)
      vi.advanceTimersByTime(999)
      const beforeResult = await adapter.get('key1')
      expect(beforeResult.isOk() && beforeResult.value).toBe('value1')

      vi.advanceTimersByTime(2)
      const afterResult = await adapter.get('key1')
      expect(afterResult.isOk() && afterResult.value).toBeUndefined()
    })
  })

  describe('key prefixing', () => {
    it('applies key prefix', async () => {
      const manager = new CacheManager({ keyPrefix: 'test:' })
      const adapter = createMemoryAdapter()
      manager.registerAdapter('memory', adapter, true)

      await manager.set('key1', 'value1')
      const result = await adapter.get('test:key1')
      expect(result.isOk() && result.value).toBe('value1')
    })
  })

  describe('error handling', () => {
    it('returns error for unregistered primary adapter operations', async () => {
      const manager = new CacheManager()
      const result = await manager.get('key1')
      expect(result.isErr()).toBe(true)
    })

    it('returns error when setting primary on unregistered adapter', () => {
      const manager = new CacheManager()
      const result = manager.setPrimaryAdapter('nonexistent')
      expect(result.isErr()).toBe(true)
    })
  })
})

function createMockRedisClient(): RedisClient {
  return {
    get: vi.fn(),
    set: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
    exists: vi.fn(),
    connect: vi.fn(),
    quit: vi.fn(),
    scanStream: vi.fn(),
  }
}

describe('RedisCacheAdapterImpl', () => {
  let mockRedisClient: RedisClient

  beforeEach(() => {
    vi.clearAllMocks()
    mockRedisClient = createMockRedisClient()
  })

  it('creates adapter with config', () => {
    const adapter = new RedisCacheAdapterImpl(mockRedisClient, {
      keyPrefix: 'test:',
    })
    expect(adapter).toBeDefined()
  })

  it('get() returns Result with value', async () => {
    mockRedisClient.get = vi.fn((_key: string, cb: (err: Error | null, result: string | null) => void) => cb(null, 'cached-value'))

    const adapter = new RedisCacheAdapterImpl(mockRedisClient)
    const result = await adapter.get('key1')

    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toBe('cached-value')
    }
  })

  it('get() returns Result with undefined for missing key', async () => {
    mockRedisClient.get = vi.fn((_key: string, cb: (err: Error | null, result: string | null) => void) => cb(null, null))

    const adapter = new RedisCacheAdapterImpl(mockRedisClient)
    const result = await adapter.get('missing')

    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toBeUndefined()
    }
  })

  it('set() with TTL uses setex', async () => {
    mockRedisClient.setex = vi.fn((_key: string, _ttl: number, _value: string, cb: (err: Error | null) => void) => cb(null))

    const adapter = new RedisCacheAdapterImpl(mockRedisClient)
    const result = await adapter.set('key1', 'value1', 5000)

    expect(result.isOk()).toBe(true)
    expect(mockRedisClient.setex).toHaveBeenCalledWith('cache:key1', 5, 'value1', expect.any(Function))
  })

  it('set() without TTL uses set', async () => {
    mockRedisClient.set = vi.fn((_key: string, _value: string, cb: (err: Error | null) => void) => cb(null))

    const adapter = new RedisCacheAdapterImpl(mockRedisClient)
    const result = await adapter.set('key1', 'value1')

    expect(result.isOk()).toBe(true)
    expect(mockRedisClient.set).toHaveBeenCalledWith('cache:key1', 'value1', expect.any(Function))
  })

  it('delete() returns Result.ok', async () => {
    mockRedisClient.del = vi.fn((_key: string, cb: (err: Error | null, result: number) => void) => cb(null, 1))

    const adapter = new RedisCacheAdapterImpl(mockRedisClient)
    const result = await adapter.delete('key1')

    expect(result.isOk()).toBe(true)
  })

  it('has() returns true when key exists', async () => {
    mockRedisClient.exists = vi.fn((_key: string, cb: (err: Error | null, result: number) => void) => cb(null, 1))

    const adapter = new RedisCacheAdapterImpl(mockRedisClient)
    const result = await adapter.has('key1')

    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toBe(true)
    }
  })

  it('has() returns false when key does not exist', async () => {
    mockRedisClient.exists = vi.fn((_key: string, cb: (err: Error | null, result: number) => void) => cb(null, 0))

    const adapter = new RedisCacheAdapterImpl(mockRedisClient)
    const result = await adapter.has('missing')

    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toBe(false)
    }
  })
})
