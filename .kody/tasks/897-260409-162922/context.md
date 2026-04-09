
### taskify (2026-04-09T16:31:50)
```json
{
  "task_type": "feature",
  "title": "Add checkRateLimit utility with in-memory Map",
  "description": "Create `checkRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfter?: number }` in `src/auth/rate-limiter-utils.ts` using an in-memory Map for tracking request counts per key with automatic expiration within the time window. Include co-located tests in `rate-limiter-utils.test.ts`.",
  "scope": [
    "src/auth/rate-limiter-utils.ts",
    "src/au
...(truncated)

### build (2026-04-09T16:35:09)
Implementation complete. Here's a summary:

**Created `src/auth/rate-limiter-utils.ts`** with:
- `checkRateLimit(key, maxRequests, windowMs)` - Returns `{ allowed: boolean; retryAfter?: number }` using in-memory Map with automatic window expiration
- `resetRateLimit(key)` - Clears rate limit for a specific key
- `clearRateLimitStore()` - Clears all entries  
- `getRateLimitEntry(key)` - Accessor for testing

**Created `src/auth/rate-limiter-utils.test.ts`** with 16 tests covering:
- Request allo
...(truncated)
