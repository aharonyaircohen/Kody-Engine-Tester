
### taskify (2026-04-07T20:24:09)
{
  "task_type": "feature",
  "title": "Add checkRateLimit utility function",
  "description": "Create checkRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfter?: number } in src/auth/rate-limiter-utils.ts using in-memory Map. With tests.",
  "scope": [
    "src/auth/rate-limiter-utils.ts",
    "src/auth/rate-limiter-utils.test.ts"
  ],
  "risk_level": "low",
  "existing_patterns": [
    "src/utils/cache.ts - in-memory Map storage with TTL pattern",
    "
...(truncated)

### build (2026-04-07T20:26:35)
Implementation complete. Here's what was created:

**`src/auth/rate-limiter-utils.ts`**
- `checkRateLimit(key, maxRequests, windowMs)` - Returns `{ allowed: boolean; retryAfter?: number }` using sliding window algorithm with in-memory Map
- `resetRateLimit(key?)` - Clears rate limit data for a specific key or all keys

**`src/auth/rate-limiter-utils.test.ts`**
- 8 tests covering: allowing requests under limit, tracking multiple keys independently, denying when over limit, correct `retryAfter` ca
...(truncated)
