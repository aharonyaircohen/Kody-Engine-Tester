# [mem-20260407-2007] Add retry utility

Create `retry<T>(fn: () => Promise<T>, maxAttempts: number, delayMs: number): Promise<T>` in `src/utils/async-helpers.ts` with exponential backoff. With tests

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-07):
@kody

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `686-260407-200927` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24102016117))

To rerun: `@kody rerun 686-260407-200927 --from <stage>`

