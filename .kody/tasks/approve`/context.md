
### taskify (2026-04-11T02:19:58)

```json
{
  "task_type": "feature",
  "title": "Add CORS middleware with tests",
  "description": "Create a new CORS middleware in src/middleware/cors.ts with comprehensive unit tests in src/middleware/cors.test.ts. The middleware must: (1) set CORS headers (Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers, Access-Control-Max-Age), (2) handle preflight OPTIONS requests, (3) support configurable allowed origins via a config object, (4) return 403 with CORS 
...(truncated)

### plan (2026-04-11T02:20:14)
## Implementation Plan

## Existing Patterns Found
- `src/middleware/rate-limiter.ts`: Factory function `createRateLimiterMiddleware(config)` returning middleware with typed config interface, sets response headers, returns `NextResponse`
- `src/middleware/csrf-middleware.ts`: `SAFE_METHODS` array for GET/HEAD/OPTIONS passthrough, async middleware, error response helper with JSON body and headers
- `src/middleware/rate-limiter.test.ts`: Vitest suite with `describe`/`it`/`expect`, `afterEach` clea
...(truncated)

### build (2026-04-11T02:25:33)
All 29 CORS tests pass and TypeScript compiles without errors for my new files.

## Summary

I implemented the CORS middleware following the existing patterns in the codebase:

**Created `src/middleware/cors.ts`:**
- `CorsConfig` interface with allowed origins, methods, headers, maxAge, and allowCredentials
- `createCorsMiddleware(config)` factory function returning middleware
- Sets CORS headers: `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`, `Acc
...(truncated)

### autofix (2026-04-11T02:27:08)
Changed `let context` to `const context` on line 80. The variable is never reassigned, so this is a safe change that also prevents accidental future reassignment.


### review (2026-04-11T02:30:31)
## Verdict: PASS

## Summary

Created CORS middleware (`src/middleware/cors.ts`) with comprehensive unit tests (`src/middleware/cors.test.ts`, 29 tests) following existing middleware factory patterns from `rate-limiter.ts` and `csrf-middleware.ts`. The middleware handles preflight OPTIONS requests, configurable allowed origins (including wildcard), credentials, and returns 403 with CORS headers for disallowed origins per the approval comment.

## Findings

### Critical
None.

### Major
None.

##
...(truncated)
