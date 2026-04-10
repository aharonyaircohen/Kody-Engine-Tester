# [run-20260410-0144] T02: Add timeout middleware with tests

## Task
Add a `timeout-middleware.ts` in `src/middleware/` that adds request timeout handling.

## Requirements
- Creates a timeout middleware that wraps Express request handlers
- Configurable timeout via `req.timeout` or default (30s)
- Returns 504 Gateway Timeout if handler exceeds timeout
- Emits 'timeout' event on the request object
- Includes `timeout-middleware.test.ts` with unit tests

## Complexity
MEDIUM — this is a self-contained middleware with async edge cases.

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody full

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1255-260410-014656` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24222255059))

To rerun: `@kody rerun 1255-260410-014656 --from <stage>`

