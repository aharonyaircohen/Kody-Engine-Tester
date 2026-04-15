
### taskify (2026-04-15T17:41:14)
{
  "task_type": "feature",
  "title": "Add retryWithBackoff function to utils/retry.ts",
  "description": "Add a retryWithBackoff function to src/utils/retry.ts that provides exponential backoff retry logic with configurable maxAttempts (total attempts), initialDelay, and backoffMultiplier. This is a simpler variant of the existing retry function, focused on basic backoff without shouldRetry predicate or maxDelay cap.",
  "scope": ["src/utils/retry.ts"],
  "risk_level": "low",
  "existing_patte
...(truncated)

### build (2026-04-15T17:42:06)
The implementation is complete. I've added the `retryWithBackoff` function to `src/utils/retry.ts` with:

- **`maxAttempts`** (default: 3) - total number of attempts
- **`initialDelay`** (default: 1000ms) - starting delay before first retry
- **`backoffMultiplier`** (default: 2) - exponential backoff multiplier

The function is a simpler variant of the existing `retry` function, without `shouldRetry` predicate or `maxDelay` cap as specified in the task.

