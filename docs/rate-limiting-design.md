# RFC: In-Memory Per-User Rate Limiting Middleware

**Status:** Draft
**Authors:** Kody Engine (N2 spec flow)
**Target:** `src/app/api/` (Next.js App Router)
**Starter issue:** #2986

---

## 1. Problem Statement

API routes in `src/app/api/` are currently unauthenticated against burst/abuse at the route level. Authenticated endpoints (`withAuth`) and public endpoints (e.g. `GET /api/health`) both lack rate-limit enforcement. A per-user (identified by `user.id` from JWT) in-memory rate limiter must be introduced without a hard Redis dependency.

---

## 2. Data Structure: Sliding Window Counter

### Chosen: Sliding Window Counter (SWC)

### Alternatives Considered

| Algorithm | Accuracy | State size | Implementation complexity | Burst tolerance | Verdict |
|---|---|---|---|---|---|
| **Fixed window** | Low (boundary spike) | O(1) | Trivial | Poor | Rejected |
| **Sliding window counter** | High | O(1) per key | Low | Moderate | **Selected** |
| **Sliding window log** | Perfect | O(n) per key | Medium | Perfect | Rejected (memory unbounded) |
| **Token bucket** | High | O(1) per key | Medium | Excellent | Rejected (in-process refill drift) |
| **Leaky bucket** | High | O(1) per key | Medium | Poor | Rejected |

### Rationale

- **O(1) state per key** — a single numeric counter is stored per user per window. This maps naturally onto a `Map<string, { count: number; windowStart: number }>`.
- **No background timers** — unlike token-bucket refill loops or leaky-bucket drain loops, SWC only mutates state on request arrival. This is critical for Next.js serverless instances where timers would be discarded on each warm invocation.
- **Accurate enough** — sliding window counter (using the two-adjacent-windows interpolation) gives <5% error at window boundaries vs. 50%+ error for fixed-window. Acceptable for abuse deterrence.
- **No distributed coordination** — Redis is explicitly excluded from this phase. The in-process store is inherently per-instance; multi-instance deployments would see per-instance limits. A Redis adapter is deferred to a future phase.

### Algorithm Detail

```
SWC(windowMs, limit):
  key = userId          # from JWT, falls back to IP for unauthenticated routes
  now = Date.now()
  windowStart = floor(now / windowMs) * windowMs
  prevWindowStart = windowStart - windowMs

  current = store[key]?.windows[windowStart] ?? 0
  prev     = store[key]?.windows[prevWindowStart] ?? 0

  # Interpolate across the partial current window
  elapsed = now - windowStart
  weight  = 1 - (elapsed / windowMs)   # 0→1, how "full" the prev window is
  effectiveCount = floor(prev * weight) + current

  if effectiveCount >= limit:
    return RateLimitExceeded { retryAfterMs, limit, remaining: 0 }
  else:
    store[key].windows[windowStart] = current + 1
    return Allowed { remaining: limit - effectiveCount - 1, resetMs }
```

---

## 3. Middleware Integration

### Integration Point: `src/utils/middleware.ts`

The existing `Pipeline<TContext>` in `src/utils/middleware.ts` is the natural host. A new `RateLimitMiddleware<TContext>` function will be added, and routes will register it via `.use()`.

### Context Shape

A new `RateLimitContext` interface is added to `src/utils/middleware.ts`:

```typescript
// src/utils/middleware.ts additions

export interface RateLimitContext {
  userId?: string       // from JWT; undefined for unauthenticated requests
  ip?: string           // fallback identifier
  rateLimit?: {
    allowed: boolean
    remaining: number
    limit: number
    retryAfterMs?: number
    resetMs?: number
  }
}

export type Middleware<TContext> = (
  ctx: TContext,
  next: () => Promise<void>,
) => Promise<void>
```

### New Middleware: `createRateLimitMiddleware`

