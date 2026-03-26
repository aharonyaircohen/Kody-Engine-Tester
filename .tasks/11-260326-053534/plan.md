All 13 tests pass. Here's what was implemented:

**`src/middleware/rate-limiter.ts`** — Two layers:
- **`SlidingWindowRateLimiter`** class: pure logic using a `Map<string, number[]>` of timestamps. Filters expired entries on each `check()`, with periodic `cleanup()` via `setInterval` (`.unref()`'d to not block exit).
- **`createRateLimiterMiddleware`** factory: wraps the limiter for Next.js, returning proper `NextResponse` with `429`, `Retry-After`, and `X-RateLimit-*` headers.

**`src/middleware/rate-limiter.test.ts`** — 13 tests covering:
- Normal flow (under limit, correct remaining counts)
- Rate exceeded (429, retryAfterMs)
- Sliding window expiry (fake timers)
- Multiple keys tracked independently
- Correct `retryAfterMs` calculation
- Cleanup of expired/active entries
- Middleware: IP-based, API-key-based, and null-key resolution

Key resolvers exported: `byIp` (default, uses `x-forwarded-for` → `request.ip`) and `byApiKey` (uses `x-api-key` header).
