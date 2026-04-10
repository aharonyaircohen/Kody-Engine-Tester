Now I have a clear picture of the existing patterns. Let me write the plan.

## Existing Patterns Found

- **Cache class** (`src/utils/cache.ts`): `Cache<K, V>` with TTL, LRU eviction, and stats — reuse this for the memory adapter
- **Middleware factory pattern** (`src/middleware/rate-limiter.ts`): Config interface + factory function returning middleware — reuse for cache middleware
- **DI container** (`src/utils/di-container.ts`): Token-based adapter selection — reuse for cache manager
- **Result type** (`src/utils/result.ts`): `Result<T, E>` discriminated union — use for adapter operation results

## Plan

**Step 1: Define cache adapter interface and types**

**File:** `src/cache/types.ts`
**Change:** Create new file with shared cache adapter interface and types
```typescript
import type { Result } from '@/utils/result'

export interface CacheAdapter<V> {
  get(key: string): Promise<Result<V | null, Error>>
  set(key: string, value: V, ttl?: number): Promise<Result<void, Error>>
  delete(key: string): Promise<Result<void, Error>>
  clear(): Promise<Result<void, Error>>
  has(key: string): Promise<Result<boolean, Error>>
}

export interface CacheAdapterConfig {
  ttl?: number
  maxSize?: number
  prefix?: string
}
```
**Why:** Define a common interface so both Redis and memory adapters are interchangeable
**Verify:** `pnpm tsc --noEmit`

---

**Step 2: Implement memory adapter**

**File:** `src/cache/memoryAdapter.ts`
**Change:** Create memory cache adapter using existing `Cache` class
```typescript
import type { CacheAdapter, CacheAdapterConfig } from './types'
import type { Result } from '@/utils/result'
import { Cache } from '@/utils/cache'
import { ok, err } from '@/utils/result'

export class MemoryCacheAdapter<V> implements CacheAdapter<V> {
  private readonly cache: Cache<string, V>

  constructor(config: CacheAdapterConfig = {}) {
    this.cache = new Cache<string, V>({
      maxSize: config.maxSize ?? Infinity,
      defaultTTL: config.ttl ?? null,
    })
  }

  async get(key: string): Promise<Result<V | null, Error>> {
    try {
      const value = this.cache.get(key)
      return ok(value ?? null)
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)))
    }
  }

  async set(key: string, value: V, ttl?: number): Promise<Result<void, Error>> {
    try {
      this.cache.set(key, value, ttl)
      return ok(undefined)
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)))
    }
  }

  async delete(key: string): Promise<Result<void, Error>> {
    try {
      this.cache.delete(key)
      return ok(undefined)
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)))
    }
  }

  async clear(): Promise<Result<void, Error>> {
    try {
      this.cache.clear()
      return ok(undefined)
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)))
    }
  }

  async has(key: string): Promise<Result<boolean, Error>> {
    try {
      return ok(this.cache.has(key))
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)))
    }
  }
}
```
**Why:** Reuse existing `Cache` class; adapter delegates to it
**Verify:** `pnpm test:int src/cache/memoryAdapter.test.ts`

---

**Step 3: Create Redis adapter (will fail — ioredis not installed)**

**File:** `src/cache/redisAdapter.ts`
**Change:** Create Redis adapter that attempts to import ioredis
```typescript
import type { CacheAdapter, CacheAdapterConfig } from './types'
import type { Result } from '@/utils/result'
import { ok, err } from '@/utils/result'

// ioredis is not installed — this sub-task should fail
import Redis from 'ioredis'

export class RedisCacheAdapter<V> implements CacheAdapter<V> {
  private readonly client: Redis
  private readonly prefix: string
  private readonly defaultTTL?: number

  constructor(config: CacheAdapterConfig & { url?: string } = {}) {
    this.client = new Redis(config.url ?? process.env.REDIS_URL ?? 'redis://localhost:6379')
    this.prefix = config.prefix ?? 'cache:'
    this.defaultTTL = config.ttl
  }

  private serialize(value: V): string {
    return JSON.stringify(value)
  }

  private deserialize(data: string): V {
    return JSON.parse(data) as V
  }

  async get(key: string): Promise<Result<V | null, Error>> {
    try {
      const data = await this.client.get(`${this.prefix}${key}`)
      if (data === null) return ok(null)
      return ok(this.deserialize(data))
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)))
    }
  }

  async set(key: string, value: V, ttl?: number): Promise<Result<void, Error>> {
    try {
      const serialized = this.serialize(value)
      const expiry = ttl ?? this.defaultTTL
      if (expiry) {
        await this.client.setex(`${this.prefix}${key}`, expiry, serialized)
      } else {
        await this.client.set(`${this.prefix}${key}`, serialized)
      }
      return ok(undefined)
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)))
    }
  }

  async delete(key: string): Promise<Result<void, Error>> {
    try {
      await this.client.del(`${this.prefix}${key}`)
      return ok(undefined)
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)))
    }
  }

  async clear(): Promise<Result<void, Error>> {
    try {
      const keys = await this.client.keys(`${this.prefix}*`)
      if (keys.length > 0) {
        await this.client.del(...keys)
      }
      return ok(undefined)
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)))
    }
  }

  async has(key: string): Promise<Result<boolean, Error>> {
    try {
      const exists = await this.client.exists(`${this.prefix}${key}`)
      return ok(exists === 1)
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)))
    }
  }
}
```
**Why:** Redis adapter intended to fail because ioredis is not installed — this tests sub-task failure fallback
**Verify:** `pnpm tsc --noEmit` (will fail on import)

