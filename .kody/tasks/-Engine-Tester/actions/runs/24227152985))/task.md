# [run-20260410-0437] T30: Decompose: sub-task failure fallback

## Task
Test that sub-task failure in decompose triggers cleanup and fallback to normal pipeline.

## Task Description
Implement a caching system:
1. Add Redis cache adapter in src/cache/redisAdapter.ts (requires 'ioredis' package — NOT installed, should fail)
2. Add in-memory cache adapter in src/cache/memoryAdapter.ts with TTL support
3. Add cache manager in src/cache/cacheManager.ts that selects adapter
4. Add cache middleware in src/middleware/cacheMiddleware.ts

## Test Steps
1. Create this temp issue
2. Comment @kody decompose
3. Verify: Sub-task failure detected
4. Verify: Worktrees cleaned up
5. Verify: Fallback to normal pipeline

## Expected
- Sub-task failure triggers cleanup
- Falls back to normal pipeline

---

## Discussion (5 comments)

**@aharonyaircohen** (2026-04-10):
@kody decompose

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `decompose-1342-260410-044717` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24226833792))

To rerun: `@kody rerun decompose-1342-260410-044717 --from <stage>`

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24226833792))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24227035243))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24226833792)) --from <stage>`

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24227035243))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24227152985))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24227035243)) --from <stage>`

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24227152985))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24227213615))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24227152985)) --from <stage>`

