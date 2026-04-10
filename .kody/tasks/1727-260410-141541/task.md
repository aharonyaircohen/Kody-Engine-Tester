# Add auth middleware to protect routes

## Context
Protects existing API routes by validating JWT tokens on incoming requests. Reusable middleware that can be applied to any route requiring authentication. Complements existing middleware patterns (csrf-middleware, rate-limiter).

## Acceptance Criteria
- Middleware extracts Bearer token from Authorization header
- Returns 401 if token is missing or malformed
- Returns 403 if token is expired
- Attaches decoded user payload to request context on success
- Reusable via withAuth wrapper or direct middleware application
- Excludes public routes: /api/auth/*, /api/health

## Test Strategy
- Unit test: valid token passes through with user attached
- Unit test: missing token returns 401
- Unit test: expired token returns 403
- Unit test: malformed token returns 401
- Integration test: protected route rejects unauthenticated request

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1727-260410-141541` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24247321861))

To rerun: `@kody rerun 1727-260410-141541 --from <stage>`

