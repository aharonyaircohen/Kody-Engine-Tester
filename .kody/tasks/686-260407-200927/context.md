
### taskify (2026-04-07T20:12:15)
{
  "task_type": "feature",
  "title": "Add retry utility with exponential backoff",
  "description": "Create `retry<T>(fn: () => Promise<T>, maxAttempts: number, delayMs: number): Promise<T>` in `src/utils/async-helpers.ts` with exponential backoff. The function should retry failed operations with exponential backoff between attempts. Include comprehensive tests.",
  "scope": [
    "src/utils/async-helpers.ts",
    "src/utils/async-helpers.test.ts"
  ],
  "risk_level": "low",
  "existing_patter
...(truncated)

### build (2026-04-07T20:14:27)
Implementation complete:

- **`src/utils/async-helpers.ts`** - Created with `retry<T>(fn, maxAttempts, delayMs)` using exponential backoff
- **`src/utils/async-helpers.test.ts`** - 7 tests covering: first attempt success, retry then success, max attempts exhaustion, exponential backoff delays, last error propagation, single retry, and non-Error rejections
- All 7 tests pass
- TypeScript check passes for the new files (pre-existing errors in codebase are unrelated)

