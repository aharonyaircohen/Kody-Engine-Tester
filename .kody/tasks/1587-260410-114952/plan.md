## Existing Patterns Found

- **Factory pattern with config interface** (`rate-limiter.ts:124-176`): `createRateLimiterMiddleware(config)` returns a middleware function with attached properties
- **Named exports for types** (`rate-limiter.ts:1-21`): Interfaces and types exported at top of file
- **Middleware function signature** (`rate-limiter.ts:130`): `(request: NextRequest) => NextResponse`
- **Vitest test pattern** (`rate-limiter.test.ts`): `describe/it/expect/vi/afterEach` with `makeRequest` helper for `NextRequest`
- **NextResponse manipulation** (`rate-limiter.ts:110-122`): `response.headers.set()` for setting headers

## Plan

**Step 1: Write tests for cacheControl middleware**

**File:** `src/middleware/cacheControl.test.ts`
**Change:** Create comprehensive tests covering:
- Cache-Control header options (no-store, no-cache, max-age, private)
- ETag generation and Last-Modified header
- Conditional request handling (If-None-Match matching ETag → 304)
- Conditional request handling (If-Modified-Since with recent date → 304)
- 304 response should not have body
- Pass through when no conditional headers present

**Verify:** `pnpm test:int src/middleware/cacheControl.test.ts`

---

**Step 2: Implement cacheControl middleware**

**File:** `src/middleware/cacheControl.ts`
**Change:** Create the middleware with:
- `CacheControlConfig` interface with `cachePolicy`, `maxAge`, `staleWhileRevalidate` options
- `generateHash(content: string)` using `crypto.subtle`
- `generateETag(content: string)` producing weak ETag (`W/"hash"`)
- `middleware(request: NextRequest, content: string)` that:
  - Sets `Cache-Control` based on config (no-store, no-cache, max-age=X, private)
  - Sets `Last-Modified` to current date
  - Sets `ETag` from content hash
  - Checks `If-None-Match` against ETag → returns 304 if match
  - Checks `If-Modified-Since` against Last-Modified → returns 304 if not modified
- Returns `NextResponse` with 304 status and no body when conditions match

**Verify:** `pnpm test:int src/middleware/cacheControl.test.ts`

---

**Step 3: Run full middleware test suite**

**Verify:** `pnpm test:int src/middleware/`
