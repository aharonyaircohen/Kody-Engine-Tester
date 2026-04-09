## Existing Patterns Found

- `src/utils/cache.ts` - `Cache<K, V>` class with TTL support, LRU eviction, and stats; **reused** as the underlying cache store
- `src/middleware/rate-limiter.ts` - Next.js middleware factory pattern: factory returns a middleware function with a `.limiter` property exposing the internal store; **reused** for the cache middleware structure
- `src/middleware/rate-limiter.test.ts` - vitest with `afterEach` + `vi.useRealTimers()` cleanup; `vi.useFakeTimers()` for time-based tests; **reused** for cache middleware tests

## Plan

**Step 1: Write tests for cache middleware**
**File:** `src/middleware/cache-middleware.test.ts`
**Change:** Create full test suite covering: cache hit/miss, TTL expiry, key generation, HTTP methods filtering (GET only), cache miss passthrough, stats exposure, and destroy/reset lifecycle
**Why:** TDD — tests drive the implementation shape
**Verify:** `pnpm test:int src/middleware/cache-middleware.test.ts`

---

**Step 2: Implement cache middleware**
**File:** `src/middleware/cache-middleware.ts`
**Change:** Create `createCacheMiddleware(config)` factory using `Cache<string, NextResponse>` from `src/utils/cache.ts`, with configurable `defaultTTL`, `maxSize`, `keyResolver`, `cacheableMethods`, and cache headers
**Why:** Reuses existing `Cache` utility and follows the `rate-limiter` factory pattern
**Verify:** `pnpm test:int src/middleware/cache-middleware.test.ts`

---

**Step 3: Verify all tests pass**
**Verify:** `pnpm test:int src/middleware/cache-middleware.test.ts`

---

## Questions

No questions — the task is clear and patterns are well-established.
