# Plan: Implement Caching System with Multiple Adapters

## Pattern Discovery Report

- **src/utils/cache.ts**: `Cache<K, V>` class with TTL, LRU eviction, and stats — reused by memoryAdapter
- **src/middleware/rate-limiter.ts**: `createRateLimiterMiddleware` factory pattern with `middleware.limiter` property attachment
- **src/middleware/request-logger.ts**: `createRequestLogger` factory returning `{ middleware, ...methods }` structure
- **src/utils/middleware.ts**: Express-style `Pipeline<TContext>` with `use()` and `useError()` chainable methods
- **src/middleware/rate-limiter.test.ts**: Co-located test file with `vi.fn()` mocks

---

## Step 1: Add unit tests for memoryAdapter

**File:** `src/cache/memoryAdapter.test.ts`
**Change:** Create tests for `createMemoryAdapter` following the pattern in `src/utils/cache.test.ts`:
- Basic get/set/has/delete/clear operations
- TTL expiry using `vi.useFakeTimers()`
- LRU eviction when maxSize exceeded
- Stats tracking (hits, misses, evictions, size)
**Why:** TDD — tests must exist before implementation changes
**Verify:** `pnpm test:int src/cache/memoryAdapter.test.ts`

---

## Step 2: Add unit tests for cacheManager

**File:** `src/cache/cacheManager.test.ts`
**Change:** Create tests for `createCacheManager`:
- Routes get/set/delete/has/clear to correct adapter
- Falls back to defaultAdapter when not specified
- stats() aggregates or returns per-adapter stats
**Why:** TDD — ensure cache manager correctly routes to adapters
**Verify:** `pnpm test:int src/cache/cacheManager.test.ts`

---

## Step 3: Fix cacheMiddleware to work correctly

**File:** `src/middleware/cacheMiddleware.ts`
**Change:** The current implementation cannot cache `NextResponse.next()` because it has no body. Fix by:
1. For cached HIT: return the cached response directly (with X-Cache: HIT header)
2. For cached MISS: still call NextResponse.next() but set X-Cache: MISS header — actual response caching must happen at the route handler level, not middleware
3. Add `cacheManager` and `resolveCacheKey` as properties on the returned function (following rate-limiter pattern)
**Why:** Middleware cannot intercept route handler responses — it only sees `NextResponse.next()`. The proper pattern is: middleware checks cache, if miss passes through. True response caching requires route-level integration.
**Verify:** `pnpm test:int src/middleware/cacheMiddleware.test.ts`

---

## Step 4: Add unit tests for cacheMiddleware

**File:** `src/middleware/cacheMiddleware.test.ts`
**Change:** Create tests for `createCacheMiddleware`:
- Returns cached response with X-Cache: HIT header when cache hit
- Passes through with X-Cache: MISS header when cache miss
- Uses custom cacheKeyResolver when provided
- Skips caching when enabled = false
- Attaches cacheManager and resolveCacheKey to returned function
**Why:** TDD — ensure middleware behaves correctly
**Verify:** `pnpm test:int src/middleware/cacheMiddleware.test.ts`

---

## Step 5: Run linting and type checking

**Change:** Run `pnpm lint` and `pnpm typecheck` to ensure no type errors
**Verify:** Commands complete without errors

---

## Step 6: Run all cache-related tests

**Change:** Run `pnpm test:int src/cache/ src/middleware/cacheMiddleware.ts`
**Verify:** All tests pass

---

## Existing Patterns Found

- `src/utils/cache.ts - Cache class with TTL, LRU eviction, and stats to reuse in memoryAdapter`
- `src/middleware/rate-limiter.ts - SlidingWindowRateLimiter class + createRateLimiterMiddleware factory pattern`
- `src/middleware/request-logger.ts - createRequestLogger factory pattern returning { middleware, ...methods }`
- `src/utils/middleware.ts - Pipeline middleware chain pattern for composition`
- Co-located test files (`.test.ts` next to source) with `vi.useFakeTimers()` for time-based tests