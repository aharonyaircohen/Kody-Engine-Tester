
### taskify (2026-04-10T19:27:57)
{
  "task_type": "feature",
  "title": "Add timeout middleware with tests",
  "description": "Create a timeout middleware at src/middleware/timeout-middleware.ts that accepts a timeout in milliseconds, aborts requests exceeding the timeout, and returns 504 Gateway Timeout. Tests should be in src/middleware/timeout-middleware.test.ts following existing vitest patterns.",
  "scope": ["src/middleware/timeout-middleware.ts", "src/middleware/timeout-middleware.test.ts"],
  "risk_level": "medium",
  "
...(truncated)

### plan (2026-04-10T19:28:22)
## Existing Patterns Found

- **Factory middleware pattern**: `createRateLimiterMiddleware(config)` returns a `(request: NextRequest) => NextResponse` function — reused for timeout middleware
- **Config interface**: `XxxMiddlewareConfig` interface for typed configuration
- **Test structure**: `vi.useFakeTimers()` + `afterEach(() => vi.useRealTimers())` + `makeRequest()` helper pattern from rate-limiter.test.ts and request-logger.test.ts

## Plan

### Step 1: Write tests for timeout middleware

*
...(truncated)

### build (2026-04-10T19:29:53)
## Summary

I've completed the task. Here's what was implemented:

**Files Created:**

1. **`src/middleware/timeout-middleware.ts`** - Implementation with:
   - `TimeoutMiddlewareConfig` interface with `timeoutMs: number`
   - `createTimeoutMiddleware(config)` factory returning a `(request: NextRequest) => NextResponse` middleware
   - Returns 504 with JSON `{ "error": "Gateway Timeout" }` when elapsed time >= timeoutMs
   - Returns `NextResponse.next()` when within timeout

2. **`src/middleware
...(truncated)
