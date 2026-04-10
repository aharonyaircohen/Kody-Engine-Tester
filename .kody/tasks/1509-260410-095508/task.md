# Add auth middleware to protect routes

## Context
Protects existing routes by verifying JWT tokens on incoming requests. This is the final piece that ties auth to the rest of the application — without it, routes are open.

## Acceptance Criteria
- Middleware extracts Bearer token from Authorization header
- Returns 401 if token missing or invalid/expired
- Attaches decoded user payload to `req.user` for downstream handlers
- Applied to routes that require authentication (exact routes TBD — apply to all existing API routes that lack auth)
- Middleware in kebab-case file (e.g., `auth.middleware.ts`)
- Rejects expired tokens with appropriate error message

## Test Strategy
- Unit tests: valid token, missing token, malformed token, expired token
- Integration test: protected route returns 401 without auth, succeeds with valid token
- Manual verification: confirm protected endpoints are inaccessible without valid JWT

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1509-260410-095508` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24237305407))

To rerun: `@kody rerun 1509-260410-095508 --from <stage>`

