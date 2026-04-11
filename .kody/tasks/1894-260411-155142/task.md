# Add auth middleware to protect routes

## Context
Protects existing API routes by verifying JWT tokens on requests. Any route that requires authentication will use this middleware.

## Acceptance Criteria
- Middleware extracts Bearer token from Authorization header
- Returns 401 if token is missing, expired, or invalid
- Attaches decoded userId to req.user or equivalent context
- Can be applied to specific routes or route groups
- Unprotected routes (e.g., /login, /register) remain accessible without token

## Test Strategy
- Unit test: valid token passes middleware and attaches user to request
- Unit test: missing token returns 401
- Unit test: expired token returns 401
- Unit test: malformed token returns 401
- Integration test: protected route rejects unauthenticated request with 401
- Integration test: protected route accepts authenticated request and returns data

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-11):
@kody

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `1894-260411-155142` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286015563))

To rerun: `@kody rerun 1894-260411-155142 --from <stage>`

