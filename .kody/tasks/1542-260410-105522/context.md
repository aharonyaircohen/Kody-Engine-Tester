
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

### review (2026-04-10T11:02:34)
## Verdict: FAIL

## Summary

Added `cache-control` middleware with `CacheControlType` enum, `generateETag` hash function, and `createCacheControlMiddleware` factory following existing middleware patterns. The implementation is mostly correct but has a critical 304 response header issue.

## Findings

### Critical

- `src/middleware/cache-control.ts:39` — 304 response returns empty headers. Per RFC 7232, a 304 response MUST include the same caching headers (Cache-Control, ETag, Vary) that would 
...(truncated)

### review-fix (2026-04-10T11:02:59)
**Critical fix applied:** The 304 response now includes all required headers per RFC 7232:
- `Cache-Control` (line 40)
- `ETag` (line 41)
- `Vary: Accept-Encoding` (lines 42-44) when configured

All 22 tests pass. The implementation is now complete and RFC-compliant.


### review (2026-04-10T11:03:31)
## Verdict: FAIL

## Summary

The critical 304 response header bug has been fixed. The 304 response now correctly includes `Cache-Control`, `ETag`, and `Vary` headers per RFC 7232. However, the test coverage for 304 responses remains incomplete.

## Findings

### Critical

None (previous critical issue has been fixed).

### Major

- `src/middleware/cache-control.test.ts:103-110, 184-190` — The 304 response tests only verify `status === 304` but do not assert that `Cache-Control`, `ETag`, or `Var
...(truncated)

### review-fix (2026-04-10T11:04:17)
All 23 tests pass. The Major issues have been fixed:

1. **Lines 103-110**: Added `Cache-Control` and `ETag` header assertions to the 304 response test
2. **Lines 184-190**: Added `Cache-Control` and `ETag` header assertions to the 304 status test  
3. **Lines 172-183**: Added new test case `returns 304 with all headers when If-None-Match matches with vary` that verifies 304 responses include `Cache-Control`, `ETag`, and `Vary` headers together

All 304 response tests now assert the required RFC
...(truncated)

### review (2026-04-10T11:04:46)
## Verdict: PASS

## Summary

The cache-control middleware is complete and correct. The critical 304 header issue and the major test coverage gap from previous reviews have both been addressed. The middleware now properly includes `Cache-Control`, `ETag`, and `Vary` headers on 304 responses per RFC 7232, with tests asserting all three headers are present.

## Findings

### Critical

None.

### Major

None.

### Minor

None.

---

## Two-Pass Review

### Pass 1 — CRITICAL

**304 Response Headers*
...(truncated)
