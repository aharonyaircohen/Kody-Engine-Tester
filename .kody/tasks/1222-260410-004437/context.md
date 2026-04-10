
### taskify (2026-04-10T00:47:55)
All tests pass. Here's the task classification:

```json
{
  "task_type": "feature",
  "title": "Add rate limit check utility",
  "description": "Create checkRateLimit(key, maxRequests, windowMs) in src/auth/rate-limiter-utils.ts using in-memory Map with sliding window algorithm. Includes resetRateLimit helper for clearing state. Tests cover: allow/deny logic, sliding window expiry, independent key tracking, retryAfter calculation in seconds, and reset functionality.",
  "scope": ["src/auth/rate
...(truncated)

### build (2026-04-10T00:49:25)
All 8 tests pass. The implementation is complete:

- **`checkRateLimit(key, maxRequests, windowMs)`** returns `{ allowed: boolean; retryAfter?: number }`
- Uses sliding window algorithm with in-memory Map
- `resetRateLimit(key?)` utility to clear state for testing or manual resets

