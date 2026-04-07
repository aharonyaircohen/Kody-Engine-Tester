# Add auth middleware to protect routes

## Context
Create middleware that validates JWT tokens on protected routes. This prevents unauthenticated access to existing API endpoints.

## Acceptance Criteria
- Middleware extracts and validates JWT from Authorization header
- Returns 401 if token missing or invalid
- Attaches user context to request for downstream handlers
- Works with existing route structure without modification

## Test Strategy
- Unit test: valid token passes through
- Unit test: missing token returns 401
- Unit test: expired/invalid token returns 401
- Integration test: protected endpoint rejects unauthenticated request, accepts authenticated request

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-07):
@kody

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `765-260407-210208` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24104238557))

To rerun: `@kody rerun 765-260407-210208 --from <stage>`

