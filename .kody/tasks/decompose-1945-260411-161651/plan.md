I've created the plan. Here's the summary:

## Plan Summary

The caching system implementation has partial skeletons but needs:
1. **Tests for `memoryAdapter.ts`** - Unit tests following existing `cache.test.ts` patterns
2. **Tests for `cacheManager.ts`** - Unit tests for adapter routing
3. **Fix `cacheMiddleware.ts`** - Current implementation cannot work because `NextResponse.next()` has no body to cache. Middleware can only check cache and pass through; actual response caching requires route-level integration
4. **Tests for `cacheMiddleware.ts`** - Unit tests for middleware behavior

**Key Issue Found:** The `cacheMiddleware.ts` tries to cache `NextResponse.next()` responses, but these have no body. In Next.js, middleware cannot intercept route handler responses - it only sees the `NextResponse.next()` passthrough. The proper pattern is: middleware checks cache → if HIT return cached response, if MISS pass through. True response caching happens at the route handler level.

**Existing patterns reused:**
- `Cache<K,V>` class from `src/utils/cache.ts` for the memory adapter
- `createRateLimiterMiddleware` factory pattern from `src/middleware/rate-limiter.ts`
- Co-located `.test.ts` files with `vi.useFakeTimers()` for time-based tests

The plan is written to `.kody/tasks/decompose-1945-260411-161651/PLAN.md`.
