## Existing Patterns Found

- **Factory middleware pattern** (`src/middleware/request-logger.ts`, `rate-limiter.ts`): `createXMiddleware(config)` factory returning a `(request: NextRequest) => NextResponse` function
- **Test pattern** (`src/middleware/request-logger.test.ts`): `makeRequest` helper, `vi.useFakeTimers()`, header verification via `response.headers.has/get`
- **Header naming convention**: `X-Request-Id` in request-logger, `X-RateLimit-*` in rate-limiter → `X-Response-Time` follows

## Plan

**Step 1: Create test file for request timing middleware**

**File:** `src/middleware/request-timing.test.ts`
**Change:** Write tests following the request-logger.test.ts pattern:
- `makeRequest` helper
- `createRequestTiming` factory test
- Verify `X-Response-Time` header is set on response
- Verify header value is in milliseconds
- Verify excludePaths works
- Test with fake timers

**Verify:** `pnpm test:int src/middleware/request-timing.test.ts`

---

**Step 2: Create the request timing middleware**

**File:** `src/middleware/request-timing.ts`
**Change:** Implement `createRequestTiming` factory:
```typescript
import { NextRequest, NextResponse } from 'next/server'

export interface RequestTimingConfig {
  excludePaths?: string[]
}

export function createRequestTiming(config: RequestTimingConfig = {}) {
  const excludePaths = new Set(config.excludePaths ?? ['/health', '/favicon.ico'])

  return function middleware(request: NextRequest): NextResponse {
    const path = request.nextUrl.pathname
    if (excludePaths.has(path)) {
      return NextResponse.next()
    }

    const startTime = Date.now()
    const response = NextResponse.next()
    response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`)
    return response
  }
}
```

**Verify:** `pnpm test:int src/middleware/request-timing.test.ts`

---

**Step 3: Verify all middleware tests pass**

**Verify:** `pnpm test:int src/middleware/`

---

## Questions

- None — the task is straightforward following existing middleware patterns.
