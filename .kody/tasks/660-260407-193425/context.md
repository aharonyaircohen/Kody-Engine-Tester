
### taskify (2026-04-07T19:37:28)
{
  "task_type": "feature",
  "title": "Add checkRateLimit utility function",
  "description": "Create checkRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfter?: number } in src/auth/rate-limiter-utils.ts using in-memory Map with comprehensive tests",
  "scope": ["src/auth/rate-limiter-utils.ts", "src/auth/rate-limiter-utils.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/utils/throttle.ts - simple utility function pattern with co-loc
...(truncated)

### build (2026-04-07T19:40:02)

Implementation complete. Here's a summary:

**Created files:**

1. **`src/auth/rate-limiter-utils.ts`** - Rate limit utility using sliding window algorithm with in-memory Map
   - `checkRateLimit(key, maxRequests, windowMs)` → `{ allowed: boolean; retryAfter?: number }`
   - `resetRateLimitStore(key?)` - clears store for testing

2. **`src/auth/rate-limiter-utils.test.ts`** - 12 comprehensive tests covering:
   - First request allowed when store empty
   - Requests allowed up to maxRequests
   
...(truncated)
