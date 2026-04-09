# [run-20260409-2001] T26: Decompose --no-compose flag

## Task
Implement a caching system:
1. Add Redis cache adapter in src/cache/redisAdapter.ts
2. Add in-memory cache adapter in src/cache/memoryAdapter.ts with TTL support
3. Add cache manager in src/cache/cacheManager.ts that selects adapter
4. Add cache middleware in src/middleware/cacheMiddleware.ts

## Command
@kody decompose --no-compose

## Expected
Parallel builds complete, decompose-state.json saved, NO merge/verify/review/ship phases. No PR created.

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-09):
@kody decompose --no-compose

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `decompose-1001-260409-202810` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24211715167))

To rerun: `@kody rerun decompose-1001-260409-202810 --from <stage>`

**@aharonyaircohen** (2026-04-09):
🤔 **Kody has questions before proceeding:**

1. Should the Redis adapter use a specific Redis client library (e.g., ioredis, redis), or is there an existing preference in the codebase?
2. What should trigger cache invalidation — manual, time-based expiry, or both?
3. Should the cache middleware operate per-request or per-route (global)?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `1001-260409-203257` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24211862147))

To rerun: `@kody rerun 1001-260409-203257 --from <stage>`

