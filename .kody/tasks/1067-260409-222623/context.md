
### taskify (2026-04-09T22:29:02)
{
  "task_type": "feature",
  "title": "Add request timing middleware",
  "description": "Create middleware in `src/middleware/request-timing.ts` that measures request duration and adds `X-Response-Time` header with integration test. Should follow existing middleware patterns (factory function, NextRequest/NextResponse, excludePaths config).",
  "scope": [
    "src/middleware/request-timing.ts",
    "src/middleware/request-timing.test.ts"
  ],
  "risk_level": "medium",
  "existing_patterns": [
 
...(truncated)

### plan (2026-04-09T22:29:21)
## Existing Patterns Found

- **Factory middleware pattern** (`src/middleware/request-logger.ts`, `rate-limiter.ts`): `createXMiddleware(config)` factory returning a `(request: NextRequest) => NextResponse` function
- **Test pattern** (`src/middleware/request-logger.test.ts`): `makeRequest` helper, `vi.useFakeTimers()`, header verification via `response.headers.has/get`
- **Header naming convention**: `X-Request-Id` in request-logger, `X-RateLimit-*` in rate-limiter → `X-Response-Time` follows


...(truncated)

### build (2026-04-09T22:30:56)
Implementation complete. Here's a summary:

**Created files:**

1. **`src/middleware/request-timing.ts`** - Factory function `createRequestTiming(config)` that:
   - Returns middleware measuring request duration
   - Adds `X-Response-Time` header with ms format (e.g., `"5ms"`)
   - Supports `excludePaths` config with defaults `['/health', '/favicon.ico']`
   - Follows the same factory pattern as `request-logger.ts` and `rate-limiter.ts`

2. **`src/middleware/request-timing.test.ts`** - 8 tests c
...(truncated)

### review (2026-04-09T22:33:45)
## Verdict: PASS

## Summary

Implements `createRequestTiming` factory middleware in `src/middleware/request-timing.ts` and co-located tests following established middleware patterns from `request-logger.ts` and `rate-limiter.ts`.

## Findings

### Critical

None.

### Major

None.

### Minor

**`src/middleware/request-timing.test.ts:64-71`** — The `measures elapsed time correctly` test advances fake timers by 50ms before calling middleware but asserts the header is `'0ms'`. With `vi.advanceTime
...(truncated)
