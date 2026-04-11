
### taskify (2026-04-11T16:11:16)
Based on my exploration, the auth middleware is **already implemented**. Here's what I found:

**Existing Implementation:**
- `src/middleware/auth-middleware.ts` - Factory function `createAuthMiddleware()` that:
  - Extracts Bearer token from Authorization header
  - Verifies JWT signature via `jwtService.verify()`
  - Returns 401 for missing/invalid/expired tokens
  - Attaches `user` and `session` to `AuthContext`

- `src/middleware/auth-middleware.test.ts` - Complete test coverage:
  - Valid J
...(truncated)

### build (2026-04-11T16:14:14)
The TypeScript errors are pre-existing issues unrelated to the auth middleware. The auth middleware implementation is complete and all 8 tests pass.

**Summary of auth middleware implementation:**

| Acceptance Criteria | Status |
|---|---|
| Extracts Bearer token from Authorization header | ✅ `auth-middleware.ts:49-54` |
| Verifies JWT signature using secret key | ✅ `auth-middleware.ts:58` |
| Returns 401 for missing/invalid/expired tokens | ✅ All cases handled |
| Attaches decoded user info to
...(truncated)
