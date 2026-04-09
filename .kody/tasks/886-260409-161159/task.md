# [mem-20260409-1611] M03: Add retry utility

Create `retry<T>(fn: () => Promise<T>, maxAttempts: number, delayMs: number): Promise<T>` in `src/utils/async-helpers.ts` with exponential backoff. With tests

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `886-260409-161159` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24200657548))

To rerun: `@kody rerun 886-260409-161159 --from <stage>`

