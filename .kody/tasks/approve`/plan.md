## Implementation Plan

## Existing Patterns Found
- `src/middleware/rate-limiter.ts`: Factory function `createRateLimiterMiddleware(config)` returning middleware with typed config interface, sets response headers, returns `NextResponse`
- `src/middleware/csrf-middleware.ts`: `SAFE_METHODS` array for GET/HEAD/OPTIONS passthrough, async middleware, error response helper with JSON body and headers
- `src/middleware/rate-limiter.test.ts`: Vitest suite with `describe`/`it`/`expect`, `afterEach` cleanup with `vi.useRealTimers()`, `makeRequest` helper for `NextRequest` with headers

## Steps

### Step 1: Create `src/middleware/cors.ts` — CORS middleware implementation
**File:** `src/middleware/cors.ts`
**Change:** Create the CORS middleware factory with:
- `CorsConfig` interface (allowedOrigins, allowedMethods, allowedHeaders, maxAge, allowCredentials)
- `createCorsMiddleware(config)` factory returning `(request: NextRequest) => NextResponse`
- For OPTIONS preflight: return 200 with CORS headers only
- For allowed origins: set all CORS headers and call `NextResponse.next()`
- For disallowed origins (strict 403 per approval): return 403 JSON with CORS headers still set
**Verify:** `pnpm lint src/middleware/cors.ts`

### Step 2: Create `src/middleware/cors.test.ts` — comprehensive tests
**File:** `src/middleware/cors.test.ts`
**Change:** Full vitest suite covering:
- Allowed origin passes through with CORS headers
- Disallowed origin returns 403 with CORS headers
- OPTIONS preflight returns 200 with Access-Control-Max-Age
- Multiple allowed origins support
- Credential headers respected
- Request method and header allowlists
**Verify:** `pnpm test:int src/middleware/cors.test.ts`

### Step 3: Verify linting passes
**Verify:** `pnpm lint src/middleware/cors.ts src/middleware/cors.test.ts`

### Step 4: Run full test suite
**Verify:** `pnpm test:int`

## Questions
No questions — all requirements are specified in the task description and approval comment (strict 403 for disallowed origins).
