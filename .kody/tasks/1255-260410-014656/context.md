
### taskify (2026-04-10T01:49:38)
{
  "task_type": "feature",
  "title": "Add timeout middleware with tests",
  "description": "Create a timeout middleware in `src/middleware/timeout-middleware.ts` that wraps request handlers with configurable timeout (default 30s). Returns 504 Gateway Timeout when exceeded and emits 'timeout' event on the request object. Include unit tests in `timeout-middleware.test.ts`.",
  "scope": [
    "src/middleware/timeout-middleware.ts",
    "src/middleware/timeout-middleware.test.ts"
  ],
  "risk_leve
...(truncated)

### plan (2026-04-10T01:54:46)
All 136 middleware tests pass. Here's a summary of the implementation:

## Created Files

**`src/middleware/timeout-middleware.ts`**
- Factory function `createTimeoutMiddleware(config)` with configurable `defaultTimeoutMs` (default: 30s)
- Reads `req.timeout` from `NextRequest` extended property for per-request override
- Uses `setTimeout` for timeout enforcement with proper cleanup on normal completion
- Returns 504 `NextResponse` with `{ error: 'Gateway Timeout' }` when handler exceeds timeout
...(truncated)

### build (2026-04-10T01:56:36)
All 10 timeout middleware tests pass. The TypeScript errors shown are pre-existing issues unrelated to the timeout middleware (they're in Next.js pages router files and seed helpers).

**Implementation verified:**

| Requirement | Status |
|-------------|--------|
| Factory function `createTimeoutMiddleware(config)` | ✓ |
| Configurable `defaultTimeoutMs` (default 30s) | ✓ |
| Reads `req.timeout` for per-request override | ✓ |
| Returns 504 Gateway Timeout when exceeded | ✓ |
| Emits 'timeout' e
...(truncated)
