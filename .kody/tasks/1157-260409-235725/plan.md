## Plan: Add Retry Middleware with Tests

### Step 1: Create test file for retry middleware
**File:** `src/middleware/retry-middleware.test.ts`
**Change:** Create comprehensive tests following the pattern from `rate-limiter.test.ts`:
- Tests for middleware creation with default and custom options
- Tests for retry on network errors (5xx responses)
- Tests that verify exponential backoff is correctly calculated
- Tests that verify max retry limit is respected
- Tests for configurable retry conditions (shouldRetry predicate)
- Tests for non-retryable errors (4xx responses)

**Verify:** `pnpm test:unit -- src/middleware/retry-middleware.test.ts`

### Step 2: Create retry middleware implementation
**File:** `src/middleware/retry-middleware.ts`
**Change:** Create retry middleware factory following `rate-limiter.ts` pattern:
- Export `RetryMiddlewareConfig` interface with `maxRetries`, `baseDelay`, `maxDelay`, `backoffFactor`, `shouldRetry`
- Export `createRetryMiddleware(config)` factory function
- Middleware wraps the incoming NextRequest, attempts fetch with retry logic using the existing `retry` utility from `src/utils/retry.ts`
- Returns final NextResponse after retries exhausted

**Verify:** Tests from Step 1 pass

---

## Existing Patterns Found

- **Factory pattern**: `rate-limiter.ts` uses `createXxxMiddleware(config)` returning a middleware function — reused
- **Retry utility**: `src/utils/retry.ts` provides exponential backoff retry logic with `RetryOptions` — reused
- **NextRequest/NextResponse**: `request-logger.ts` shows standard Next.js middleware signature — reused
- **Test structure**: `rate-limiter.test.ts` groups tests with `describe()` blocks and uses `vi.useFakeTimers()` for timing tests — reused
