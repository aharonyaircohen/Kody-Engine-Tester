# [Auth] Auth middleware for route protection

**Priority:** medium
**Depends on:** [Auth] Login and register endpoints

Add auth middleware to protect existing routes. `src/middleware/auth-middleware.ts` already implements `createAuthMiddleware` factory with rate limiting and JWT verification. Evaluate integrating with existing `withAuth` HOC at `src/auth/withAuth.ts`.

## Scope
- `src/middleware/auth-middleware.ts`
- `src/auth/withAuth.ts`

## Questions
- Should `auth-middleware.ts` be used alongside `withAuth` HOC or replace it?

## Test Strategy
- Existing tests: `src/middleware/auth-middleware.test.ts` covers auth middleware behavior
- Verify protected routes reject requests without valid JWT
- Verify protected routes accept requests with valid JWT
- Verify rate limiting is applied correctly
- Verify RBAC role checks work correctly