# [run-20260407-2121] T02: Add middleware with tests

## Task
Add a cache invalidation middleware in src/middleware/cache-invalidation.ts that clears relevant cache entries when certain routes are hit.

## Requirements
- Create middleware that intercepts POST/PUT/DELETE requests to specified routes
- Maintains a list of cache keys to invalidate
- Exports createCacheInvalidationMiddleware function
- Add tests in src/middleware/cache-invalidation.test.ts

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-07):
@kody full

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `805-260407-212310` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24105088553))

To rerun: `@kody rerun 805-260407-212310 --from <stage>`

