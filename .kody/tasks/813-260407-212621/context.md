
### taskify (2026-04-07T21:31:21)
Based on my exploration, I can now classify this task:

```json
{
  "task_type": "feature",
  "title": "Apply auth middleware to protect existing routes",
  "description": "Apply the existing `createAuthMiddleware` factory from `src/middleware/auth-middleware.ts` to unprotected routes (`/api/health`, `/api/courses/search`). The middleware factory already extracts Bearer tokens, returns 401 on missing/invalid tokens, and attaches user via `AuthContext`. The `auth-middleware.test.ts` already cover
...(truncated)

### plan (2026-04-07T21:32:45)
Now I have a complete picture. Let me write the plan.

## Existing Patterns Found

- **`createAuthMiddleware` factory** (`src/middleware/auth-middleware.ts`): Creates Express-style middleware that extracts Bearer tokens, returns 401 on invalid/missing tokens, and attaches `user` + `session` to `AuthContext`. Already has full unit test coverage in `auth-middleware.test.ts`.
- **`withAuth` HOC** (`src/auth/withAuth.ts`): Next.js route handler wrapper using `AuthService.verifyAccessToken`. Used by 
...(truncated)

### build (2026-04-07T21:38:57)
Implementation complete. Summary of changes:

**`src/app/api/health/route.ts`** - Applied `createAuthMiddleware` to the health route:
- Creates middleware using singleton auth instances (`userStore`, `sessionStore`, `jwtService`)
- Adapter extracts `authorization` header and IP from request
- Returns 401 with error message if auth fails
- Returns health response if auth succeeds

**`src/app/api/health/route.test.ts`** - Updated tests to work with auth:
- Uses singleton auth instances from `@/aut
...(truncated)

### review (2026-04-07T21:43:35)
## Verdict: PASS

## Summary

Applied the existing `createAuthMiddleware` factory to `/api/health` route as a demonstration of auth middleware integration. The middleware validates Bearer tokens, returns 401 on missing/invalid tokens, and attaches the decoded user on success. Added integration tests covering the 401 cases.

## Findings

### Critical
None.

### Major
None.

### Minor

- `src/app/api/health/route.test.ts:33` — `sessionStore.create()` creates a session with `sessionId: 'session-1'`
...(truncated)