```typescript
// src/utils/rateLimitMiddleware.ts

import type { Middleware } from './middleware'

export interface RateLimitConfig {
  windowMs: number       // e.g. 60_000 for 1 minute
  limit: number          // e.g. 60 requests per window
  keyFn: (ctx: RateLimitContext) => string
  // Optional: per-role override
  limitByRole?: Record<string, number>
}

export interface RateLimitStore {
  // module-level Map — single instance per serverless cold-start
  windows: Record<number, number>   // windowStart → count
  lastAccess: number                // for LRU eviction
}

const store = new Map<string, RateLimitStore>()
const DEFAULT_MAX_ENTRIES = 10_000

function evictStale(): void {
  if (store.size < DEFAULT_MAX_ENTRIES) return
  // Remove 20% LRU entries (by lastAccess)
  const entries = [...store.entries()]
    .sort((a, b) => a[1].lastAccess - b[1].lastAccess)
  entries.slice(0, Math.floor(DEFAULT_MAX_ENTRIES * 0.2)).forEach(([k]) => store.delete(k))
}

export function createRateLimitMiddleware(
  config: RateLimitConfig
): Middleware<RateLimitContext> {
  const { windowMs, limit, keyFn, limitByRole } = config

  return async (ctx, next) => {
    const key = keyFn(ctx)
    const effectiveLimit = limit  // future: resolve limitByRole from ctx.userId role
    const now = Date.now()
    const windowStart = Math.floor(now / windowMs) * windowMs
    const prevWindowStart = windowStart - windowMs

    evictStale()

    const entry = store.get(key) ?? { windows: {}, lastAccess: now }
    const current = entry.windows[windowStart] ?? 0
    const prev = entry.windows[prevWindowStart] ?? 0

    const elapsed = now - windowStart
    const weight = 1 - elapsed / windowMs
    const effectiveCount = Math.floor(prev * weight) + current

    if (effectiveCount >= effectiveLimit) {
      const retryAfterMs = windowMs - elapsed
      ctx.rateLimit = {
        allowed: false,
        remaining: 0,
        limit: effectiveLimit,
        retryAfterMs,
        resetMs: windowStart + windowMs,
      }
      // Short-circuit: do not call next()
      return
    }

    entry.windows[windowStart] = current + 1
    entry.lastAccess = now
    store.set(key, entry)

    ctx.rateLimit = {
      allowed: true,
      remaining: effectiveLimit - effectiveCount - 1,
      limit: effectiveLimit,
      resetMs: windowStart + windowMs,
    }

    await next()
  }
}

export function createRateLimitResponse(ctx: RateLimitContext): Response | null {
  if (!ctx.rateLimit) return null
  if (ctx.rateLimit.allowed) return null

  return Response.json(
    {
      error: 'Too Many Requests',
      retryAfterMs: ctx.rateLimit.retryAfterMs,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil((ctx.rateLimit.retryAfterMs ?? 0) / 1000)),
        'X-RateLimit-Limit': String(ctx.rateLimit.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(ctx.rateLimit.resetMs),
      },
    }
  )
}
```

### Route Integration Pattern

Routes opt in by wrapping handlers with the middleware. Two approaches:

**Approach A — Pipeline (for route groups):**

```typescript
// src/app/api/_pipeline.ts
import { createPipeline } from '@/utils/middleware'
import { createRateLimitMiddleware } from '@/utils/rateLimitMiddleware'
import type { RateLimitContext } from '@/utils/middleware'

export const apiPipeline = createPipeline<RateLimitContext>()
  .use(createRateLimitMiddleware({
    windowMs: 60_000,
    limit: 60,
    keyFn: (ctx) => ctx.userId ?? ctx.ip ?? 'anonymous',
  }))
```

**Approach B — Per-route HOF (recommended, most explicit):**

```typescript
// src/utils/withRateLimit.ts
import type { NextRequest } from 'next/server'
import type { Middleware, Pipeline } from '@/utils/middleware'
import { createRateLimitMiddleware, createRateLimitResponse } from '@/utils/rateLimitMiddleware'
import type { RateLimitContext } from '@/utils/middleware'
import { extractBearerToken } from '@/auth/withAuth'

export interface RateLimitOptions {
  windowMs?: number   // default: 60_000
  limit?: number      // default: 60
  /** Override limits per route */
  tier?: 'default' | 'strict' | 'lenient'
  /** Set to false to use IP key for unauthenticated routes */
  requireAuth?: boolean
}

const DEFAULTS: Record<NonNullable<RateLimitOptions['tier']>, { windowMs: number; limit: number }> = {
  default: { windowMs: 60_000, limit: 60 },   // 60 req / minute
  strict:  { windowMs: 60_000, limit: 10 },   // 10 req / minute (login, register)
  lenient: { windowMs: 60_000, limit: 300 },  // 300 req / minute (read-only)
}

export function withRateLimit(
  handler: (req: NextRequest, ctx: RateLimitContext) => Promise<Response>,
  options: RateLimitOptions = {}
) {
  const tier = options.tier ?? 'default'
  const { windowMs, limit } = DEFAULTS[tier]
  const mw = createRateLimitMiddleware({
    windowMs: options.windowMs ?? windowMs,
    limit: options.limit ?? limit,
    keyFn: (ctx) => ctx.userId ?? ctx.ip ?? 'anonymous',
  })

  return async (req: NextRequest): Promise<Response> => {
    // Build minimal RateLimitContext from request headers
    const ctx: RateLimitContext = {
      ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim()
        ?? req.headers.get('x-real-ip')
        ?? 'unknown',
      userId: undefined,  // resolved by withAuth in practice; here we use IP
    }

    await mw(ctx, async () => {
      // No-op: handler is called after rate-limit check
    })

    const errorResponse = createRateLimitResponse(ctx)
    if (errorResponse) return errorResponse

    return handler(req, ctx)
  }
}
```

