# Plan: Cache System with Decompose Fallback (P3T30)

## Context

Implement a 4-file caching layer in `src/cache/` and `src/middleware/` using the existing `Cache` class from `src/utils/cache.ts` as the in-memory fallback. The key scenario: `redisAdapter.ts` requires `ioredis` which is **not installed** — when `@kody decompose` splits the task into sub-tasks, the `ioredis` dynamic `import()` fails, decompose catches the failure, runs cleanup, and falls back to `runPipeline()` completing via the normal path using `MemoryCacheAdapter`.

## Reused Patterns

| Pattern | Source File | Usage |
|---|---|---|
| In-memory LRU Cache | `src/utils/cache.ts` | Extended as `MemoryCacheAdapter` |
| `createToken<T>` + `DIDisposable` | `src/utils/di-container.ts` | Token-based DI for cache lifecycle |
| `Result<T,E>`, `ok()`, `err()`, `tryCatch()` | `src/utils/result.ts` | Discriminated union for explicit error handling |
| Factory middleware pattern | `src/utils/middleware.ts` | `Pipeline<TContext>` + `Middleware<TContext>` for `cacheMiddleware` |
| Express-style chainable middleware | `src/middleware/request-logger.ts` | Reference pattern for `createCacheMiddleware` factory |
| Vitest testing | `vitest.config.mts` | Co-located `.test.ts` files, `vi.useFakeTimers()` for TTL |

## Files to Create

### 1. `src/cache/memoryAdapter.ts`

Subclass of `Cache<K, V>` that re-exports it as a named `MemoryCacheAdapter`. The `Cache` class already implements all `CacheAdapter` operations (`set`, `get`, `has`, `delete`, `clear`, `stats`). Adds `DIDisposable` so the DI container can call `dispose()` at shutdown.

```typescript
import { Cache } from '@/utils/cache'
import type { DIDisposable } from '@/utils/di-container'

export interface CacheStats { hits: number; misses: number; evictions: number; size: number }

export interface CacheAdapter<K, V> {
  set(key: K, value: V, ttl?: number): void
  get(key: K): V | undefined
  has(key: K): boolean
  delete(key: K): void
  clear(): void
  stats(): CacheStats
}

export class MemoryCacheAdapter<K, V>
  extends Cache<K, V>
  implements CacheAdapter<K, V>, DIDisposable
{
  dispose(): void { this.clear() }
}
```

### 2. `src/cache/redisAdapter.ts`

Attempts dynamic `import('ioredis')` at module load time. Uses `tryCatch` to return `Result<RedisCacheAdapter, Error>` — since `ioredis` is not installed, the `Err` branch is taken and `CacheManager` falls back to `MemoryCacheAdapter`. Includes the full `RedisCacheAdapter` class for when `ioredis` is present.

```typescript
import { tryCatch } from '@/utils/result'
import type { CacheAdapter } from './memoryAdapter'

export const createRedisAdapter: () => Result<RedisCacheAdapter, Error> = tryCatch(() => {
  // Dynamic import — fails at runtime when ioredis is not installed
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Redis = require('ioredis') as typeof import('ioredis')
  return new RedisCacheAdapter(new Redis())
})

export class RedisCacheAdapter implements CacheAdapter<string, unknown>, DIDisposable {
  constructor(private client: import('ioredis').Redis) {}
  // set/get/has/delete/clear/stats delegating to this.client
  async dispose(): Promise<void> { await this.client.quit() }
}
```

### 3. `src/cache/cacheManager.ts`

Central orchestrator. On construction, calls `createRedisAdapter()`. If `result.ok === false`, logs the error and falls back to `MemoryCacheAdapter`. Also registers cache tokens in the provided `Container`.

