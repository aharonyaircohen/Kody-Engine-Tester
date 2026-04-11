
### taskify (2026-04-11T15:57:08)
{
  "task_type": "feature",
  "title": "Add auth middleware to protect existing routes",
  "description": "Create a Next.js middleware.ts file that uses the existing auth-middleware factory to protect API routes. The middleware should extract Bearer tokens from Authorization headers, return 401 for invalid/missing/expired tokens, and attach user { userId, email } to request context for valid tokens. The existing auth-middleware.ts is a factory function that needs to be instantiated and connected
...(truncated)

### plan (2026-04-11T15:58:28)
After reviewing the codebase, I can see:

1. `src/middleware/auth-middleware.ts` exists with a `createAuthMiddleware` factory
2. `src/middleware/auth-middleware.test.ts` exists with comprehensive unit tests
3. **No** `src/middleware.ts` (Next.js App Router middleware entry point) exists
4. Routes already use `withAuth` HOC from `@/auth/withAuth`
5. The `auth-middleware.ts` uses `UserStore`/`SessionStore` (in-memory) while `withAuth` uses `AuthService` (Payload CMS)

The gap is that `auth-middlew
...(truncated)

### build (2026-04-11T16:01:37)
All middleware tests pass (132 tests). Let me provide a summary of the implementation:

## Summary

I implemented the auth middleware to protect existing routes as specified in the task:

### Created Files

**`src/middleware.ts`** - Next.js App Router middleware entry point that:
- Uses `createAuthMiddleware` factory from `src/middleware/auth-middleware.ts`
- Creates module-level singleton instances of `UserStore`, `SessionStore`, and `JwtService`
- Extracts Bearer token from `Authorization` hea
...(truncated)
