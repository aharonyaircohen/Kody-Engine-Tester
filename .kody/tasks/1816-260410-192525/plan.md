## Existing Patterns Found

- **Factory middleware pattern**: `createRateLimiterMiddleware(config)` returns a `(request: NextRequest) => NextResponse` function — reused for timeout middleware
- **Config interface**: `XxxMiddlewareConfig` interface for typed configuration
- **Test structure**: `vi.useFakeTimers()` + `afterEach(() => vi.useRealTimers())` + `makeRequest()` helper pattern from rate-limiter.test.ts and request-logger.test.ts

## Plan

### Step 1: Write tests for timeout middleware

**File:** `src/middleware/timeout-middleware.test.ts`
**Change:** Create test file with:
- `makeRequest()` helper matching existing pattern
- Tests for: timeout returns 504, non-timeout returns NextResponse.next(), timeout with fake timers
- Uses `vi.useFakeTimers()` and `afterEach(() => vi.useRealTimers())` pattern
**Verify:** `pnpm test:int src/middleware/timeout-middleware.test.ts`

### Step 2: Create timeout middleware implementation

**File:** `src/middleware/timeout-middleware.ts`
**Change:** Create:
- `TimeoutMiddlewareConfig` interface with `timeoutMs: number`
- `createTimeoutMiddleware(config)` factory returning middleware function
- Uses `setTimeout` to track elapsed time; returns 504 if exceeded
- Follows same factory pattern as rate-limiter middleware
**Verify:** `pnpm test:int src/middleware/timeout-middleware.test.ts` passes

### Step 3: Verify all middleware tests pass

**File:** `src/middleware/*.test.ts`
**Change:** Run full middleware test suite
**Verify:** `pnpm test:int src/middleware/`
