# Add a retry utility with exponential backoff

Create a retry utility that wraps async functions with configurable retry logic.

Requirements:
- Function: retry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>
- Options: maxRetries (default 3), initialDelay (default 1000ms), maxDelay (default 30000ms), backoffFactor (default 2)
- Exponential backoff: delay doubles each attempt, capped at maxDelay
- Should rethrow the last error if all retries fail
- Should support an optional shouldRetry predicate: (error: Error) => boolean
- Save to src/utils/retry.ts with tests in src/utils/retry.test.ts
- Tests should use vi.useFakeTimers() to avoid actual delays