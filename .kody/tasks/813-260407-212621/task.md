# Add auth middleware to protect existing routes

## Context
Secures existing routes by requiring a valid JWT. The middleware validates the Authorization header and attaches the decoded user to the request.

## Acceptance Criteria
- Middleware extracts Bearer token from Authorization header
- Returns 401 if token missing or invalid
- Attaches decoded user payload to req.user on success
- Applied to at least one existing route as a demonstration
- Unit tests for token validation

## Test Strategy
- Unit test: request without token returns 401
- Unit test: request with invalid token returns 401
- Unit test: request with valid token proceeds to handler
- Integration test: protected route rejects unauthenticated request

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-07):
@kody

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `813-260407-212621` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24105214424))

To rerun: `@kody rerun 813-260407-212621 --from <stage>`

