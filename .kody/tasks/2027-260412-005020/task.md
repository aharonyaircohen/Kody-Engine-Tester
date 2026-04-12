# Add auth middleware to protect routes

## Context
Adds middleware that validates JWT tokens on protected routes. This middleware extracts and verifies the JWT from the Authorization header and attaches the user to the request context.

## Acceptance Criteria
- Middleware in `src/middleware/auth.ts`
- Reads Bearer token from Authorization header
- Verifies JWT signature and expiration
- Attaches `userId` to request context on success
- Returns 401 Unauthorized for missing or invalid tokens
- Can be applied to any route that needs protection

## Test Strategy
- Unit test: valid token passes through with userId attached
- Unit test: missing token returns 401
- Unit test: expired token returns 401
- Unit test: malformed token returns 401

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-11):
@kody

**@aharonyaircohen** (2026-04-12):
@kody full