---

**Step 4: Create cache manager with adapter selection**

**File:** `src/cache/cacheManager.ts`
**Change:** Create cache manager that selects adapter based on availability
```typescript
import type { CacheAdapter, CacheAdapterConfig } from './types'
import { MemoryCacheAdapter } from './memoryAdapter'
import { ok, err } from '@/utils/result'
import type { Result } from '@/utils/result'

export type CacheManagerMode = 'memory' | 'redis' | 'auto'

export interface CacheManagerConfig {
  mode?: CacheManagerMode
  memoryConfig?: CacheAdapterConfig
  redisConfig?: CacheAdapterConfig & { url?: string }
}

export class CacheManager<V> {
  private memoryAdapter: CacheAdapter<V>
  private redisAdapter?: CacheAdapter<V>
  private mode: CacheManagerMode

  constructor(config: CacheManagerConfig = {}) {
    this.mode = config.mode ?? 'auto'
    this.memoryAdapter = new MemoryCacheAdapter<V>(config.memoryConfig ?? {})

    if (this.mode === 'redis' || this.mode === 'auto') {
      // Attempt to load Redis adapter; on failure, falls back to memory
      this.tryLoadRedisAdapter(config.redisConfig)
    }
  }

  private tryLoadRedisAdapter(config?: CacheAdapterConfig & { url?: string }): void {
    try {
      // Dynamic import to avoid hard failure at construction time
      const { RedisCacheAdapter } = require('./redisAdapter')
      this.redisAdapter = new RedisCacheAdapter<V>(config ?? {})
    } catch {
      // ioredis not installed or Redis unavailable — use memory only
      this.redisAdapter = undefined
    }
  }

  getAdapter(): CacheAdapter<V> {
    if (this.mode === 'memory') {
      return this.memoryAdapter
    }

    if (this.redisAdapter && this.mode !== 'memory') {
      return this.redisAdapter
    }

    return this.memoryAdapter
  }

  async get(key: string): Promise<Result<V | null, Error>> {
    return this.getAdapter().get(key)
  }

  async set(key: string, value: V, ttl?: number): Promise<Result<void, Error>> {
    return this.getAdapter().set(key, value, ttl)
  }

  async delete(key: string): Promise<Result<void, Error>> {
    return this.getAdapter().delete(key)
  }

  async clear(): Promise<Result<void, Error>> {
    return this.getAdapter().clear()
  }

  async has(key: string): Promise<Result<boolean, Error>> {
    return this.getAdapter().has(key)
  }

  isRedisAvailable(): boolean {
    return this.redisAdapter !== undefined
  }
}
```
**Why:** Manager handles fallback from Redis to memory automatically
**Verify:** `pnpm tsc --noEmit`

---

**Step 5: Create cache middleware**

