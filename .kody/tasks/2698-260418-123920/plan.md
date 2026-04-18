

Now I have everything I need. Let me write the plan.

---

## Existing Patterns Found

- **`rate-limiter.ts`** — Factory pattern (`createRateLimiterMiddleware`), `SlidingWindowRateLimiter` class with `check()`/`reset()`/`destroy()`/cleanup timer, `byIp` helper for `x-forwarded-for` parsing, `RateLimiterConfig` interface, X-RateLimit-* headers, 429+Retry-After response. Reused for the new `SimpleRateLimiter` class structure.
- **`rate-limiter.test.ts`** — `describe/it/expect/vi`, `afterEach` with `vi.useRealTimers()`, `NextRequest` factory helper, `mw.limiter.destroy()` cleanup. Reused for test organization and helper patterns.
- **`request-logger.ts`** — Express-style middleware factory returning a middleware function object. Pattern reused for `createRateLimitMiddleware`.

---

## Plan

### Step 1: Write test file for `SimpleRateLimiter` and `createRateLimitMiddleware`

**File:** `src/middleware/rateLimit.test.ts`
**Change:** Create co-located unit tests covering:
- `SimpleRateLimiter`: allows requests under limit, rejects over limit, tracks IPs independently, resets after window expiry (fake timers), `reset(key)` and `reset()` methods, `size` property, concurrent IP tracking.
- `createRateLimitMiddleware`: returns 429+Retry-After on exceeded limit, tracks IPs independently, returns `NextResponse.next()` when under limit, `x-forwarded-for` IP extraction.
- Test helpers and cleanup patterns matching `rate-limiter.test.ts`.

**Why:** TDD — tests before implementation, following existing co-located test conventions.
**Verify:** `pnpm test:int src/middleware/rateLimit.test.ts` (fails until Step 2)

---

### Step 2: Implement `src/middleware/rateLimit.ts`

**File:** `src/middleware/rateLimit.ts`
**Change:** Create the following exports:

```typescript
// --- SimpleRateLimiter: count-based, not sliding-window ---

export interface SimpleRateLimitConfig {
  maxRequests: number
  windowMs: number
  cleanupIntervalMs?: number
}

export class SimpleRateLimiter {
  private store = new Map<string, { count: number; windowStart: number }>()
  private cleanupTimer: ReturnType<typeof setInterval> | null = null
  private maxRequests: number
  private windowMs: number

  constructor(config: SimpleRateLimitConfig)
  check(key: string): { allowed: boolean; remaining: number; retryAfterMs: number }
  reset(key?: string): void
  cleanup(): void
  destroy(): void
  get size(): number
}

// --- Middleware factory ---

export interface RateLimitMiddlewareConfig extends SimpleRateLimitConfig {
  message?: string
  ipWhitelist?: string[]
  ipBlacklist?: string[]
  enableRateLimitHeaders?: boolean
}

export function createRateLimitMiddleware(config: RateLimitMiddlewareConfig): (
  request: NextRequest
) => NextResponse

export { byIp } from './rate-limiter'  // reuse existing helper
```

- `SimpleRateLimiter` uses a fixed-window approach: each IP gets one window that starts on first request.
- Tracks `{ count, windowStart }` per IP; window is "refreshed" on each new window cycle.
- Returns 429 with `Retry-After` (seconds) when `count >= maxRequests`.
- `byIp` is re-exported from existing `rate-limiter.ts`.
- X-RateLimit-* headers set on all responses.

**Why:** Simpler than sliding-window (single window per IP), distinct from `rate-limiter.ts` as specified.
**Verify:** `pnpm test:int src/middleware/rateLimit.test.ts` (passes)

---

### Step 3: Verify full test suite

**File:** —
**Change:** Run `pnpm test:int` to confirm no regressions and new tests pass.
**Why:** Final quality gate per testing strategy conventions.
**Verify:** `pnpm test:int`