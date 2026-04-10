# [mem-20260410-0601] M03: Add retry utility

Create `retry<T>(fn: () => Promise<T>, maxAttempts: number, delayMs: number): Promise<T>` in `src/utils/async-helpers.ts` with exponential backoff. With tests

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1377-260410-060217` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24228951385))

To rerun: `@kody rerun 1377-260410-060217 --from <stage>`

**@aharonyaircohen** (2026-04-10):
🤔 **Kody has questions before proceeding:**

1. Should the retry utility be in `src/utils/async-helpers.ts` specifically (new file), or is the existing `src/utils/retry.ts` sufficient?
2. Should the function signature use direct parameters (`maxAttempts`, `delayMs`) or the existing options-object pattern (`maxRetries`, `initialDelay`, `backoffFactor`, etc.)?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1377-260410-060737` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24229057202))

To rerun: `@kody rerun 1377-260410-060737 --from <stage>`

