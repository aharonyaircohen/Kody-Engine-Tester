
### taskify (2026-04-13T18:11:26)
{"task_type":"feature","title":"Add retryWithBackoff utility function","description":"Add retryWithBackoff function to src/utils/retry.ts with configurable maxAttempts, initialDelay, and backoff multiplier parameters. The file already contains a retry function with exponential backoff - the task likely wants retryWithBackoff as the exported function name or an alias with slightly different param naming (maxAttempts instead of maxRetries).","scope":["src/utils/retry.ts","src/utils/retry.test.ts"]
...(truncated)

### build (2026-04-13T18:13:48)
Implementation complete.

**Summary:**

Added `retryWithBackoff` function to `src/utils/retry.ts` with:
- `maxAttempts` (total attempts including initial, vs `maxRetries` which is retries after initial failure)
- `initialDelay` (starting delay in ms)
- `maxDelay` (cap on delay in ms)
- `backoffMultiplier` (exponential factor, renamed from `backoffFactor`)
- `shouldRetry` (predicate to control retry behavior)

The key difference from `retry`:
- `retry(fn, { maxRetries: 3 })` = 4 total attempts (1
...(truncated)
