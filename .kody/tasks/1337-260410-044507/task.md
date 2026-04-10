# Add auth middleware to protect routes

## Context
Middleware is needed to protect existing routes by verifying JWT tokens on incoming requests. This depends on the /login endpoint to exist so tokens can be validated.

## Acceptance Criteria
- Middleware extracts JWT from Authorization header (Bearer scheme)
- Middleware returns 401 for missing or invalid token
- Middleware attaches decoded userId to request context
- Middleware is applied to existing routes that require authentication
- Public routes (/login, /register, health check) are not protected

## Test Strategy
- Unit tests: verify token extraction from valid header, verify rejection of malformed tokens
- Integration tests: request to protected route without token returns 401, request with valid token succeeds

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1337-260410-044507` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24226811283))

To rerun: `@kody rerun 1337-260410-044507 --from <stage>`