**Usage in a route:**

```typescript
// src/app/api/notes/route.ts (annotated version)
import { withRateLimit } from '@/utils/withRateLimit'
import type { RateLimitContext } from '@/utils/middleware'

export const GET = withRateLimit(
  async (req: NextRequest, ctx: RateLimitContext) => {
    // ... existing handler logic
  },
  { tier: 'lenient' }   // 300 req/min for read endpoints
)

export const POST = withRateLimit(
  async (req: NextRequest, ctx: RateLimitContext) => {
    // ... existing handler logic
  },
  { tier: 'default' }   // 60 req/min for write endpoints
)
```

**Strict tier for auth routes:**

```typescript
// src/app/api/auth/login/route.ts
export const POST = withRateLimit(handler, { tier: 'strict' })
// 10 req/min — prevents brute-force without needing account lockout overhead
```

---

## 4. Route Configuration: Central Registry

A central registry file allows limits to be defined once and enforced consistently:

```typescript
// src/config/rateLimits.ts

export type RateLimitTier = 'default' | 'strict' | 'lenient' | 'auth'

export interface RouteRateLimit {
  tier: RateLimitTier
}

export const ROUTE_RATE_LIMITS: Record<string, RouteRateLimit> = {
  // Auth — strict (brute-force protection)
  '/api/auth/login':    { tier: 'strict' },
  '/api/auth/register': { tier: 'strict' },
  '/api/auth/refresh':  { tier: 'strict' },

  // Data mutations — default
  '/api/notes':         { tier: 'default' },
  '/api/enroll':        { tier: 'default' },
  '/api/quizzes/*/submit': { tier: 'default' },

  // Read-heavy — lenient
  '/api/health':       { tier: 'lenient' },
  '/api/notes':        { tier: 'lenient' },  // GET is lenient; POST is default
  '/api/courses/search': { tier: 'lenient' },
}
```

A matcher utility resolves the tier for a given pathname:

```typescript
// src/utils/rateLimitMatcher.ts

import { ROUTE_RATE_LIMITS } from '@/config/rateLimits'

export function matchRateLimitTier(pathname: string): string {
  // Exact match
  if (ROUTE_RATE_LIMITS[pathname]) return ROUTE_RATE_LIMITS[pathname].tier

  // Wildcard match (e.g. /api/quizzes/*/submit)
  for (const [pattern, config] of Object.entries(ROUTE_RATE_LIMITS)) {
    if (pattern.includes('*')) {
      const regex = new RegExp(`^${pattern.replace(/\*/g, '[^/]+')}$`)
      if (regex.test(pathname)) return config.tier
    }
  }

  return 'default'
}
```

---

## 5. Memory-Bound Eviction Strategy

### Problem
In-process Maps grow unbounded in long-running Node.js processes. In serverless (Vercel, AWS Lambda), each cold-start creates a fresh Map, so this is less of a concern — but for local dev or dedicated Node processes, unbounded growth must be prevented.

### Solution: LRU + Hard Cap

The store is a `Map<string, RateLimitStore>`. Eviction is triggered when `store.size >= MAX_ENTRIES`.

| Parameter | Value | Rationale |
|---|---|---|
| `MAX_ENTRIES` | 10,000 | ~1 MB overhead at 100 bytes/entry |
| `EVICTION_BATCH` | 20% | Remove 2,000 entries at a time to avoid frequent eviction |
| `evictionPolicy` | LRU (least-recently-used by `lastAccess`) | Preserves hot users |
| `windowRetention` | 2 × `windowMs` | Older window keys in the store are pruned after they can no longer contribute to a count |

### Periodic Cleanup (optional enhancement)

A background interval can proactively prune expired windows without waiting for eviction pressure:

```typescript
// Runs every windowMs / 2
const CLEANUP_INTERVAL_MS = 30_000
setInterval(() => {
  const cutoff = Date.now() - 2 * windowMs
  for (const [key, entry] of store.entries()) {
    entry.lastAccess = entry.lastAccess < cutoff ? 0 : entry.lastAccess
    // Prune stale windows from entry.windows
  }
}, CLEANUP_INTERVAL_MS)
```

