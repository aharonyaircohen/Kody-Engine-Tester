
### taskify (2026-04-10T03:55:24)
All 7 tests pass. Here's the classification:

```json
{
  "task_type": "feature",
  "title": "Add retry utility with exponential backoff",
  "description": "Created `src/utils/async-helpers.ts` with `retry<T>(fn: () => Promise<T>, maxAttempts: number, delayMs: number): Promise<T>` implementing exponential backoff. Also created co-located test file with 7 tests covering: first attempt success, retries on failure, max attempts enforcement, exponential backoff timing, error propagation, non-Error r
...(truncated)

### build (2026-04-10T03:57:28)
The implementation is complete and verified:

**`src/utils/async-helpers.ts`** - `retry<T>` function with:
- Proper JSDoc documentation
- Exponential backoff: `delay * 2^attempt` (e.g., 1000ms → 1000ms → 2000ms → 4000ms...)
- Handles non-Error rejections by converting to Error
- Throws the last error if all attempts fail

**`src/utils/async-helpers.test.ts`** - 7 tests covering:
- First attempt success
- Retry then success
- Max attempts exhaustion
- Exponential backoff timing
- Last error propa
...(truncated)
