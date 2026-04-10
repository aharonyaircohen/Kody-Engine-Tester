# [mem-20260410-0022] M05: Add debounce utility

Create `debounce<T extends (...args: any[]) => void>(fn: T, delayMs: number): T` in `src/utils/timing-helpers.ts`. With tests

---

## Discussion (5 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1211-260410-002327` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24220018180))

To rerun: `@kody rerun 1211-260410-002327 --from <stage>`

**@aharonyaircohen** (2026-04-10):
🤔 **Kody has questions before proceeding:**

1. Should the implementation be moved from debounce.ts to timing-helpers.ts as specified, or is the current location acceptable?
2. Is the extended signature with DebounceOptions (leading/trailing) acceptable, or should it be simplified to just delayMs?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-10):
@kody approve

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1211-260410-002327` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24220318144))

To rerun: `@kody rerun 1211-260410-002327 --from <stage>`

