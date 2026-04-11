# [run-20260411-0214] T02: Add middleware with tests

Add a new CORs middleware in src/middleware/cors.ts with comprehensive unit tests in src/middleware/cors.test.ts.

The middleware should:
1. Set appropriate CORS headers (Access-Control-Allow-Origin, etc.)
2. Handle preflight OPTIONS requests
3. Support configurable allowed origins
4. Include proper TypeScript types

This is a MEDIUM complexity task.

---

## Discussion (5 comments)

**@aharonyaircohen** (2026-04-11):
@kody full

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `1840-260411-021512` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24272361204))

To rerun: `@kody rerun 1840-260411-021512 --from <stage>`

**@aharonyaircohen** (2026-04-11):
🏗️ **Kody has architecture questions:**

1. Should disallowed origins return a 403 with CORS headers, or just omit the `Access-Control-Allow-Origin` header? (The latter is more permissive/silent, the former more strict)

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-11):
@kody approve

1. Return 403 with CORS headers for disallowed origins (strict approach)

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `approve`` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24272411544))

To rerun: `@kody rerun approve` --from <stage>`

