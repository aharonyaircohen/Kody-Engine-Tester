# Add auth middleware to protect routes

## Context
Existing routes need to be protected so only authenticated users can access them. The middleware verifies JWT tokens from the Authorization header and attaches the user to the request context.

## Acceptance Criteria
- Middleware extracts Bearer token from `Authorization: Bearer <token>` header
- Returns 401 if no token provided or token is invalid/expired
- Attaches `req.user = { userId, email }` on success
- Works as Express/fastify/etc middleware depending on project's web framework
- Protected route example demonstrates usage with a test route

## Test Strategy
- Unit tests: missing header, malformed token, expired token, valid token
- Integration test: call a protected endpoint with and without token

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1730-260410-141515` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24247323185))

To rerun: `@kody rerun 1730-260410-141515 --from <stage>`

