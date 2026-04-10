
### taskify (2026-04-10T04:05:42)
All 6 tests pass. Here's the classification:

```json
{
  "task_type": "feature",
  "title": "Add rate limit check utility",
  "description": "Created checkRateLimit(key, maxRequests, windowMs) in src/auth/rate-limiter-utils.ts using in-memory Map with 6 tests covering: first request allowance, requests within limit, blocking exceeding limit, window reset, independent key tracking, and retryAfter calculation.",
  "scope": ["src/auth/rate-limiter-utils.ts", "src/auth/rate-limiter-utils.test.ts"],
...(truncated)

### build (2026-04-10T04:06:30)
**Verification complete.** The rate limit check implementation is verified:

**`src/auth/rate-limiter-utils.ts`** - Implementation:
- `checkRateLimit(key, maxRequests, windowMs)` returns `{ allowed: boolean; retryAfter?: number }`
- Uses in-memory `Map<string, RateLimitEntry>` with `count` and `windowStart` tracking
- Properly resets window after `windowMs` expires
- Includes `clearRateLimitStore()` helper for testing

**`src/auth/rate-limiter-utils.test.ts`** - 6 passing tests:
- ✅ First reques
...(truncated)
