
### taskify (2026-04-18T12:42:43)
Now I have a comprehensive understanding of the codebase. Let me classify the task.

```json
{
  "task_type": "feature",
  "title": "Add rate-limit IP middleware with in-memory Map",
  "description": "Create src/middleware/rateLimit.ts (distinct from existing rate-limiter.ts sliding-window impl) with a simple IP-based rate limiter using an in-memory Map, and co-located unit tests. The middleware should extract client IP from x-forwarded-for header, track request counts per IP within a configurab
...(truncated)

### plan (2026-04-18T12:43:07)


Now I have everything I need. Let me write the plan.

---

## Existing Patterns Found

- **`rate-limiter.ts`** — Factory pattern (`createRateLimiterMiddleware`), `SlidingWindowRateLimiter` class with `check()`/`reset()`/`destroy()`/cleanup timer, `byIp` helper for `x-forwarded-for` parsing, `RateLimiterConfig` interface, X-RateLimit-* headers, 429+Retry-After response. Reused for the new `SimpleRateLimiter` class structure.
- **`rate-limiter.test.ts`** — `describe/it/expect/vi`, `afterEach` wi
...(truncated)

### build (2026-04-18T12:46:11)
Both files are implemented and verified. Here's a summary:

---

**`src/middleware/rateLimit.ts`** — 2 exports:
- **`SimpleRateLimiter`** — fixed-window (not sliding) rate limiter using an in-memory `Map<string, { count, windowStart }>`. Each key gets one window that starts on first request and resets when expired. Exposes `check()`, `reset(key?)`, `cleanup()`, `destroy()`, and `size`.
- **`createRateLimitMiddleware(config)`** — factory-pattern middleware matching existing conventions (`middlewa
...(truncated)
