# Add auth middleware to protect existing routes

## Context
This middleware verifies JWT tokens on protected routes, preventing unauthenticated access. It wraps existing routes to enforce that callers present a valid, non-expired token. Depends on the `/login` and `/register` endpoints existing to understand token structure.

## Acceptance Criteria
- Middleware extracts Bearer token from `Authorization` header
- Invalid/missing/expired token returns 401 Unauthorized
- Valid token attaches `user { userId, email }` to the request context
- Middleware is implemented as reusable middleware function
- All existing routes that require auth are wrapped with this middleware

## Test Strategy
- Unit tests for middleware: valid token passes, missing header returns 401, malformed token returns 401, expired token returns 401
- Integration tests: protected endpoint accessible with valid token, returns 401 without token

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-11):
@kody

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `1897-260411-155219` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286023964))

To rerun: `@kody rerun 1897-260411-155219 --from <stage>`

