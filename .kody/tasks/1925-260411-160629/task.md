# Add auth middleware to protect routes

## Context
Middleware that validates JWT tokens on incoming requests. Protects existing routes by ensuring only authenticated users with a valid token can access them. Depends on the /login and /register endpoints having been implemented first.

## Acceptance Criteria
- Middleware extracts Bearer token from Authorization header
- Middleware verifies JWT signature using the secret key
- Middleware returns 401 Unauthorized if token is missing, expired, or invalid
- Middleware attaches decoded user info (userId, email) to request context
- Middleware is applied to specified protected routes
- Protected routes are NOT enumerated in this task — only the middleware itself

## Test Strategy
- Unit test: valid JWT passes through middleware
- Unit test: missing Authorization header returns 401
- Unit test: malformed JWT returns 401
- Unit test: expired JWT returns 401
- Unit test: request with valid token has user context attached

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-11):
@kody

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `1925-260411-160629` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286263090))

To rerun: `@kody rerun 1925-260411-160629 --from <stage>`

