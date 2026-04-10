# Add auth middleware to protect routes

## Context
Middleware intercepts requests to protected routes, validates the JWT token, and attaches the user to the request context. This secures existing routes that require authentication.

## Acceptance Criteria
- Middleware reads JWT from Authorization header (Bearer scheme)
- Returns 401 with appropriate error message if token is missing or invalid
- Attaches decoded user payload to request context on valid token
- Passes request through unchanged if token is valid
- Supports excluding certain routes (e.g., /login, /register) from protection

## Test Strategy
- Unit tests for middleware with valid JWT, missing JWT, expired JWT, malformed JWT
- Integration tests confirming protected routes return 401 without auth
- Integration tests confirming protected routes succeed with valid auth

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1678-260410-131453` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24244726823))

To rerun: `@kody rerun 1678-260410-131453 --from <stage>`

