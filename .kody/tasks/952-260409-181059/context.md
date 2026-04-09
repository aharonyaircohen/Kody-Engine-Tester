
### taskify (2026-04-09T18:14:39)
The auth middleware implementation already exists and all tests pass.

**Implementation Summary:**

| File | Purpose |
|------|---------|
| `src/middleware/auth-middleware.ts` | Factory function `createAuthMiddleware` that returns auth middleware |
| `src/middleware/auth-middleware.test.ts` | 8 unit tests covering all token validation scenarios |
| `src/auth/withAuth.ts` | HOC that wraps API route handlers with auth |
| `src/auth/jwt-service.ts` | JWT signing/verification service |

**Acceptance
...(truncated)

### build (2026-04-09T18:16:43)
The auth middleware implementation is complete and verified:

**Summary:**

| Acceptance Criteria | Status |
|---|---|
| Middleware extracts Bearer token from Authorization header | ✓ |
| Returns 401 with `{ error: "..." }` when token is missing, expired, or invalid | ✓ |
| Attaches decoded user context (userId, email) to request object on success | ✓ |
| Middleware is applied to routes that require authentication | ✓ (via `withAuth` HOC) |
| Public routes (login, register) are not protected | ✓
...(truncated)
