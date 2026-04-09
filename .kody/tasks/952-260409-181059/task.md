# Add auth middleware to protect routes

## Context
Middleware that validates JWT tokens on protected routes. Extracts the Authorization header, validates the JWT, and attaches user context to the request. All existing routes that require authentication will use this middleware.

## Acceptance Criteria
- Middleware extracts Bearer token from Authorization header
- Returns 401 with `{ error: "Unauthorized" }` when token is missing, expired, or invalid
- Attaches decoded user context (userId, email) to request object on success
- Middleware is applied to routes that require authentication
- Public routes (login, register) are not protected

## Test Strategy
- Unit tests for token validation logic (valid token, expired token, malformed token, missing token)
- Integration tests: protected route returns 401 without token, returns data with valid token
- Integration tests: verify user context is correctly attached to request

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `952-260409-181059` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24205875646))

To rerun: `@kody rerun 952-260409-181059 --from <stage>`

