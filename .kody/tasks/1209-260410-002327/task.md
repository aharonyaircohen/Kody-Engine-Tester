# [mem-20260410-0022] M03: Add retry utility

Create `retry<T>(fn: () => Promise<T>, maxAttempts: number, delayMs: number): Promise<T>` in `src/utils/async-helpers.ts` with exponential backoff. With tests

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1209-260410-002327` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24220017428))

To rerun: `@kody rerun 1209-260410-002327 --from <stage>`

