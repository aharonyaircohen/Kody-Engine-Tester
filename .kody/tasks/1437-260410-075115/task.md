# Add auth middleware to protect routes

## Context
Existing routes need to be protected so only authenticated users can access them. This middleware validates JWTs on incoming requests and rejects unauthenticated ones.

## Acceptance Criteria
- Middleware extracts JWT from `Authorization: Bearer <token>` header
- Returns 401 Unauthorized if no token or invalid token
- Attaches decoded user payload to `req.user` for downstream handlers
- Can be applied to specific routes or route groups

## Test Strategy
- Unit tests for token validation (valid, expired, malformed, missing)
- Integration test that protected route rejects unauthenticated request
- Integration test that protected route accepts request with valid JWT

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1437-260410-075115` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24232607335))

To rerun: `@kody rerun 1437-260410-075115 --from <stage>`

