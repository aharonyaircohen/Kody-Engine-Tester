# [run-20260409-1749] T02: Add middleware with tests

## Task
Create a request timeout middleware in src/middleware/timeout-middleware.ts that:
- Aborts requests that take longer than a configured timeout (default 30s)
- Attaches an `X-Request-Timeout` header to timed-out requests
- Has full test coverage in src/middleware/timeout-middleware.test.ts

## Acceptance Criteria
- File src/middleware/timeout-middleware.ts exists
- File src/middleware/timeout-middleware.test.ts exists with passing tests
- Middleware is exported from src/middleware/index.ts

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody full

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `929-260409-175015` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24204961670))

To rerun: `@kody rerun 929-260409-175015 --from <stage>`

