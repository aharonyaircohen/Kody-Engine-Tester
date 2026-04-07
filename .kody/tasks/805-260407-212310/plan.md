## Existing Patterns Found

- `src/middleware/rate-limiter.ts`: Factory pattern `createRateLimiterMiddleware(config)` returns middleware function with attached `.limiter` property for test access; config interface with typed options; in-memory `Map` store with cleanup/destroy lifecycle
- `src/middleware/rate-limiter.test.ts`: vitest with `describe`/`it`/`expect`/`vi`; `afterEach` cleanup with `destroy()` pattern; `makeRequest` helper; fake timers for time-based scenarios
- `src/middleware/request-logger.ts`: Attaches `.middleware` property to returned object; exports `LogEntry` interface

## Plan

**Step 1: Write test file** `src/middleware/cache-invalidation.test.ts`

**File:** `src/middleware/cache-invalidation.test.ts`
**Change:** Create full test suite following `rate-limiter.test.ts` pattern:
- `CacheInvalidationStore` class unit tests (add/delete/invalidate/reset)
- `createCacheInvalidationMiddleware` integration tests (route matching, method filtering, key attachment)
- `makeRequest` helper
- `afterEach` cleanup with `destroy()` pattern

**Verify:** `pnpm test:int src/middleware/cache-invalidation.test.ts`

---

**Step 2: Write implementation** `src/middleware/cache-invalidation.ts`

**File:** `src/middleware/cache-invalidation.ts`
**Change:** Create:
- `CacheInvalidationStore` class with in-memory `Map<pattern, Set(cacheKey)>`; methods: `add(pattern, cacheKey)`, `invalidate(pattern)`, `reset()`, `destroy()`
- `CacheInvalidationConfig` interface: `{ routes?: RoutePattern[]; debug?: boolean }`
- `RoutePattern` type: `string` (exact or prefix pattern like `/api/courses`)
- `createCacheInvalidationMiddleware(config)` factory returning middleware function with attached `.store` property
- Middleware intercepts POST/PUT/DELETE, matches `request.nextUrl.pathname` against registered routes, calls `store.invalidate()` on match

**Verify:** `pnpm test:int src/middleware/cache-invalidation.test.ts`

---

**Step 3: Lint**

**Verify:** `pnpm lint src/middleware/cache-invalidation.ts src/middleware/cache-invalidation.test.ts`
