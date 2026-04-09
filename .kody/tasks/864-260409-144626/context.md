
### taskify (2026-04-09T14:49:03)
{
  "task_type": "feature",
  "title": "Add rate limit check utility",
  "description": "Create `checkRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfter?: number }` in `src/auth/rate-limiter-utils.ts` using in-memory Map with sliding window logic. Add co-located tests in `src/auth/rate-limiter-utils.test.ts`.",
  "scope": ["src/auth/rate-limiter-utils.ts", "src/auth/rate-limiter-utils.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/u
...(truncated)

### build (2026-04-09T14:52:24)
Implementation complete. Summary:

**Created files:**

1. **`src/auth/rate-limiter-utils.ts`** - Rate limit utility with:
   - `checkRateLimit(key, maxRequests, windowMs)` - Returns `{ allowed: boolean; retryAfter?: number }` using sliding window algorithm
   - `resetRateLimit(key)` - Clears counter for a specific key
   - `clearAllRateLimits()` - Clears all counters
   - `getRateLimitStoreSize()` - Returns number of tracked keys

2. **`src/auth/rate-limiter-utils.test.ts`** - 14 tests covering:
...(truncated)
