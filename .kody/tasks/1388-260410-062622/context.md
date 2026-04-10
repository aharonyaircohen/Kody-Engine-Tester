
### taskify (2026-04-10T06:29:09)
{"task_type":"feature","title":"Add rate limit check utility","description":"Create checkRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfter?: number } in src/auth/rate-limiter-utils.ts using an in-memory Map. Include co-located tests.","scope":["src/auth/rate-limiter-utils.ts","src/auth/rate-limiter-utils.test.ts"],"risk_level":"low","existing_patterns":[{"path":"src/utils/debounce.ts","description":"Single-function utility module with co-located .test.
...(truncated)

### build (2026-04-10T06:31:47)
My implementation is complete. Here's a summary:

**Created files:**

1. **`src/auth/rate-limiter-utils.ts`** - Rate limit utility with:
   - `checkRateLimit(key, maxRequests, windowMs)` - Returns `{ allowed: boolean; retryAfter?: number }` using an in-memory Map with fixed-window approach
   - `resetRateLimit(key?)` - Helper to reset the store (specific key or all keys)

2. **`src/auth/rate-limiter-utils.test.ts`** - 8 tests covering:
   - Allowing requests under the limit
   - Rejecting reques
...(truncated)
