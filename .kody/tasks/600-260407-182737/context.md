
### taskify (2026-04-07T18:34:31)
The implementation already exists and satisfies all acceptance criteria:

1. **`src/middleware/auth-middleware.ts`** - Implements Bearer token extraction, 401 returns, and user context attachment
2. **`src/middleware/auth-middleware.test.ts`** - Contains all required unit tests
3. **All protected routes** use `withAuth` wrapper

```json
{
  "task_type": "chore",
  "title": "Verify existing implementation of auth middleware",
  "description": "The auth middleware already exists at src/middleware/
...(truncated)

### build (2026-04-07T18:37:19)
The auth middleware implementation is verified and complete.

**Summary:**

**Implementation exists at:**
- `src/middleware/auth-middleware.ts` - Factory `createAuthMiddleware` with JWT validation, session checking, user lookup, and rate limiting
- `src/auth/withAuth.ts` - HOC wrapper for route handlers with role-based access control

**Tests pass (8/8):**
- Valid JWT passes and attaches user to request context
- Missing token returns 401
- Invalid token returns 401
- Expired token returns 401
-
...(truncated)
