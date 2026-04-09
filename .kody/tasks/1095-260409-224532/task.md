# Add auth middleware to protect routes

## Context
Create middleware that validates JWT tokens on protected routes. This middleware will be applied to existing routes that require authentication. Depends on the /login and /register endpoints because it uses the same JWT validation logic.

## Acceptance Criteria
- Middleware extracts and validates JWT from Authorization header (Bearer scheme)
- Returns 401 Unauthorized for missing or invalid tokens
- Attaches decoded user information (e.g., userId) to the request context for downstream handlers
- Works with any route handler that needs protection
- Handles edge cases: malformed header, expired token, tampered token

## Test Strategy
- Unit tests for middleware logic: valid token passes, missing token returns 401, invalid token returns 401, expired token returns 401
- Integration test: apply middleware to a test route, verify authenticated request succeeds and unauthenticated fails
- Manual verification: temporarily protect an existing route and confirm it requires auth

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `1095-260409-224532` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24216985197))

To rerun: `@kody rerun 1095-260409-224532 --from <stage>`

