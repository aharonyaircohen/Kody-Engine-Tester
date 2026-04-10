
### taskify (2026-04-10T10:57:44)
{
  "task_type": "feature",
  "title": "Add cache-control middleware with tests",
  "description": "Create `src/middleware/cache-control.ts` with a `createCacheControlMiddleware` factory function that sets Cache-Control headers (public/private/no-store), supports ETag generation for conditional requests, and handles Vary: Accept-Encoding for compressible responses. Include co-located tests in `cache-control.test.ts`.",
  "scope": [
    "src/middleware/cache-control.ts",
    "src/middleware/cache
...(truncated)

### plan (2026-04-10T10:58:04)
## Plan

### Step 1: Write the test file for cache-control middleware

**File:** `src/middleware/cache-control.test.ts`
**Change:** Create test file with `describe` blocks covering:
- `CacheControlType` enum/unit values (public, private, no-store)
- `createCacheControlMiddleware` factory function
- ETag generation and `If-None-Match` conditional request handling
- `Vary: Accept-Encoding` header handling
- Helper `makeRequest` function following existing middleware test pattern

**Why:** TDD — wr
...(truncated)

### build (2026-04-10T11:00:12)
Implementation complete. Summary:

**Created files:**
- `src/middleware/cache-control.ts` - Cache-control middleware with:
  - `CacheControlType` enum (`public`, `private`, `no-store`)
  - `generateETag(body)` - Generates a hash-based ETag
  - `createCacheControlMiddleware(config)` - Factory following the existing middleware pattern (like `createRateLimiterMiddleware`)

- `src/middleware/cache-control.test.ts` - 22 tests covering:
  - Enum values
  - ETag generation (deterministic, collision-res
...(truncated)