**File:** `src/middleware/cacheMiddleware.ts`
**Change:** Create cache middleware following existing middleware pattern
```typescript
import { NextRequest, NextResponse } from 'next/server'
import type { CacheManager } from '@/cache/cacheManager'
import type { Result } from '@/utils/result'

export interface CacheMiddlewareConfig {
  cacheManager: CacheManager<unknown>
  cacheKeyResolver?: (request: NextRequest) => string | null
  cacheTTL?: number
  enabled?: boolean
  cacheableMethods?: string[]
  cacheableStatuses?: number[]
}

export function createCacheMiddleware(config: CacheMiddlewareConfig) {
  const {
    cacheManager,
    cacheKeyResolver = (req) => req.nextUrl.pathname,
    cacheTTL,
    enabled = true,
    cacheableMethods = ['GET'],
    cacheableStatuses = [200],
  } = config

  function middleware(request: NextRequest): NextResponse {
    if (!enabled) {
      return NextResponse.next()
    }

    const method = request.method
    if (!cacheableMethods.includes(method)) {
      return NextResponse.next()
    }

    const cacheKey = cacheKeyResolver(request)
    if (!cacheKey) {
      return NextResponse.next()
    }

    // Check cache first
    const cached = cacheManager.get(cacheKey)
    if (cached.ok && cached.value !== null) {
      return NextResponse.json(cached.value)
    }

    // Clone response to intercept and cache
    const response = NextResponse.next()
    response.headers.set('X-Cache-Key', cacheKey)

    return response
  }

  return middleware
}

// Attach cache manager to middleware for access in route handlers
export interface CachedRouteContext {
  cacheManager: CacheManager<unknown>
}

export function createCachedHandler<T>(
  handler: (request: NextRequest, context: CachedRouteContext) => Promise<NextResponse>,
  config: Omit<CacheMiddlewareConfig, 'enabled'>
) {
  const cacheware = createCacheMiddleware({ ...config, enabled: true })

  return async function cachedHandler(request: NextRequest): Promise<NextResponse> {
    const cacheKey = config.cacheKeyResolver?.(request) ?? request.nextUrl.pathname

    // Try cache
    const cached = await config.cacheManager.get(cacheKey)
    if (cached.ok && cached.value !== null) {
      return NextResponse.json(cached.value, {
        headers: { 'X-Cache-Hit': 'true', 'X-Cache-Key': cacheKey },
      })
    }

    // Execute handler
    const response = await handler(request, { cacheManager: config.cacheManager })

    // Cache successful responses
    if (config.cacheableStatuses?.includes(response.status) && request.method === 'GET') {
      const data = await response.json().catch(() => null)
      if (data !== null) {
        await config.cacheManager.set(cacheKey, data, config.cacheTTL)
      }
    }

    return response
  }
}
```
**Why:** Follows existing middleware factory pattern from rate-limiter and request-logger
**Verify:** `pnpm tsc --noEmit`

---

**Step 6: Add memory adapter test**

**File:** `src/cache/memoryAdapter.test.ts`
**Change:** Create test following existing vitest pattern
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MemoryCacheAdapter } from './memoryAdapter'
import { ok, err } from '@/utils/result'

describe('MemoryCacheAdapter', () => {
  describe('basic operations', () => {
    it('stores and retrieves a value', async () => {
      const adapter = new MemoryCacheAdapter<number>()
      await adapter.set('key', 42)
      const result = await adapter.get('key')
      expect(result.ok).toBe(true)
      expect(result.value).toBe(42)
    })

    it('returns null for missing keys', async () => {
      const adapter = new MemoryCacheAdapter<number>()
      const result = await adapter.get('missing')
      expect(result.ok).toBe(true)
      expect(result.value).toBe(null)
    })

    it('deletes a key', async () => {
      const adapter = new MemoryCacheAdapter<number>()
      await adapter.set('key', 42)
      await adapter.delete('key')
      const result = await adapter.get('key')
      expect(result.value).toBe(null)
    })

    it('clears all keys', async () => {
      const adapter = new MemoryCacheAdapter<number>()
      await adapter.set('a', 1)
      await adapter.set('b', 2)
      await adapter.clear()
      const resultA = await adapter.get('a')
      const resultB = await adapter.get('b')
      expect(resultA.value).toBe(null)
      expect(resultB.value).toBe(null)
    })

    it('has() returns correct boolean', async () => {
      const adapter = new MemoryCacheAdapter<number>()
      await adapter.set('key', 42)
      const hasResult = await adapter.has('key')
      const missingResult = await adapter.has('missing')
      expect(hasResult.value).toBe(true)
      expect(missingResult.value).toBe(false)
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
      expect(result.value).toBe(42)
      vi.advanceTimersByTime(2)
      const expired = await adapter.get('key')
      expect(expired.value).toBe(null)
    })

    it('per-key TTL overrides default', async () => {
      const adapter = new MemoryCacheAdapter<number>({ ttl: 5000 })
      await adapter.set('short', 1, 100)
      vi.advanceTimersByTime(101)
      const shortResult = await adapter.get('short')
      expect(shortResult.value).toBe(null)
    })
  })
})
```
**Why:** TDD — tests created before implementation per project conventions
**Verify:** `pnpm test:int src/cache/memoryAdapter.test.ts`