```typescript
import { createToken, type DIDisposable, Container } from '@/utils/di-container'
import { ok, err } from '@/utils/result'
import type { CacheAdapter, CacheStats } from './memoryAdapter'
import { MemoryCacheAdapter } from './memoryAdapter'
import { createRedisAdapter } from './redisAdapter'

export const CACHE_ADAPTER_TOKEN = createToken<CacheAdapter<unknown, unknown>>('cache-adapter')
export const CACHE_MANAGER_TOKEN = createToken<CacheManager>('cache-manager')

export class CacheManager implements DIDisposable {
  readonly adapter: CacheAdapter<unknown, unknown>
  readonly source: 'memory' | 'redis'

  constructor(private container: Container) {
    const redisResult = createRedisAdapter()
    if (redisResult.ok) {
      this.adapter = redisResult.value
      this.source = 'redis'
    } else {
      // ioredis not available — fall back to in-memory
      this.adapter = new MemoryCacheAdapter()
      this.source = 'memory'
    }

    // Register in container for dependent services
    this.container.registerSingleton(CACHE_ADAPTER_TOKEN, () => this.adapter)
    this.container.registerSingleton(CACHE_MANAGER_TOKEN, () => this)
  }

  dispose(): void {
    if ('dispose' in this.adapter && typeof this.adapter.dispose === 'function') {
      this.adapter.dispose()
    }
  }
}
```

### 4. `src/middleware/cache-middleware.ts`

Factory function compatible with `Pipeline<CacheContext>` from `src/utils/middleware.ts`. Wraps the cache adapter with an HTTP-oriented middleware.

```typescript
import type { Middleware } from '@/utils/middleware'
import type { CacheAdapter } from '@/cache/memoryAdapter'

export interface CacheContext {
  request: Request
  cacheKey: string
  cacheHit?: boolean
  cachedValue?: unknown
}

export interface CacheMiddlewareConfig {
  cache: CacheAdapter<unknown, unknown>
  keyFn: (request: Request) => string
  ttl?: number
  responseEncoder?: (data: unknown) => Response
  responseDecoder?: (response: Response) => Promise<unknown>
}

export function createCacheMiddleware(config: CacheMiddlewareConfig): Middleware<CacheContext> {
  return async (ctx, next) => {
    ctx.cacheKey = config.keyFn(ctx.request)

    const cached = config.cache.get(ctx.cacheKey)
    if (cached !== undefined) {
      ctx.cacheHit = true
      ctx.cachedValue = cached
      return  // short-circuit: cache hit
    }

    ctx.cacheHit = false
    await next()

    // After downstream handlers populate ctx.cachedValue, cache it
    if (ctx.cachedValue !== undefined) {
      config.cache.set(ctx.cacheKey, ctx.cachedValue, config.ttl)
    }
  }
}
```

## Test Files (TDD order — tests first)

### 5. `src/cache/memoryAdapter.test.ts`

Tests the adapter wrapper around `Cache`. Key assertions: wraps all `Cache` operations, `dispose()` clears the cache.

### 6. `src/cache/cacheManager.test.ts`

Tests fallback logic. Mocks the dynamic `import('ioredis')` to throw `MODULE_NOT_FOUND`, asserts `CacheManager` uses `MemoryCacheAdapter` and `source === 'memory'`. Also tests that `CACHE_ADAPTER_TOKEN` is registered in the container.

### 7. `src/middleware/cache-middleware.test.ts`

Uses `createPipeline` from `src/utils/middleware`. Asserts: cache miss → next() called → value cached; cache hit → next() NOT called.

### 8. `src/cache/redisAdapter.test.ts`

Tests that `createRedisAdapter()` returns `Err` when `ioredis` is unavailable. Uses `vi.mock('ioredis')` to simulate missing package.

## Implementation Order

1. `memoryAdapter.test.ts` → `memoryAdapter.ts`
2. `cacheManager.test.ts` → `cacheManager.ts`
3. `cache-middleware.test.ts` → `src/middleware/cache-middleware.ts`
4. `redisAdapter.ts` (added last — `ioredis` import fails, triggers decompose fallback)
5. `redisAdapter.test.ts`

## Verification

```bash
pnpm test:int   # All Vitest tests pass (including new cache tests)
pnpm tsc --noEmit  # Zero TypeScript errors
```

Expected end-to-end behavior: `ioredis` dynamic import in `redisAdapter.ts` throws `MODULE_NOT_FOUND`, `tryCatch` wraps it as `Err`, `CacheManager` constructor enters the fallback branch, `source === 'memory'`, pipeline completes using `MemoryCacheAdapter`.