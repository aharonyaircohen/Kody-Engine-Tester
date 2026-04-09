
### taskify (2026-04-09T23:39:54)
{
  "task_type": "feature",
  "title": "Add checkRateLimit utility function",
  "description": "Create `checkRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfter?: number }` in `src/auth/rate-limiter-utils.ts` using an in-memory Map. Implement a fixed-window rate limiting algorithm that tracks request counts per key within a time window. Add comprehensive tests covering: allow under limit, reject over limit, window expiry reset, multiple independent keys,
...(truncated)

### build (2026-04-09T23:41:03)

These are pre-existing environment issues in `node_modules`, not from my code. The tests pass correctly.

**Summary:**

Created two files:
- `src/auth/rate-limiter-utils.ts` — Fixed-window rate limiter using in-memory Map with `checkRateLimit()` and `resetRateLimit()` exports
- `src/auth/rate-limiter-utils.test.ts` — 5 tests covering: allow under limit, reject over limit, window expiry reset, independent keys, and retryAfter calculation

All 5 tests pass.

