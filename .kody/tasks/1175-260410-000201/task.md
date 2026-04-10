# Add auth middleware to protect routes

## Context
Existing routes need to be protected so only authenticated users can access them. The middleware validates JWT tokens from the Authorization header. This depends on the /login and /register endpoints working.

## Acceptance Criteria
- Middleware extracts Bearer token from Authorization header
- Valid JWT allows request to proceed
- Invalid or missing token returns 401 Unauthorized
- Middleware attaches decoded user payload to request context
- Middleware is composable with existing route handlers

## Test Strategy
- Unit test: valid token allows request through
- Unit test: missing Authorization header returns 401
- Unit test: malformed token returns 401
- Unit test: expired token returns 401
- Integration test: protected route accessible with valid token, inaccessible without

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1175-260410-000201` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24219370214))

To rerun: `@kody rerun 1175-260410-000201 --from <stage>`

