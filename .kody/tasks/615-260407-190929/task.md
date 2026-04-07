# [run-20260407-1908] T02: Add middleware with tests

## Task
Create a new middleware in src/middleware/log-context.ts that adds a request ID and timestamp to each request's context. The middleware should:
1. Generate a unique request ID using crypto.randomUUID()
2. Add request timestamp using Date.now()
3. Attach these to req.locals for downstream use
4. Add `x-request-id` header to responses

Include comprehensive tests in src/middleware/log-context.test.ts covering: normal requests, missing headers, and concurrent requests.

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-07):
@kody full

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `615-260407-190929` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24099507335))

To rerun: `@kody rerun 615-260407-190929 --from <stage>`

