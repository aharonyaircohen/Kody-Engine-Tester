# Verify auth middleware protects all sensitive routes

## Context
The `withAuth` HOC exists and is already applied to most sensitive routes (notes, quizzes, gradebook, enroll, etc.). However, since the User collection lacked proper `hash`/`salt` fields, the AuthService's password verification was not functioning correctly. With tasks 1 and 2 complete, the full auth flow (register → login → access protected routes) should work end-to-end. This task verifies all protected routes correctly reject unauthenticated requests and accept authenticated ones with valid JWTs.

## Acceptance Criteria
- All routes currently wrapped with `withAuth` correctly return 401 for missing/invalid tokens
- All routes currently wrapped with `withAuth` correctly return 403 for insufficient roles (when role restrictions apply)
- Authenticated requests with valid tokens are allowed through
- Token refresh flow works via `/api/auth/refresh` endpoint
- Logout invalidates the session properly

## Test Strategy
- Integration test: protected route without Authorization header returns 401
- Integration test: protected route with invalid token returns 401
- Integration test: protected route with valid token succeeds
- Integration test: role-restricted route with insufficient role returns 403
- Integration test: full flow - register → login → access protected route → refresh token → logout

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2793-260418-164941`

