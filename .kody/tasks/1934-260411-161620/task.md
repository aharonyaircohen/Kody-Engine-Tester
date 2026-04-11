# [] T02: Add metrics collection middleware

Create a new middleware in src/middleware/metricsMiddleware.ts that:

1. Tracks request count, response time, and status codes per route
2. Exposes metrics via `/metrics` endpoint (JSON format)
3. Stores metrics in memory (with optional reset function)
4. Adds X-Response-Time header to all responses

Write comprehensive tests in src/middleware/metricsMiddleware.test.ts that mock the response stream and verify metrics are accumulated correctly.

---

## Discussion (3 comments)

**@aharonyaircohen** (2026-04-11):
@kody

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `1934-260411-161403` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286396012))

To rerun: `@kody rerun 1934-260411-161403 --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `1934-260411-161620` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286396009))

To rerun: `@kody rerun 1934-260411-161620 --from <stage>`

