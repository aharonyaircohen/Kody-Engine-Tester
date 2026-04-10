# [run-20260410-1407] T02: Add middleware with tests

## Task
Create a `timestamp-middleware.ts` in `src/middleware/` that adds a `x-timestamp` header to all requests with the current Unix timestamp. Also create `src/middleware/timestamp-middleware.test.ts` with comprehensive tests.

## Acceptance Criteria
- Middleware adds `x-timestamp` header with Unix timestamp
- Handles request and response objects correctly
- Calls next() function
- Tests cover normal requests and error cases

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody full

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1709-260410-140849` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24247026569))

To rerun: `@kody rerun 1709-260410-140849 --from <stage>`

