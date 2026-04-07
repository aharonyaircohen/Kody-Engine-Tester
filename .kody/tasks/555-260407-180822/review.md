## Verdict: FAIL

## Summary

This diff introduces JWT-based login/refresh API routes, migrates UserRole to RbacRole, and creates roles.ts for the auth system. However, the COMMITTED code has critical security and architectural issues: logout doesn't invalidate access tokens (they remain valid for 15 minutes), no logout route endpoint exists in the App Router, and login/refresh routes create independent JwtService instances instead of using shared singletons.

## Findings

### Critical

1. **`src/app/api/auth/logout/route.ts`** (MISSING in committed state) — The `auth-context.tsx` calls `POST /api/auth/logout` but there is no `src/app/api/auth/logout/route.ts` in the committed state. The `src/api/auth/logout.ts` is a utility module, not a route handler. All logout calls from the frontend would return 404.
   - **Suggested fix**: Create `src/app/api/auth/logout/route.ts` as a POST handler that calls `logout()` from `src/api/auth/logout.ts`.

2. **`src/api/auth/logout.ts:4-7`** (COMMITTED) — `logout()` has `_accessToken` and `_allDevices` parameters prefixed with `_` (unused). The function only calls `authService.logout(userId)` which nulls the refreshToken in the DB, but **access tokens remain valid for 15 minutes after logout**. The `blacklistToken()` function in `auth-middleware.ts` is never invoked.
   - **Suggested fix**: Pass `JwtService` to `logout()` and call `jwtService.blacklist(accessToken)` to immediately invalidate the access token.

3. **`src/app/api/auth/login/route.ts:4-7`** and **`src/app/api/auth/refresh/route.ts:4-7`** (COMMITTED) — Both routes create their own `JwtService` and `AuthService` instances (`new JwtService(...)`, `new AuthService(...)`) instead of using the singleton pattern. Since `JwtService` stores the token blacklist in an in-memory Map, blacklists created by logout in one instance would NOT be visible to tokens verified in other instances.
   - **Suggested fix**: Import `getAuthService()` from `@/middleware/auth-middleware` to use the shared singleton.

### Major

4. **`src/app/api/auth/login/route.test.ts`** and **`src/app/api/auth/refresh/route.test.ts`** (MISSING in committed state) — The new route handlers have no co-located test files in the committed state. Working tree has untracked `route.test.ts` files.
   - **Suggested fix**: Add integration tests for both `/api/auth/login` and `/api/auth/refresh` route handlers.

5. **`src/middleware/auth-middleware.ts:18`** (COMMITTED) — `RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000` (1 hour) is too permissive. A rate limit of 100 requests per hour provides little protection against burst attacks compared to the standard 100 per minute.
   - **Suggested fix**: Change to `60 * 1000` (1 minute) to match conventional rate limiting.

### Minor

6. **`src/auth/jwt-service.ts:114-121`** (COMMITTED) — `cleanupBlacklist()` removes expired entries from the in-memory Map but is **never called**. The Map grows indefinitely.
   - **Suggested fix**: Call `cleanupBlacklist()` on a timer or integrate cleanup into `blacklist()`.

### Informational

- **Pre-existing TypeScript errors**: `src/services/discussions.ts` has type errors (`'"student"'` not assignable to `RbacRole`) outside this diff's scope.
- **Task description mismatch**: Task says "replace `session-store.ts` with `jwt-store.ts` using RS256 tokens" but `jwt-store.ts` was never created and HS256 is still used. This is not a bug in the diff itself, but a scope gap.
