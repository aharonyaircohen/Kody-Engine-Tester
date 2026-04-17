The plan file is ready at `/home/runner/.claude/plans/fancy-painting-newt.md`. It covers:

1. **Step 1 (TDD)**: Write `src/middleware/rateLimit.test.ts` first — tests for `FixedWindowRateLimiter` class, `createRateLimitMiddleware`, IP whitelist/blacklist, and fixed-window boundary behavior, following the same patterns as `csrf-middleware.test.ts` and `rate-limiter.test.ts`.

2. **Step 2**: Implement `src/middleware/rateLimit.ts` — `FixedWindowRateLimiter` class with `Map<string, {count, windowStart}>` store and fixed-window counter logic, plus `createRateLimitMiddleware` factory returning a sync middleware with `Retry-After` and `X-RateLimit-*` headers, using the same `byIp` resolver and whitelist/blacklist logic as the existing rate-limiter.