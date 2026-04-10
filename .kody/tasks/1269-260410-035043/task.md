# [mem-20260410-0349] M03: Add retry utility

Create `retry<T>(fn: () => Promise<T>, maxAttempts: number, delayMs: number): Promise<T>` in `src/utils/async-helpers.ts` with exponential backoff. With tests

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1269-260410-035043` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24225392880))

To rerun: `@kody rerun 1269-260410-035043 --from <stage>`

