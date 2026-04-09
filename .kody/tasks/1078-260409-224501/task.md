# [run-20260409-2239] T02: Add HTTP method decorator middleware

## Task
Create a `method-guard.ts` middleware in `src/middleware/` that restricts route handlers to specific HTTP methods (GET, POST, PUT, DELETE).

## Requirements
- Accepts a list of allowed methods as configuration
- Returns a middleware function that checks `request.method`
- Returns 405 Method Not Allowed for disallowed methods
- Includes test file with edge case coverage

---

## Discussion (3 comments)

**@aharonyaircohen** (2026-04-09):
@kody full

**@aharonyaircohen** (2026-04-09):
@kody full

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `1078-260409-224501` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24216976169))

To rerun: `@kody rerun 1078-260409-224501 --from <stage>`

