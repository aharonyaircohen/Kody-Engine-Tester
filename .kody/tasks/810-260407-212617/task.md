# Add auth middleware to protect routes

## Context
Create middleware that validates JWT tokens on protected routes. This middleware will be applied to existing routes that require authentication, ensuring only requests with valid tokens can access them.

## Acceptance Criteria
- Middleware extracts and validates JWT from Authorization header (Bearer scheme)
- Invalid or missing token returns 401 Unauthorized
- Middleware attaches decoded user info to request context
- Middleware is composable and can be applied to any route handler

## Test Strategy
- Unit test: valid token passes through and attaches user to context
- Unit test: missing token returns 401
- Unit test: expired token returns 401
- Unit test: malformed token returns 401
- Integration test: protected route rejects request without token, accepts with valid token

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-07):
@kody

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `810-260407-212617` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24105195682))

To rerun: `@kody rerun 810-260407-212617 --from <stage>`

