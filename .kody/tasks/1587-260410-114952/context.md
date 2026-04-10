
### taskify (2026-04-10T11:52:17)
{
  "task_type": "feature",
  "title": "Add cacheControl middleware with tests",
  "description": "Create a cacheControl middleware in src/middleware/ that sets Cache-Control headers (no-store, no-cache, max-age, private), adds Last-Modified and ETag headers based on content hash, handles conditional requests (If-None-Match, If-Modified-Since), and returns 304 Not Modified when appropriate. Include comprehensive unit tests in src/middleware/cacheControl.test.ts.",
  "scope": [
    "src/middlewar
...(truncated)

### plan (2026-04-10T11:52:40)
## Existing Patterns Found

- **Factory pattern with config interface** (`rate-limiter.ts:124-176`): `createRateLimiterMiddleware(config)` returns a middleware function with attached properties
- **Named exports for types** (`rate-limiter.ts:1-21`): Interfaces and types exported at top of file
- **Middleware function signature** (`rate-limiter.ts:130`): `(request: NextRequest) => NextResponse`
- **Vitest test pattern** (`rate-limiter.test.ts`): `describe/it/expect/vi/afterEach` with `makeRequest
...(truncated)

### build (2026-04-10T11:54:36)
These TypeScript errors are pre-existing (in other files). My implementation is complete. Here's a summary:

## Implementation Complete

**Files Created:**
1. `src/middleware/cacheControl.ts` - Cache control middleware with:
   - `CacheControlConfig` interface with `cachePolicy`, `maxAge`, `staleWhileRevalidate` options
   - `generateHash(content)` - SHA-256 hash using `crypto.subtle`
   - `generateETag(content)` - Weak ETag (`W/"hash"`)
   - `createCacheControlMiddleware(config)` - Returns midd
...(truncated)
