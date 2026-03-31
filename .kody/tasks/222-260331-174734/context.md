
### taskify (2026-03-31T17:50:28)
The `retry` utility already exists and all tests pass (1653 passed). The implementation at `src/utils/retry.ts` includes:

- **Exponential backoff** with configurable `initialDelay`, `backoffFactor`, and `maxDelay`
- **Retry count** via `maxRetries` option
- **Selective retrying** via `shouldRetry` predicate
- **8 comprehensive tests** covering success, retries, backoff timing, max delay capping, and error handling

The task is already complete.


### build (2026-03-31T17:51:08)
The retry utility is complete and working:

**Implementation** (`src/utils/retry.ts`):
- Exponential backoff with configurable `initialDelay`, `backoffFactor`, and `maxDelay`
- Retry count via `maxRetries` option (default: 3)
- Selective retrying via `shouldRetry` predicate
- Proper error handling and propagation

**Tests** (`src/utils/retry.test.ts`):
- ✓ Succeeds on first attempt
- ✓ Retries and succeeds on second attempt  
- ✓ Retries maxRetries times before throwing
- ✓ Uses exponential back
...(truncated)
