# Add auth middleware to protect routes

## Context
Middleware that validates JWT tokens on protected routes. Rejects requests without a valid token, allowing downstream route handlers to assume an authenticated user context.
## Acceptance Criteria
- Middleware extracts Bearer token from Authorization header
- Returns 401 if no token provided or token is invalid/expired
- Attaches decoded user payload (id, email) to request context on success
- All existing routes that require authentication are decorated with this middleware
## Test Strategy
- Unit test: valid JWT passes middleware and attaches user to request
- Unit test: missing token returns 401
- Unit test: malformed token returns 401
- Unit test: expired token returns 401
- Integration test: protected route rejects unauthenticated request, accepts authenticated request

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-07):
@kody

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `600-260407-182737` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24097662759))

To rerun: `@kody rerun 600-260407-182737 --from <stage>`

