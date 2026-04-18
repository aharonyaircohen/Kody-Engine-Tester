# Plan: Cache System with Fallback — `decompose-2515-260418-035622`

## Context

Implement a pluggable caching system for the LearnHub LMS:
- `redisAdapter.ts` statically imports `ioredis` (not installed in `package.json`) → throws at import time, triggering fallback
- `memoryAdapter.ts` wraps the existing `Cache` class from `src/utils/cache.ts`
- `cacheManager.ts` uses dynamic import + `Result<T, E>` to select the right adapter
- `cacheMiddleware.ts` integrates the cache into the Next.js request pipeline

This simulates a sub-task failure so the Kody decompose pipeline's fallback behavior (sub-task failure → `runPipeline()`) can be verified.

## Files to Create

### 1. `src/cache/cacheAdapter.ts`
Shared interface + config types for all adapters.

```typescript
export interface CacheAdapterConfig {
  maxSize?: number
  defaultTTL?: number // ms, null = no expiry
}

export interface CacheAdapter {
  get(key: string): Promise<string | undefined>
  set(key: string, value: string, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  stats(): Promise<{ hits: number; misses: number; evictions: number; size: number }>
  dispose(): Promise<void>
}
```

### 2. `src/cache/memoryAdapter.ts`
Wraps the existing `Cache<string, string>` from `src/utils/cache.ts` — no external dependencies.

```typescript
import { Cache } from '@/utils/cache'
import type { CacheAdapter, CacheAdapterConfig } from './cacheAdapter'

export class MemoryAdapter implements CacheAdapter {
  private readonly cache: Cache<string, string>

  constructor(config: CacheAdapterConfig = {}) {
    this.cache = new Cache<string, string>({
      maxSize: config.maxSize ?? Infinity,
      defaultTTL: config.defaultTTL ?? null,
    })
  }

  async get(key: string): Promise<string | undefined> {
    return this.cache.get(key)
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    this.cache.set(key, value, ttl)
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  async stats() {
    return this.cache.stats()
  }

  async dispose(): Promise<void> {
    this.cache.clear()
  }
}
```

### 3. `src/cache/redisAdapter.ts`
Statically imports `ioredis` → throws `MODULE_NOT_FOUND` at import time when the package is absent. This is the sub-task "failure" that triggers the pipeline fallback.

```typescript
import Redis from 'ioredis'
import type { CacheAdapter, CacheAdapterConfig } from './cacheAdapter'

export interface RedisAdapterConfig extends CacheAdapterConfig {
  url: string
}

export class RedisAdapter implements CacheAdapter {
  private readonly client: Redis

  constructor(config: RedisAdapterConfig) {
    this.client = new Redis(config.url, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    })
  }

  async get(key: string): Promise<string | undefined> {
    return this.client.get(key) as Promise<string | undefined>
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl !== undefined) {
      await this.client.setex(key, Math.floor(ttl / 1000), value)
    } else {
      await this.client.set(key, value)
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key)
  }

  async clear(): Promise<void> {
    await this.client.flushdb()
  }

  async stats() {
    const info = await this.client.info('stats')
    // Parse hits/misses from Redis INFO stats
    const hits = parseRedisStat(info, 'keyspace_hits') ?? 0
    const misses = parseRedisStat(info, 'keyspace_misses') ?? 0
    return { hits, misses, evictions: 0, size: 0 }
  }

  async dispose(): Promise<void> {
    await this.client.quit()
  }
}

function parseRedisStat(info: string, key: string): number | undefined {
  const match = info.match(new RegExp(`^${key}:(\\d+)$`, 'm'))
  return match ? parseInt(match[1], 10) : undefined
}
```

### 4. `src/cache/cacheManager.ts`
Dynamic import of `redisAdapter.ts` so that `ioredis`'s `MODULE_NOT_FOUND` is caught at runtime, not compile time. Uses `Result<T, E>` from `src/utils/result.ts`.

