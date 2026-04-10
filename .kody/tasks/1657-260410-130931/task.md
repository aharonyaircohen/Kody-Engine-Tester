# [run-20260410-1307] T02: Add middleware with tests

## Task
Add a CORS middleware module in `src/middleware/cors-middleware.ts` that provides configurable Cross-Origin Resource Sharing headers. Create a corresponding test file `src/middleware/cors-middleware.test.ts`.

## Context
The existing middleware directory has auth, rate-limiting, validation, and other utilities. A CORS middleware is needed to handle browser cross-origin requests.

## Acceptance Criteria
- Exports a `createCorsMiddleware` factory function accepting an options object
- Supports: `origin`, `methods`, `allowedHeaders`, `exposedHeaders`, `credentials`, `maxAge` options
- Returns a middleware function compatible with the existing middleware interface
- Unit tests cover all options and edge cases

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody full

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1657-260410-130931` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24244510518))

To rerun: `@kody rerun 1657-260410-130931 --from <stage>`

