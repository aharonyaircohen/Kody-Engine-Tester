# [run-20260411-1601] T26: Decompose: --no-compose flag

Implement a caching system:
1. Add Redis cache adapter in src/cache/redisAdapter.ts
2. Add in-memory cache adapter in src/cache/memoryAdapter.ts with TTL support
3. Add cache manager in src/cache/cacheManager.ts that selects adapter
4. Add cache middleware in src/middleware/cacheMiddleware.ts

Use @kody decompose --no-compose to stop after parallel builds.

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-11):
@kody decompose --no-compose

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `decompose-1915-260411-160351` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286227941))

To rerun: `@kody rerun decompose-1915-260411-160351 --from <stage>`

