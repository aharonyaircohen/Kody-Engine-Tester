
### taskify (2026-04-07T21:25:44)
{
  "task_type": "feature",
  "title": "Add cache invalidation middleware",
  "description": "Create cache invalidation middleware that intercepts POST/PUT/DELETE requests to specified routes, maintains a list of cache keys to invalidate, and exports createCacheInvalidationMiddleware function. Include comprehensive tests.",
  "scope": [
    "src/middleware/cache-invalidation.ts",
    "src/middleware/cache-invalidation.test.ts"
  ],
  "risk_level": "medium",
  "existing_patterns": [
    "src/midd
...(truncated)

### plan (2026-04-07T21:26:13)
## Existing Patterns Found

- `src/middleware/rate-limiter.ts`: Factory pattern `createRateLimiterMiddleware(config)` returns middleware function with attached `.limiter` property for test access; config interface with typed options; in-memory `Map` store with cleanup/destroy lifecycle
- `src/middleware/rate-limiter.test.ts`: vitest with `describe`/`it`/`expect`/`vi`; `afterEach` cleanup with `destroy()` pattern; `makeRequest` helper; fake timers for time-based scenarios
- `src/middleware/reques
...(truncated)

### build (2026-04-07T21:27:44)
Done. Implementation complete:

**Created files:**
- `src/middleware/cache-invalidation.ts` — `CacheInvalidationStore` class with in-memory Map for tracking cache keys, and `createCacheInvalidationMiddleware(config)` factory that intercepts POST/PUT/DELETE requests to configured routes
- `src/middleware/cache-invalidation.test.ts` — 24 tests covering store operations, route matching, method filtering, and debug header

**Results:**
- 24/24 tests passing
- Zero lint errors in new files

