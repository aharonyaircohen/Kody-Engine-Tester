# Add auth middleware to protect routes

## Context
Existing routes need protection so only authenticated users can access them. The middleware intercepts requests, extracts and validates the JWT from the Authorization header, and attaches the user context to the request for downstream handlers.

## Acceptance Criteria
- Middleware extracts Bearer token from Authorization header
- Invalid/missing token returns 401 Unauthorized
- Expired token returns 401 Unauthorized
- Valid token attaches decoded user info (userId) to request context
- Middleware is reusable and can be applied to any route that needs protection
- Existing routes are annotated or updated to use the middleware

## Test Strategy
- Unit tests for token extraction from various header formats
- Unit tests for token validation (valid, expired, malformed)
- Integration tests: protected route with valid token (200), protected route with no token (401), protected route with invalid token (401)
- Verify unauthenticated requests to protected endpoints are blocked

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1559-260410-105856` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24239650984))

To rerun: `@kody rerun 1559-260410-105856 --from <stage>`

