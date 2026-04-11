## Existing Patterns Found

- **src/middleware/rate-limiter.ts** — `SlidingWindowRateLimiter` with `setInterval` cleanup pattern (`cleanupTimer.unref()`) to prevent memory leaks; `destroy()` method clears state
- **src/middleware/request-logger.ts** — Next.js middleware factory pattern using `NextRequest`/`NextResponse`, tracking method/path/status/latency, using `inFlightRequests` Map for timing
- **src/app/api/health/route.ts** — Simple Next.js route handler returning JSON `Response`

## Implementation Plan

**Step 1: Write tests for metrics middleware**
**File:** `src/middleware/metrics.test.ts`
**Change:** Create test file with:
- Tests for `createMetricsMiddleware` factory (tracks requests without blocking)
- Tests for route normalization (`:id` pattern replacement)
- Tests for error categorization (4xx vs 5xx counts)
- Tests for percentile calculation (p50/p95/p99)
- Tests for memory cleanup (TTL-based expiration)
- Tests for `/metrics` endpoint route handler
**Verify:** `pnpm test:int src/middleware/metrics.test.ts`

---

**Step 2: Create metrics middleware**
**File:** `src/middleware/metrics.ts`
**Change:** Create `createMetricsMiddleware(config?)` factory that:
- Uses `Map<string, MetricBucket>` keyed by `method:routePattern`
- `MetricBucket`: `{ count, totalLatencyMs, latencies: number[], errors4xx, errors5xx, lastUpdated }`
- Route normalization: replace `/[id]` segments with `/:id`
- Latency sampling (store last N latencies for percentile calc)
- Periodic cleanup via `setInterval` (like rate-limiter) with `unref()` to avoid blocking shutdown
- Returns `{ middleware, getMetrics, reset }` interface
- `getMetrics()` returns serialized JSON with request counts, avg latency, p50/p95/p99 per route
**Verify:** `pnpm test:int src/middleware/metrics.test.ts`

---

**Step 3: Create `/metrics` API route handler**
**File:** `src/app/api/metrics/route.ts`
**Change:** Create `GET` handler that:
- Imports `getMetrics()` from middleware singleton
- Returns `Response.json(metrics, { status: 200 })`
- Only `src/middleware/metrics.ts` holds the singleton; route handler reads from it
**Verify:** `pnpm test:int src/middleware/metrics.test.ts`

---

**Step 4: Wire middleware into Next.js pipeline**
**File:** `src/middleware/*.ts` (check existing middleware chain)
**Change:** If an existing `middleware.ts` chains middleware, add the metrics middleware to the chain. If no chain exists, create `src/middleware/index.ts` that chains all middleware including metrics.
**Verify:** `pnpm test:int` passes

---

**Step 5: Verify full test suite**
**Change:** Run `pnpm test:int` to confirm all tests pass including new metrics tests.
**Verify:** All tests pass
