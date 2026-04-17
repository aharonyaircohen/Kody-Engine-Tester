# Wire auth middleware to protect existing API routes

## Context
The `withAuth` HOC already exists and can wrap route handlers for JWT validation and RBAC. This task applies `withAuth` to protect existing routes that should require authentication.

## Acceptance Criteria
- Identify routes requiring auth: `/api/notes`, `/api/quizzes/*`, `/api/courses/search`, `/api/enroll`, `/api/gradebook/*`
- Wrap each route handler with `withAuth` HOC
- `withAuth` accepts optional `allowedRoles` parameter for RBAC (e.g., only `editor`/`admin` can access gradebook)
- Unauthenticated requests return 401 with `{ error: 'Unauthorized' }`
- Requests with insufficient role return 403 with `{ error: 'Forbidden' }`

## Test Strategy
- Integration: request `/api/notes` without token → 401
- Integration: request `/api/notes` with valid token → passes through
- Integration: request `/api/gradebook/course/1` as `viewer` role → 403
- Integration: request `/api/gradebook/course/1` as `admin` role → 200

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-17):
@kody

**@aharonyaircohen** (2026-04-17):
🚀 Kody pipeline started: `2337-260417-190815`

