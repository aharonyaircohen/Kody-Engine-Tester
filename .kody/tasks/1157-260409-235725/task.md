# [run-20260409-2355] T02: Add retry middleware with tests

## Task
Add a retry middleware in `src/middleware/retry-middleware.ts`.

The middleware should:
- Retry failed HTTP requests with exponential backoff
- Configure max retries, base delay, and max delay via options
- Support configurable retry conditions (which errors to retry)
- Include comprehensive tests in `src/middleware/retry-middleware.test.ts`

## Context
Network requests can fail transiently. This middleware wraps HTTP calls and retries them automatically.

## Acceptance Criteria
- [ ] Middleware retries on network errors
- [ ] Exponential backoff is correctly calculated
- [ ] Max retry limit is respected
- [ ] All tests pass

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody full

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `1157-260409-235725` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24219246903))

To rerun: `@kody rerun 1157-260409-235725 --from <stage>`

