
### taskify (2026-04-10T00:02:20)
Now I have a clear understanding. Based on the codebase exploration:

1. **Existing patterns**: 
   - `src/utils/retry.ts` - utility function for retrying operations with exponential backoff
   - `src/middleware/rate-limiter.ts` - Next.js route middleware following factory pattern (`createRateLimiterMiddleware`)
   - `src/utils/middleware.ts` - Express-style middleware pipeline

2. **Task requirements**:
   - Create retry middleware in `src/middleware/retry-middleware.ts`
   - Retry failed HTTP 
...(truncated)

### plan (2026-04-10T00:03:16)
## Plan: Add Retry Middleware with Tests

### Step 1: Create test file for retry middleware
**File:** `src/middleware/retry-middleware.test.ts`
**Change:** Create comprehensive tests following the pattern from `rate-limiter.test.ts`:
- Tests for middleware creation with default and custom options
- Tests for retry on network errors (5xx responses)
- Tests that verify exponential backoff is correctly calculated
- Tests that verify max retry limit is respected
- Tests for configurable retry condit
...(truncated)

### build (2026-04-10T00:11:33)
All 142 middleware tests pass (including the 16 new retry middleware tests).

## Summary

I've implemented the retry middleware with tests:

**`src/middleware/retry-middleware.ts`** - Contains:
- `RetryMiddlewareConfig` interface with `maxRetries`, `baseDelay`, `maxDelay`, `backoffFactor`, `shouldRetry`, and `fetchFn` options
- `createRetryMiddleware(config)` factory function following the same pattern as `rate-limiter.ts`
- Exponential backoff with configurable multiplier
- Automatic retry on 5
...(truncated)

### review (2026-04-10T00:15:40)
## Verdict: PASS

## Summary

Implemented a retry middleware factory (`createRetryMiddleware`) in `src/middleware/retry-middleware.ts` with 16 comprehensive tests. The middleware retries failed HTTP requests with configurable exponential backoff, max retries, and retry conditions. All 16 middleware tests pass.

## Findings

### Critical

None.

### Major

None.

### Minor

- `src/middleware/retry-middleware.ts:96` — `middleware` function is declared returning `NextResponse` but `executeWithRetry
...(truncated)
