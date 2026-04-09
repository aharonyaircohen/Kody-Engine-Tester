# [mem-20260409-1429] M03: Add retry utility

Create `retry<T>(fn: () => Promise<T>, maxAttempts: number, delayMs: number): Promise<T>` in `src/utils/async-helpers.ts` with exponential backoff. With tests

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `851-260409-143054` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24195748708))

To rerun: `@kody rerun 851-260409-143054 --from <stage>`

