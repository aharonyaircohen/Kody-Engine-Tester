
### taskify (2026-04-09T21:57:22)
All tests pass. Here's the classification:

```json
{
  "task_type": "feature",
  "title": "Add rate limit check utility",
  "description": "Created `checkRateLimit(key, maxRequests, windowMs)` function in `src/auth/rate-limiter-utils.ts` using in-memory Map with support for tracking request counts per key, automatic window reset, and retryAfter calculation. Includes helper functions `resetRateLimit` and `clearRateLimitStore` for testing. Co-located test file covers first request allowance, max 
...(truncated)

### build (2026-04-09T21:58:57)
**Verification complete.** The implementation is already in place and all 7 tests pass.

**Summary:**
- `src/auth/rate-limiter-utils.ts` - Contains `checkRateLimit(key, maxRequests, windowMs)` using in-memory Map with proper window expiration
- `src/auth/rate-limiter-utils.test.ts` - 7 passing tests covering:
  - First request within window allowed
  - Requests up to max allowed
  - Requests exceeding max blocked with `retryAfter`
  - Independent key tracking
  - `resetRateLimit` functionality
 
...(truncated)
