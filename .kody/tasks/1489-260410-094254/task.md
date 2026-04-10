# [run-20260410-0941] T02: Add middleware with tests

## Task
Add a `timestamp-middleware.ts` in `src/middleware/` that attaches a `x-timestamp` header with the server time to every request. Write tests in `src/middleware/timestamp-middleware.test.ts`.

## Acceptance Criteria
- Middleware adds `x-timestamp` header to response
- Header value is ISO 8601 format
- Next handler is called after header is set
- Unit tests achieve 90%+ coverage

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody full

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1489-260410-094254` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24236817823))

To rerun: `@kody rerun 1489-260410-094254 --from <stage>`

