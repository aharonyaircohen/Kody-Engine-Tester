# [run-20260410-1053] T02: Add middleware with tests

## Task
Add a `cache-control` middleware in `src/middleware/cache-control.ts` that sets appropriate cache headers for different response types. Include tests in `cache-control.test.ts`.

The middleware should:
1. Set `Cache-Control` headers based on response type (public, private, no-store)
2. Support `etag` generation for conditional requests
3. Handle `Vary: Accept-Encoding` for compressible responses
4. Export a `createCacheControlMiddleware` factory function

This is a MEDIUM complexity task for testing the explicit `@kody full` command path.

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody full

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1542-260410-105522` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24239523575))

To rerun: `@kody rerun 1542-260410-105522 --from <stage>`

