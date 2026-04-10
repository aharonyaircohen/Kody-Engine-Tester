
### taskify (2026-04-10T00:25:58)
```json
{
  "task_type": "feature",
  "title": "Add retry utility to async-helpers",
  "description": "Create retry<T>(fn: () => Promise<T>, maxAttempts: number, delayMs: number): Promise<T> in src/utils/async-helpers.ts with exponential backoff and co-located tests",
  "scope": [
    "src/utils/async-helpers.ts",
    "src/utils/async-helpers.test.ts"
  ],
  "risk_level": "low",
  "existing_patterns": [
    "src/utils/retry.ts - existing retry implementation with exponential backoff for referenc
...(truncated)

### build (2026-04-10T00:28:30)

Implementation complete.

**Created files:**

1. **`src/utils/async-helpers.ts`** - `retry<T>(fn, maxAttempts, delayMs)` with exponential backoff
2. **`src/utils/async-helpers.test.ts`** - 6 tests using vitest fake timers

**Implementation summary:**
- `retry` retries up to `maxAttempts` times
- Uses exponential backoff: delay doubles each retry (`delayMs * 2^attempt`)
- Throws the last error if all attempts fail
- Returns the successful result on first successful attempt

**Test results:** All
...(truncated)
