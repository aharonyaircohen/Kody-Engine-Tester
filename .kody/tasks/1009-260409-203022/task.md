# Add auth middleware to protect routes

## Context
Create middleware that validates JWT tokens on incoming requests and rejects unauthenticated access to protected routes. This applies the authentication layer to existing routes.

## Acceptance Criteria
- Middleware extracts Bearer token from Authorization header
- Middleware validates JWT signature and expiration
- Middleware attaches decoded user context (userId) to request
- Protected routes return 401 when no valid token is provided
- Middleware can be applied selectively to route groups

## Test Strategy
- Unit tests: middleware returns 401 for missing Authorization header
- Unit tests: middleware returns 401 for expired JWT
- Unit tests: middleware returns 401 for invalid signature
- Unit tests: middleware attaches userId to request for valid token
- Integration tests: protected route accessible with valid token, 401 without

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `1009-260409-203022` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24211808927))

To rerun: `@kody rerun 1009-260409-203022 --from <stage>`

