# Add auth middleware to protect routes

## Context
Create middleware that validates JWT tokens on protected routes. This ensures only authenticated users can access certain endpoints. Depends on the login/register endpoints since it uses the same JWT logic.

## Acceptance Criteria
- Middleware extracts and validates JWT from Authorization header (Bearer scheme)
- Returns 401 Unauthorized for missing or invalid tokens
- Attaches decoded user info (userId) to request context for downstream handlers
- Works with existing route structure (does not break unprotected routes)

## Test Strategy
- Unit tests: valid token passes userId to request context
- Unit tests: missing token returns 401, malformed token returns 401, expired token returns 401
- Integration test: protected route rejects request without token, accepts with valid token

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1179-260410-000209` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24219375084))

To rerun: `@kody rerun 1179-260410-000209 --from <stage>`

