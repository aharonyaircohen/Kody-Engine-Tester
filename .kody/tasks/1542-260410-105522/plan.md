## Plan

### Step 1: Write the test file for cache-control middleware

**File:** `src/middleware/cache-control.test.ts`
**Change:** Create test file with `describe` blocks covering:
- `CacheControlType` enum/unit values (public, private, no-store)
- `createCacheControlMiddleware` factory function
- ETag generation and `If-None-Match` conditional request handling
- `Vary: Accept-Encoding` header handling
- Helper `makeRequest` function following existing middleware test pattern

**Why:** TDD — write tests before implementation
**Verify:** `pnpm test:int src/middleware/cache-control.test.ts` (should fail, no implementation yet)

### Step 2: Implement the cache-control middleware

**File:** `src/middleware/cache-control.ts`
**Change:** Create `createCacheControlMiddleware` factory that:
- Accepts config: `{ defaultType, etag, varyAcceptEncoding }`
- Returns middleware `(request: NextRequest) => NextResponse`
- Sets `Cache-Control` header based on response type
- Generates ETag from response body and checks `If-None-Match` for 304
- Sets `Vary: Accept-Encoding` when configured
- Supports `public`, `private`, `no-store` cache types

**Why:** Follows the factory pattern from `request-logger.ts:89` and `rate-limiter.ts:124`
**Verify:** `pnpm test:int src/middleware/cache-control.test.ts` (should pass)

---

## Existing Patterns Found

- **`src/middleware/rate-limiter.ts:124`** — `createRateLimiterMiddleware(config)` factory returns middleware function with `NextRequest → NextResponse` signature; reused as the primary implementation pattern
- **`src/middleware/request-logger.ts:89`** — `createRequestLogger(config)` factory pattern with config object and returned interface; also referenced
- **`src/middleware/request-logger.test.ts:12`** — `makeRequest(path, ip?, userAgent?)` helper constructing `NextRequest` with headers; reused for test helper
- **Co-located tests** — `*.test.ts` sits alongside `*.ts` in same directory
