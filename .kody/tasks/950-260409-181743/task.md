# Add auth middleware to protect routes

## Context
Middleware is needed to protect existing routes by verifying JWT tokens. Requests without valid tokens should be rejected with 401.

## Acceptance Criteria
- Auth middleware extracts JWT from Authorization header (Bearer token format)
- Middleware validates token signature and expiration
- Protected routes reject requests without valid token with 401 status
- Middleware attaches user info (userId, email) to request context for downstream use
- Configurable list of routes to protect via middleware configuration

## Test Strategy
- Unit tests for token extraction from various header formats
- Unit tests for token validation (valid, expired, malformed, wrong signature)
- Integration tests: protected route returns 401 without token
- Integration tests: protected route succeeds with valid token

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `950-260409-181126` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24205873448))

To rerun: `@kody rerun 950-260409-181126 --from <stage>`

**@aharonyaircohen** (2026-04-09):
🤔 **Kody has questions before proceeding:**

1. Should all API routes be protected by default, or only specific routes? If specific, which routes should be protected?
2. Should the health check endpoint (/api/health) and other public routes be explicitly excluded from protection?
3. Should this middleware replace the existing withAuth HOC pattern used in individual routes, or work alongside it?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `950-260409-181743` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24206097999))

To rerun: `@kody rerun 950-260409-181743 --from <stage>`

