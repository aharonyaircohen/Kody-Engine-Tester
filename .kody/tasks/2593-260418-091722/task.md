# Audit and verify route auth coverage

## Context
The codebase has `withAuth` HOC protecting API routes. This task is to verify all routes that should be protected are covered, and document any intentional exceptions.

## Acceptance Criteria
- All /api/* routes (except /health and /csrf-token) use withAuth HOC
- Routes with `{ optional: true }` allow unauthenticated reads but reject unauthenticated writes where appropriate
- Role-based access control is correctly configured on all protected routes
- /health endpoint remains unprotected (health check)
- /csrf-token endpoint remains on its own CSRF-based auth mechanism

## Test Strategy
- Code review: enumerate all route files and verify withAuth usage
- Manual: verify unauthenticated requests to protected routes return 401
- Manual: verify authenticated requests with correct roles succeed
- Manual: verify authenticated requests with wrong roles return 403

---

## Discussion (1 comments)

**@aharonyaircohen** (2026-04-18):
@kody

