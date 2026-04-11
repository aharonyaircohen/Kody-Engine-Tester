# Add auth middleware to protect routes

## Context
Middleware that validates JWT tokens on protected routes. Extracts user context for route handlers. Depends on login/register endpoints existing first.

## Acceptance Criteria
- Middleware validates Bearer token from Authorization header
- Returns 401 Unauthorized for missing or invalid tokens
- Attaches decoded user (userId, email) to request context on success
- Applied to existing routes that require authentication (specify which routes in implementation)
- Supports both route-level and global middleware registration

## Test Strategy
- Unit tests for middleware token validation (valid, expired, malformed)
- Integration tests for protected route access (with and without token)
- Test edge cases: empty token, expired token, malformed JWT

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-11):
@kody

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `1928-260411-160647` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286265498))

To rerun: `@kody rerun 1928-260411-160647 --from <stage>`

**@aharonyaircohen** (2026-04-11):
⚡ **Complexity: low** — skipping plan, review, review-fix (not needed for low-risk tasks)

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24286265498))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286356286))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24286265498)) --from <stage>`

