# Add auth middleware to protect routes

## Context
Auth middleware protects existing routes by validating JWT tokens on incoming requests. It extracts the user from a valid token and injects it into the request context. This task depends on the login/register endpoints existing to generate tokens.

## Acceptance Criteria
- Middleware extracts JWT from `Authorization: Bearer <token>` header
- Returns 401 Unauthorized for missing or invalid tokens
- Decodes user id and email from token payload
- Injects user context into request for downstream handlers
- Works with existing route handlers without modification
- Unit tests covering valid token, missing token, invalid/expired token scenarios

## Test Strategy
- Test valid token passes through with user context set
- Test missing Authorization header returns 401
- Test malformed token returns 401
- Test expired token returns 401
- Test token with invalid signature returns 401

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1340-260410-044444` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24226818420))

To rerun: `@kody rerun 1340-260410-044444 --from <stage>`