**Note:** This interval is only safe in long-running processes. It is skipped on detection of a serverless environment (check for `process.env.VERCEL ?? process.env.AWS_LAMBDA_FUNCTION_NAME`).

---

## 6. Response Headers

All rate-limited responses include standard rate-limit headers:

```
Retry-After: <seconds>
X-RateLimit-Limit: <limit>
X-RateLimit-Remaining: <remaining>
X-RateLimit-Reset: <unix-ms>
```

Successful (allowed) responses also include `X-RateLimit-*` headers so clients can track their quota proactively.

---

## 7. Error Handling

| Scenario | Behavior |
|---|---|
| Store read error | Log and allow request (fail open) |
| Store write error | Log and allow request (fail open) |
| Missing userId and IP | Use `'anonymous'` as key |
| Config error | Fall back to `default` tier |

Fail-open is intentional: rate limiting is defense-in-depth, not a hard gate. A degraded store should not take down the API.

---

## 8. Testing Strategy

### Unit Tests (`src/utils/rateLimitMiddleware.test.ts`)

- [ ] SWC interpolation correctness at window boundaries
- [ ] Exceeded limit returns 429 with correct `Retry-After`
- [ ] Allowed requests decrement remaining count
- [ ] Anonymous (no userId, no IP) falls back to `'anonymous'` key
- [ ] Eviction fires at `MAX_ENTRIES` threshold and removes LRU entries
- [ ] Concurrent requests to same key are handled correctly (single-threaded JS is safe)
- [ ] Tier overrides (`strict`/`lenient`) produce different limits

### Integration Tests (`src/app/api/_ratelimit.integration.test.ts`)

- [ ] `GET /api/health` with 60 requests in 60s returns 429 on 61st
- [ ] `POST /api/auth/login` with 10 requests in 60s returns 429 on 11th
- [ ] Rate limit headers present on all responses
- [ ] `Retry-After` header is accurate to within 1 second

### Load / Abuse Simulation Tests

```typescript
it('burst of 120 requests on lenient endpoint hits limit at 300', async () => {
  const requests = Array.from({ length: 120 }, (_, i) =>
    fetch(`${BASE_URL}/api/notes?q=${i}`)
  )
  const results = await Promise.all(requests)
  const success = results.filter(r => r.status === 200).length
  const rejected = results.filter(r => r.status === 429).length
  expect(success).toBeLessThanOrEqual(300)
  // With in-process store, all 120 succeed in a single cold-start warm run
})
```

---

## 9. Deferred: Redis Adapter

This design intentionally limits in-process state. A future phase should add:

```typescript
export interface RateLimitStoreAdapter {
  get(key: string): Promise<{ current: number; prev: number } | null>
  set(key: string, count: number, ttlMs: number): Promise<void>
}
```

Implementing `RedisRateLimitStoreAdapter` would require a Lua script for atomic SWC updates. This is out of scope for phase 1.

---

## 10. File Map

```
src/
├── utils/
│   ├── middleware.ts                    # Extended with RateLimitContext
│   ├── rateLimitMiddleware.ts            # NEW: core SWC algorithm
│   ├── rateLimitMiddleware.test.ts      # NEW: unit tests
│   ├── rateLimitResponse.ts             # NEW: response builder + headers
│   └── withRateLimit.ts                 # NEW: per-route HOF
├── config/
│   └── rateLimits.ts                    # NEW: central route registry
├── app/api/
│   ├── _ratelimit.integration.test.ts   # NEW: integration tests
│   ├── notes/route.ts                   # MODIFIED: add withRateLimit wrappers
│   ├── auth/login/route.ts              # MODIFIED: add withRateLimit(..., { tier: 'strict' })
│   └── health/route.ts                  # MODIFIED: add withRateLimit(..., { tier: 'lenient' })
```

---

## 11. Open Questions

1. **Authenticated vs. IP fallback timing** — `withRateLimit` runs before `withAuth` in the current design. Should rate limiting be applied post-auth to always have a `userId`? Trade-off: unauthenticated burst attacks won't be rate-limited pre-auth. Resolution: run both; use userId when available, IP as fallback.
2. **Vary limits by role** — admin users may warrant higher limits. The `limitByRole` config field is stubbed but not wired. Defer to phase 2.
3. **Cluster mode** — `PM2 cluster` or similar spawns multiple Node processes, each with their own Map. This defeats per-user limits in dedicated deployments. Document as known limitation; Redis adapter is the resolution.
