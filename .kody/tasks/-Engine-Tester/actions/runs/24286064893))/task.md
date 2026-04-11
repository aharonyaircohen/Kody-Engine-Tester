# [] T02: Add metrics collection middleware

## Task
Create a new metrics collection middleware in src/middleware/metrics.ts that:
1. Tracks request count by HTTP method and route pattern
2. Measures response time (latency) per endpoint
3. Records error counts by status code category (4xx, 5xx)
4. Exposes metrics via a /metrics endpoint that outputs in a simple JSON format

Also create tests in src/middleware/metrics.test.ts.

## Complexity
This is a MEDIUM complexity task — middleware with stateful tracking, multiple export formats, integration with HTTP stack.

## Acceptance Criteria
- Middleware tracks requests without blocking the response
- /metrics endpoint returns JSON with counts and latencies
- Tests verify the tracking logic works correctly
- No memory leaks from accumulating metrics over time

---

## Discussion (8 comments)

**@aharonyaircohen** (2026-04-11):
@kody full

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `1874-260411-154934` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285975577))

To rerun: `@kody rerun 1874-260411-154934 --from <stage>`

**@aharonyaircohen** (2026-04-11):
🤔 **Kody has questions before proceeding:**

1. Should the /metrics endpoint be a Next.js route handler (app/metrics/route.ts) or integrated into the middleware itself?
2. Should route patterns be normalized to replace dynamic segments (e.g., /api/users/123 → /api/users/:id) for consistent aggregation?
3. What specific JSON structure should the /metrics endpoint output (e.g., should it include percentiles, histogram buckets, or just totals/averages)?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `approve`` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286019439))

To rerun: `@kody rerun approve` --from <stage>`

**@aharonyaircohen** (2026-04-11):
🤔 **Kody has questions before proceeding:**

1. Should the /metrics endpoint be a Next.js route handler (app/metrics/route.ts) or handle /metrics directly within the middleware itself?
2. Should route patterns normalize dynamic segments (e.g., /api/users/123 → /api/users/:id) for consistent aggregation across requests?
3. What JSON structure should /metrics output — just totals/averages, or should it include percentiles and histogram buckets for latency distribution?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `approve`` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286064893))

To rerun: `@kody rerun approve` --from <stage>`

**@aharonyaircohen** (2026-04-11):
@kody approve

1. Use a Next.js route handler (app/metrics/route.ts) — keeps middleware focused on tracking only
2. Yes, normalize dynamic segments — /api/users/:id format for consistent aggregation
3. Include totals/averages and p50/p95/p99 percentiles — useful for latency distribution without histogram complexity

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24286064893))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286088573))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24286064893)) --from <stage>`

