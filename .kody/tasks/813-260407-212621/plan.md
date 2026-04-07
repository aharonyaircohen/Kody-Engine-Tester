Now I have a complete picture. Let me write the plan.

## Existing Patterns Found

- **`createAuthMiddleware` factory** (`src/middleware/auth-middleware.ts`): Creates Express-style middleware that extracts Bearer tokens, returns 401 on invalid/missing tokens, and attaches `user` + `session` to `AuthContext`. Already has full unit test coverage in `auth-middleware.test.ts`.
- **`withAuth` HOC** (`src/auth/withAuth.ts`): Next.js route handler wrapper using `AuthService.verifyAccessToken`. Used by all protected routes (enroll, gradebook, notes, notifications, quizzes, admin-stats).
- **Module singletons** (`src/auth/index.ts`): Exports `userStore`, `sessionStore`, `jwtService` instances for use by `createAuthMiddleware`.
- **Wrapper pattern**: `rate-limiter.ts` exports `createRateLimiterMiddleware` factory returning a function.

The key insight: `createAuthMiddleware` is Express-style (calls `next()`), while Next.js routes return `Response`. An adapter wrapper is needed to bridge them.

## Plan

**Step 1: Add integration test for protected route rejection**
- File: `src/app/api/health/health.test.ts` (NEW)
- Creates an integration test that verifies the `/api/health` route (after middleware is applied) returns 401 without a valid token
- Uses `fetch` against the route with no auth header

**Step 2: Apply `createAuthMiddleware` to health route via adapter**
- File: `src/app/api/health/route.ts`
- Import `createAuthMiddleware` from `@/middleware/auth-middleware`
- Import singleton instances (`userStore`, `sessionStore`, `jwtService`) from `@/auth`
- Create a local `authMiddleware` using the factory
- Create an inline adapter that calls `authMiddleware`, converts `AuthContext` to `Response` or passes `AuthContext` to the route handler as a second argument
- Apply the adapter to the GET handler
- Verify: `pnpm test:int` passes

**Step 3: Run full test suite**
- Verify all tests pass

```json
{
  "task_type": "feature",
  "title": "Apply auth middleware to protect existing routes",
  "description": "Apply the existing `createAuthMiddleware` factory to `/api/health` route as a demonstration. An adapter bridges the Express-style middleware (returns `AuthContext`) to Next.js route handler (returns `Response`). Integration test verifies unauthenticated requests return 401.",
  "scope": [
    "src/app/api/health/route.ts",
    "src/app/api/health/health.test.ts",
    "src/middleware/auth-middleware.ts",
    "src/middleware/auth-middleware.test.ts"
  ],
  "risk_level": "medium",
  "existing_patterns": [
    "src/middleware/auth-middleware.ts: `createAuthMiddleware(userStore, sessionStore, jwtService)` factory — already tested for 401 on missing/invalid tokens and user attachment",
    "src/auth/index.ts: exports singleton instances `userStore`, `sessionStore`, `jwtService` used by the middleware factory",
    "src/middleware/rate-limiter.ts: `createRateLimiterMiddleware` factory pattern — same structural pattern as `createAuthMiddleware`"
  ],
  "questions": []
}
```
