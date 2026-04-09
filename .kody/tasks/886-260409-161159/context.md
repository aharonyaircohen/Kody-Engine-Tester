
### taskify (2026-04-09T16:14:47)

{
  "task_type": "feature",
  "title": "Add retry utility with exponential backoff",
  "description": "Create retry<T>(fn: () => Promise<T>, maxAttempts: number, delayMs: number): Promise<T> in src/utils/async-helpers.ts with exponential backoff. Should follow existing utility patterns (single-function file, co-located .test.ts). The existing retry.ts uses an options object; this new utility should use positional params with delayMs as initial delay and default backoffFactor of 2.",
  "scope": 
...(truncated)

### build (2026-04-09T16:18:06)
Done. Created the retry utility:

**`src/utils/async-helpers.ts`** - `retry<T>(fn, maxAttempts, delayMs, backoffFactor?)` with exponential backoff (default factor: 2)

**`src/utils/async-helpers.test.ts`** - 7 tests covering:
- Success on first attempt
- Retry with eventual success
- Exhausts maxAttempts before throwing
- Exponential backoff (delayMs, delayMs*2, delayMs*4...)
- Default backoffFactor of 2
- Last error rethrown
- Success on final attempt

All 7 tests pass. TypeScript compiles clea
...(truncated)
