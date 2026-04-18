# Add auth middleware to protect existing API routes

## Context
The codebase has an existing `withAuth` HOC (`src/auth/withAuth.ts`) that wraps route handlers with JWT validation and RBAC checks. However, no routes currently use it. This task applies `withAuth` to all existing protected API routes under `src/app/api/` (notes, quizzes, courses, enroll, gradebook) and ensures the middleware extracts the JWT from the `Authorization: Bearer <token>` header correctly.

## Acceptance Criteria
- All routes under `src/app/api/notes`, `src/app/api/quizzes`, `src/app/api/courses`, `src/app/api/enroll`, `src/app/api/gradebook` are wrapped with `withAuth`
- `withAuth` extracts bearer token via `extractBearerToken` helper (existing in `src/auth/`)
- Invalid/missing token returns 401 with `{ error: 'Unauthorized' }`
- Role checks via `checkRole` utility gate access to admin-only endpoints (gradebook write operations)
- Public routes (health check, auth endpoints) remain unprotected

## Test Strategy
- Integration test: calling protected endpoint without token returns 401
- Integration test: calling protected endpoint with valid token succeeds
- Integration test: calling admin-only endpoint with non-admin role returns 403
- Manual verification: `pnpm test:int` passes; existing E2E smoke tests pass


---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2634-260418-095432`

