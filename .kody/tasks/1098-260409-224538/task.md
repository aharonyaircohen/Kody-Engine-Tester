# Add auth middleware to protect routes

## Context
Implement JWT validation middleware to protect existing routes. This middleware extracts and verifies JWT tokens from incoming requests, ensuring only authenticated users can access protected endpoints. Depends on the login/register endpoints task.

## Acceptance Criteria
- Middleware extracts Bearer token from Authorization header
- Invalid/missing tokens return 401 Unauthorized
- Valid tokens attach user info (userId, email) to request context
- Middleware is composable and can be applied to specific routes or route groups
- Follows project conventions for middleware structure

## Test Strategy
- Unit tests for token extraction from various header formats
- Unit tests for token validation (valid, expired, malformed)
- Integration tests: protected route with valid token, protected route without token, protected route with invalid token

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `1098-260409-224538` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24216989690))

To rerun: `@kody rerun 1098-260409-224538 --from <stage>`

