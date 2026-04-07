# [mem-20260407-2007] Add cache wrapper

Create `withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T>` in `src/services/cache-wrapper.ts` using in-memory Map with TTL expiry. With tests

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-07):
@kody

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `725-260407-204338` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24103476086))

To rerun: `@kody rerun 725-260407-204338 --from <stage>`

