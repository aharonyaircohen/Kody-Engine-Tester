## Existing Patterns Found

- **Cache class** (`src/utils/cache.ts`): LRU in-memory cache with TTL, `set(key, value, ttl?)`, `get(key)`, `has(key)`, `delete(key)`, `clear()`, `stats()` — the memory adapter will wrap this pattern
- **Middleware factory** (`src/middleware/rate-limiter.ts`): `createRateLimiterMiddleware(config)` returns a middleware function with attached properties — cache middleware will follow this factory pattern
- **RequestLogger factory** (`src/middleware/request-logger.ts`): `createRequestLogger(config)` returns an object with `middleware` function — cache middleware uses same pattern
- **DI token pattern** (`src/utils/di-container.ts`): `createToken<T>(name)` for type-safe tokens — cache manager can use for adapter selection

## Plan

**Step 1: Create cache directory and types**

**File:** `src/cache/types.ts` (new)
**Change:** Create `CacheAdapter` interface and `CacheManagerConfig` type
**Why:** Provides shared types for both adapters and manager
**Verify:** `pnpm tsc --noEmit` passes

---

**Step 2: Create memory adapter**

**File:** `src/cache/memoryAdapter.ts` (new)
**Change:** Create `createMemoryAdapter(options?)` factory returning a `CacheAdapter` implementation backed by in-memory Map with TTL support
**Why:** Task requires in-memory adapter with TTL; reuse TTL pattern from existing `Cache` class
**Verify:** `pnpm test:int src/cache/memoryAdapter.test.ts` (if test exists)

---

**Step 3: Create Redis adapter**

**File:** `src/cache/redisAdapter.ts` (new)
**Change:** Create `createRedisAdapter(config)` factory returning a `CacheAdapter` implementation backed by Redis (using `ioredis` client)
**Why:** Task requires Redis adapter; use ioredis as it is well-established
**Verify:** `pnpm tsc --noEmit` passes

---

**Step 4: Create cache manager**

**File:** `src/cache/cacheManager.ts` (new)
**Change:** Create `createCacheManager(config)` that selects memory or Redis adapter based on config, exposes `get`, `set`, `delete`, `clear`, `has` methods
**Why:** Task requires manager that selects adapter; follows DI container token pattern for adapter selection
**Verify:** `pnpm tsc --noEmit` passes

---

**Step 5: Create cache middleware**

**File:** `src/middleware/cacheMiddleware.ts` (new)
**Change:** Create `createCacheMiddleware(config)` following rate-limiter factory pattern, with `keyResolver`, `cacheManager`, `ttl` config options
**Why:** Task requires cache middleware; follows existing middleware factory pattern from rate-limiter.ts
**Verify:** `pnpm tsc --noEmit` passes

---

**Step 6: Add tests for memory adapter**

**File:** `src/cache/memoryAdapter.test.ts` (new)
**Change:** Add vitest tests for memory adapter covering TTL expiry, LRU eviction, stats
**Why:** TDD ordering — test before implementation where possible; existing project uses vitest
**Verify:** `pnpm test:int src/cache/memoryAdapter.test.ts` passes

---

**Step 7: Add tests for cache manager**

**File:** `src/cache/cacheManager.test.ts` (new)
**Change:** Add vitest tests for cache manager covering adapter selection and fallback
**Why:** TDD ordering; existing project uses vitest for testing
**Verify:** `pnpm test:int src/cache/cacheManager.test.ts` passes