```typescript
import { ok, err, type Result } from '@/utils/result'
import type { CacheAdapter, CacheAdapterConfig } from './cacheAdapter'
import { MemoryAdapter } from './memoryAdapter'

export interface CacheManagerOptions {
  adapter?: 'redis' | 'memory' | 'auto'
  redisUrl?: string
  defaultConfig?: CacheAdapterConfig
}

export interface CacheManager {
  getAdapter(): Promise<Result<CacheAdapter, Error>>
  adapter: CacheAdapter | null
  stats(): Promise<{ hits: number; misses: number; evictions: number; size: number }>
  dispose(): Promise<void>
}

export async function createCacheManager(
  options: CacheManagerOptions = {}
): Promise<CacheManager> {
  const { adapter: preferred = 'auto', redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379', defaultConfig = {} } = options
  let activeAdapter: CacheAdapter | null = null

  async function resolveAdapter(): Promise<Result<CacheAdapter, Error>> {
    if (preferred === 'memory') {
      activeAdapter = new MemoryAdapter(defaultConfig)
      return ok(activeAdapter)
    }

    if (preferred === 'redis') {
      const redisResult = await tryLoadRedisAdapter(redisUrl, defaultConfig)
      if (redisResult.ok) {
        activeAdapter = redisResult.value
        return ok(activeAdapter)
      }
      // Redis forced but failed → return error
      return err(redisResult.error)
    }

    // 'auto': try Redis first, fall back to Memory
    const redisResult = await tryLoadRedisAdapter(redisUrl, defaultConfig)
    if (redisResult.ok) {
      activeAdapter = redisResult.value
      return ok(activeAdapter)
    }

    // Fall back to in-memory
    activeAdapter = new MemoryAdapter(defaultConfig)
    return ok(activeAdapter)
  }

  return {
    get adapter() { return activeAdapter },
    getAdapter: resolveAdapter,
    async stats() {
      if (!activeAdapter) return { hits: 0, misses: 0, evictions: 0, size: 0 }
      return activeAdapter.stats()
    },
    async dispose() {
      if (activeAdapter) {
        await activeAdapter.dispose()
        activeAdapter = null
      }
    },
  }
}

async function tryLoadRedisAdapter(
  url: string,
  config: CacheAdapterConfig
): Promise<Result<CacheAdapter, Error>> {
  try {
    // Dynamic import so ioredis MODULE_NOT_FOUND is caught here, not at compile time
    const { RedisAdapter } = await import('./redisAdapter')
    const adapter = new RedisAdapter({ url, ...config })
    // Quick connectivity check
    await adapter.client.ping()
    return ok(adapter)
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)))
  }
}
```

Note: `RedisAdapter` needs to export `client` for the connectivity check. Add to `redisAdapter.ts`:
```typescript
export class RedisAdapter implements CacheAdapter {
  readonly client: Redis  // make public for ping()
  ...
}
```

### 5. `src/middleware/cacheMiddleware.ts`
Express-style middleware for Next.js, following the `request-logger.ts` pattern. Accepts a `CacheManager` and optional key builder.

```typescript
import { NextRequest, NextResponse } from 'next/server'
import type { CacheManager } from '@/cache/cacheManager'

export interface CacheMiddlewareConfig {
  cacheManager: CacheManager
  excludePaths?: string[]
  ttl?: number // default TTL in ms
  keyBuilder?: (request: NextRequest) => string
}

export type NextHandler = (
  request: NextRequest,
  ...args: unknown[]
) => Promise<NextResponse> | NextResponse

export function createCacheMiddleware(config: CacheMiddlewareConfig) {
  const excludePaths = new Set<string>(config.excludePaths ?? ['/api/health', '/favicon.ico'])
  const defaultTTL = config.ttl
  const keyBuilder = config.keyBuilder ?? defaultKeyBuilder

  return async function cacheMiddleware(
    request: NextRequest,
    handler: NextHandler
  ): Promise<NextResponse> {
    const path = request.nextUrl.pathname
    if (excludePaths.has(path) || request.method !== 'GET') {
      return handler(request)
    }

    const adapter = config.cacheManager.adapter
    if (!adapter) {
      return handler(request)
    }

    const cacheKey = keyBuilder(request)
    const cached = await adapter.get(cacheKey)

    if (cached !== undefined) {
      return new NextResponse(cached, {
        headers: {
          'X-Cache': 'HIT',
          'Content-Type': 'application/json',
        },
      })
    }

    // Intercept the response to cache it
    const response = await handler(request)

    if (response.status >= 200 && response.status < 300) {
      const body = await response.text()
      adapter.set(cacheKey, body, defaultTTL).catch(() => {})
      return new NextResponse(body, {
        status: response.status,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'X-Cache': 'MISS',
        },
      })
    }

    return response
  }
}

function defaultKeyBuilder(request: NextRequest): string {
  return `cache:${request.nextUrl.pathname}:${request.nextUrl.search}`
}
```

## Verification

1. Run `pnpm tsc --noEmit` — zero type errors
2. Run `pnpm test:int` — Vitest integration tests pass
3. Confirm `ioredis` is not in `package.json` (static import in `redisAdapter.ts` will throw `MODULE_NOT_FOUND` at runtime only)
4. The dynamic import in `cacheManager.ts` catches the failure and falls back to `MemoryAdapter`
5. If a test is added, `cacheManager` with `adapter: 'auto'` should silently use `MemoryAdapter` when ioredis is absent
