All 136 middleware tests pass. Here's a summary of the implementation:

## Created Files

**`src/middleware/timeout-middleware.ts`**
- Factory function `createTimeoutMiddleware(config)` with configurable `defaultTimeoutMs` (default: 30s)
- Reads `req.timeout` from `NextRequest` extended property for per-request override
- Uses `setTimeout` for timeout enforcement with proper cleanup on normal completion
- Returns 504 `NextResponse` with `{ error: 'Gateway Timeout' }` when handler exceeds timeout
- Emits 'timeout' event via `addTimeoutListener`/`removeTimeoutListener` helper functions using a `WeakMap` to store listeners per request
- Catches handler errors and returns 500 response

**`src/middleware/timeout-middleware.test.ts`**
- 10 tests covering:
  - Returns 504 when handler exceeds timeout
  - Does not timeout when handler completes within timeout
  - Uses `req.timeout` when set on request
  - Uses default timeout (30s) when `req.timeout` not set
  - Cleanup on normal completion
  - Emits timeout event when timeout occurs
  - Handles immediate response without timeout
  - Handles handler errors with 500 response
  - Does not double-timeout after first timeout
  - Uses 30 second default when no config provided
