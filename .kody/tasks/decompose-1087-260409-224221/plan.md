## Existing Patterns Found

- **Cache class (src/utils/cache.ts)**: LRU eviction, TTL support with `expiresAt`, stats tracking (`hits`/`misses`/`evictions`), Map-based storage — reuse its TTL/eviction interface design for both adapters
- **DI Container (src/utils/di-container.ts)**: `createToken<T>()` factory and `Container.register()` pattern — reuse for `cacheManager` with token-based cache adapter registration
- **Result type (src/utils/result.ts)**: `Ok<T, E>` / `Err<T, E>` discriminated union with `fromPromise()` — use in Redis adapter for connection/operation errors
- **rate-limiter middleware (src/middleware/rate-limiter.ts)**: Factory function returning middleware with `keyResolver` config option — reuse for `cacheMiddleware`
- **Test pattern (src/utils/cache.test.ts)**: `vi.useFakeTimers()` for TTL timing tests

---

## Step 1: Add Redis cache adapter

**File:** `src/cache/redisAdapter.ts`
**Change:** Create Redis adapter implementing a cache interface compatible with `Cache` class semantics. Use `ioredis` for Redis client. Expose `get`/`set`/`delete`/`clear`/`has` methods and `Result` error handling. Support TTL via SETEX. Register adapter token in DI container.
**Verify:** `pnpm test:int -- --run src/cache/redisAdapter`

---

## Step 2: Add in-memory cache adapter

**File:** `src/cache/memoryAdapter.ts`
**Change:** Create in-memory adapter with TTL and LRU eviction (reuse `Cache` class internals or extend). Wrap existing `Cache` class. Export adapter interface and factory. Register in DI container.
**Verify:** `pnpm test:int -- --run src/cache/memoryAdapter`

---

## Step 3: Add cache manager

**File:** `src/cache/cacheManager.ts`
**Change:** Create `CacheManager` class using DI container tokens for adapter resolution. Support adapter switching/fallback. Expose `get`/`set`/`delete` methods. Use `Result` type for error handling.
**Verify:** `pnpm test:int -- --run src/cache/cacheManager`

---

## Step 4: Add cache middleware

**File:** `src/middleware/cacheMiddleware.ts`
**Change:** Create `createCacheMiddleware()` factory following rate-limiter pattern. Accept `cacheManager`, `keyResolver` (request → cache key), `ttl`, and `condition` (fn to decide if request is cacheable). Return Next.js middleware that checks cache before calling `next()`.
**Verify:** `pnpm test:int -- --run src/middleware/cacheMiddleware`

---

## Step 5: Integration tests for cache system

**File:** `src/cache/cache.test.ts`
**Change:** Add integration tests for `cacheManager` with mock Redis and memory adapters. Test TTL expiry, LRU eviction, and error handling via `Result` type.
**Verify:** `pnpm test:int -- --run src/cache`
