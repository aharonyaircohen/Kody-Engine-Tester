# [mem-20260409-2331] M14: Add cache wrapper

Create `withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T>` in `src/services/cache-wrapper.ts` using in-memory Map with TTL expiry. With tests

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `1138-260409-234600` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24218924448))

To rerun: `@kody rerun 1138-260409-234600 --from <stage>`

