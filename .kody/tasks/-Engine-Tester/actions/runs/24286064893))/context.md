
### taskify (2026-04-11T15:58:23)
{
  "task_type": "feature",
  "title": "Add metrics collection middleware",
  "description": "Create metrics middleware in src/middleware/metrics.ts that tracks request count by HTTP method/route pattern, measures response latency per endpoint, and records error counts by status code category (4xx/5xx). Normalize dynamic route segments (e.g., /api/users/123 → /api/users/:id). Expose metrics via src/app/api/metrics/route.ts returning JSON with totals, averages, and p50/p95/p99 percentiles. Includ
...(truncated)

### plan (2026-04-11T15:58:42)
## Existing Patterns Found

- **src/middleware/rate-limiter.ts** — `SlidingWindowRateLimiter` with `setInterval` cleanup pattern (`cleanupTimer.unref()`) to prevent memory leaks; `destroy()` method clears state
- **src/middleware/request-logger.ts** — Next.js middleware factory pattern using `NextRequest`/`NextResponse`, tracking method/path/status/latency, using `inFlightRequests` Map for timing
- **src/app/api/health/route.ts** — Simple Next.js route handler returning JSON `Response`

## Imple
...(truncated)

### build (2026-04-11T16:06:11)
## Summary

I've implemented the metrics collection middleware as requested:

### Files Created

1. **`src/middleware/metrics.ts`** - The main metrics middleware factory with:
   - `createMetricsMiddleware(config?)` factory function
   - `MetricBucket` tracking: count, totalLatencyMs, latencies array, errors4xx, errors5xx, lastUpdated
   - Route normalization (replaces numeric IDs, UUIDs, and hex strings with `:id`)
   - Percentile calculation (p50, p95, p99) using sorted latency samples
   - Pe
...(truncated)
