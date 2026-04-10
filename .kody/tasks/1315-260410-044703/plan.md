Now I have enough context to write the plan.

## Plan

### Step 1: Create cache adapter interface

**File:** `src/cache/adapters.ts`
**Change:** Create a shared `CacheAdapter` interface that both memory and Redis adapters will implement
**Why:** Provides type safety and ensures both adapters have a consistent API
**Verify:** `pnpm tsc --noEmit`

```typescript
export interface CacheAdapter {
  get<T>(key: string): Promise<T | undefined>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  has(key: string): Promise<boolean>
}

export interface CacheAdapterStats {
  hits: number
  misses: number
  evictions: number
  size: number
}

export interface MonitoringCacheAdapter extends CacheAdapter {
  stats(): Promise<CacheAdapterStats>
}
```

---

### Step 2: Create memory adapter implementation

**File:** `src/cache/memoryAdapter.ts`
**Change:** Create memory adapter wrapping existing `Cache` class from `src/utils/cache.ts`
**Why:** Reuses existing well-tested LRU cache implementation with TTL support
**Verify:** `pnpm test src/cache/memoryAdapter.test.ts`

```typescript
import { Cache } from '@/utils/cache'
import type { CacheAdapter, MonitoringCacheAdapter, CacheAdapterStats } from './adapters'

export class MemoryCacheAdapter implements MonitoringCacheAdapter {
  private readonly cache: Cache<string, unknown>

  constructor(options: { maxSize?: number; defaultTTL?: number } = {}) {
    this.cache = new Cache(options)
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get(key) as T | undefined
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    this.cache.set(key, value, ttl)
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  async has(key: string): Promise<boolean> {
    return this.cache.has(key)
  }

  async stats(): Promise<CacheAdapterStats> {
    const s = this.cache.stats()
    return { hits: s.hits, misses: s.misses, evictions: s.evictions, size: s.size }
  }
}
```

---

### Step 3: Create memory adapter tests

**File:** `src/cache/memoryAdapter.test.ts`
**Change:** Add vitest tests for MemoryCacheAdapter
**Why:** TDD - tests written before implementation per project conventions
**Verify:** `pnpm test src/cache/memoryAdapter.test.ts`

```typescript
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
```

---

### Step 4: Create Redis adapter interface stub

**File:** `src/cache/redisAdapter.ts`
**Change:** Create Redis adapter with ioredis dependency (to be added later)
**Why:** Provides Redis-backed cache for distributed deployments
**Verify:** `pnpm tsc --noEmit`

```typescript
import type { CacheAdapter, MonitoringCacheAdapter, CacheAdapterStats } from './adapters'

export interface RedisCacheAdapterOptions {
  url?: string
  keyPrefix?: string
  defaultTTL?: number
}

export class RedisCacheAdapter implements MonitoringCacheAdapter {
  constructor(_options: RedisCacheAdapterOptions = {}) {
    // TODO: Initialize ioredis client
    throw new Error('Redis client not yet implemented - ioredis dependency needed')
  }

  async get<T>(_key: string): Promise<T | undefined> {
    throw new Error('Redis client not yet implemented')
  }

  async set<T>(_key: string, _value: T, _ttl?: number): Promise<void> {
    throw new Error('Redis client not yet implemented')
  }

  async delete(_key: string): Promise<void> {
    throw new Error('Redis client not yet implemented')
  }

  async clear(): Promise<void> {
    throw new Error('Redis client not yet implemented')
  }

  async has(_key: string): Promise<boolean> {
    throw new Error('Redis client not yet implemented')
  }

  async stats(): Promise<CacheAdapterStats> {
    throw new Error('Redis client not yet implemented')
  }
}
```

---

### Step 5: Create cache manager

**File:** `src/cache/cacheManager.ts`
**Change:** Create cache manager that selects adapter based on configuration/environment
**Why:** Provides a unified interface to the cache subsystem with adapter selection logic
**Verify:** `pnpm tsc --noEmit`

```typescript
import type { CacheAdapter, MonitoringCacheAdapter } from './adapters'
import { MemoryCacheAdapter } from './memoryAdapter'
import { RedisCacheAdapter, type RedisCacheAdapterOptions } from './redisAdapter'

export type CacheManagerOptions = {
  adapter?: 'memory' | 'redis'
  redis?: RedisCacheAdapterOptions
  memory?: { maxSize?: number; defaultTTL?: number }
}

export class CacheManager implements MonitoringCacheAdapter {
  private readonly adapter: MonitoringCacheAdapter

  constructor(options: CacheManagerOptions = {}) {
    const adapterType = options.adapter ?? (process.env.REDIS_URL ? 'redis' : 'memory')

    if (adapterType === 'redis') {
      this.adapter = new RedisCacheAdapter(options.redis)
    } else {
      this.adapter = new MemoryCacheAdapter(options.memory)
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.adapter.get<T>(key)
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    return this.adapter.set(key, value, ttl)
  }

  async delete(key: string): Promise<void> {
    return this.adapter.delete(key)
  }

  async clear(): Promise<void> {
    return this.adapter.clear()
  }

  async has(key: string): Promise<boolean> {
    return this.adapter.has(key)
  }

  async stats(): Promise<{ hits: number; misses: number; evictions: number; size: number }> {
    return this.adapter.stats()
  }
}

export const cacheManager = new CacheManager()
```

---

### Step 6: Verify all tests pass

**Verify:** `pnpm test src/cache/`

---

## Existing Patterns Found

- **Cache class** (`src/utils/cache.ts`): Existing in-memory LRU cache with TTL — reused by MemoryCacheAdapter wrapper
- **Result type** (`src/utils/result.ts`): Discriminated union pattern — not needed here as adapter methods throw on error (simpler for caching)
- **DI Container** (`src/utils/di-container.ts`): Token-based registration — CacheManager could be registered as singleton but kept simple as module-level instance
- **Service pattern**: Constructor injection pattern — MemoryCacheAdapter and RedisCacheAdapter use similar constructor options pattern

---

## Questions

- **Redis dependency**: The Redis adapter is stubbed because ioredis is not installed. Should we add `ioredis` as a dependency, or keep the stub until Redis is actually needed? Recommendation: Keep stub until explicitly requested.
