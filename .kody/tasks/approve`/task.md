# Add auth middleware to protect routes

## Context
JWT-authenticated routes need protection via `withAuth` middleware. The `src/auth/withAuth.ts` HOC already exists and provides JWT verification and role-based access control. This task ensures existing routes that require authentication are properly wrapped and protected.

## Acceptance Criteria
- Protected routes (enrollment, gradebook, quiz submission) use `withAuth` HOC
- `withAuth` extracts Bearer token from Authorization header
- Token verification returns 401 for missing/invalid tokens
- Role-based access works: specified roles are checked, returns 403 if unauthorized
- Public routes remain accessible without authentication
- Existing tests in `src/auth/*.test.ts` continue to pass

## Test Strategy
- Unit test `withAuth` with valid token, invalid token, and missing token
- Unit test role checking with authorized and unauthorized roles
- Integration test protected endpoints reject unauthenticated requests
- Integration test protected endpoints reject unauthorized roles

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2497-260418-035348`

**@aharonyaircohen** (2026-04-18):
🤔 **Kody has questions before proceeding:**

1. Should enrollment, gradebook, and quiz API routes be identified by file path patterns (src/app/api/enrollment/**/*.ts) or by route-grouping convention (routes grouped under (protected)/)?
2. What specific roles should each route require? UserStore.UserRole uses 'admin'|'user'|'guest'|'student'|'instructor' but RbacRole uses 'admin'|'editor'|'viewer' — there is a mismatch that needs resolution before role-based access can be implemented correctly.
3. Are there existing integration test suites for API routes to extend, or should a new test file be created for the auth protection integration tests?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `approve``

