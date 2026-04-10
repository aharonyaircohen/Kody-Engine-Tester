# [run-20260410-1924] T02: Add timeout middleware with tests

## Task
Add a timeout middleware in src/middleware/timeout-middleware.ts

The middleware should:
- Accept a timeout in milliseconds
- Abort the request if it takes longer than the timeout
- Return a 504 Gateway Timeout status if aborted
- Include tests in src/middleware/timeout-middleware.test.ts

This is a MEDIUM complexity task requiring 6 stages.

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody full

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1816-260410-192525` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24260248766))

To rerun: `@kody rerun 1816-260410-192525 --from <stage>`

