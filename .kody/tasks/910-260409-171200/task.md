# [mem-20260409-1611] M14: Add cache wrapper

Create `withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T>` in `src/services/cache-wrapper.ts` using in-memory Map with TTL expiry. With tests

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `910-260409-171200` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24203294601))

To rerun: `@kody rerun 910-260409-171200 --from <stage>`

