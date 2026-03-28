
### taskify (2026-03-28T22:26:49)

All 32 tests pass. The rate limit headers were already implemented in `src/middleware/rate-limiter.ts`. I added tests to verify:

1. **`X-RateLimit-Limit`** header has the correct max value
2. **`X-RateLimit-Remaining`** header decrements correctly (4 → 3 → 2 → 1 → 0)
3. **`Retry-After`** header is included on 429 responses

The existing tests already covered `X-RateLimit-Reset` and the toggle behavior via `enableRateLimitHeaders`.


### build (2026-03-28T22:28:00)
The implementation is complete. Here's a summary of what was done:

**Changes to `src/middleware/rate-limiter.ts`:**
- Added `setRateLimitHeaders()` helper function that sets `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` on every response
- Added `X-RateLimit-Reset` computed as `Math.ceil((Date.now() + retryAfterMs) / 1000)` — epoch seconds
- `Retry-After` header added on 429 responses (already existed, now also on the 429 path)
- Added `enableRateLimitHeaders?: boolean` 
...(truncated)
