# Add JWT auth middleware to protect routes

## Context
Middleware that guards existing routes by requiring a valid JWT in the Authorization header. Any route that needs protection (e.g., /profile, /settings, /api/private/*) will use this middleware. Depends on the login endpoint to understand JWT validation.

## Acceptance Criteria
- Middleware extracts JWT from `Authorization: Bearer <token>` header
- Middleware returns 401 Unauthorized if token is missing
- Middleware returns 401 Unauthorized if token is invalid/expired
- Valid token injects decoded user payload into request context
- Protected routes receive the authenticated user via request context
- Public routes (login, register) are NOT protected by default

## Test Strategy
- Unit test: missing header returns 401
- Unit test: malformed token returns 401
- Unit test: valid token passes user payload to next handler
- Integration test: protected endpoint rejects unauthenticated request
- Integration test: protected endpoint accepts request with valid token
- Integration test: expired token returns 401

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-07):
@kody

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `572-260407-181901` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24097290881))

To rerun: `@kody rerun 572-260407-181901 --from <stage>`

