
### taskify (2026-04-07T20:46:41)
Based on my exploration, I can see:

1. **JWT auth already exists** - `AuthService` and `JwtService` in `src/auth/` handle JWT-based authentication with access/refresh tokens
2. **RBAC already defined** - `RbacRole = 'admin' | 'editor' | 'viewer'` with role hierarchy in `src/auth/_auth.ts`
3. **Users collection already updated** - Has `role` field with `['admin', 'editor', 'viewer']` options, plus `refreshToken`, `tokenExpiresAt`, `lastTokenUsedAt`, `lastLogin` fields
4. **Payload migrations alr
...(truncated)

### plan (2026-04-07T20:48:12)
Plan created at `.kody/tasks/718-260407-203237/plan.md`.

**Summary**: The JWT auth infrastructure already exists (`AuthService`, `JwtService`, RBAC roles, updated Users collection, `withAuth` HOC). The missing piece is the API route handlers (`/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/register`, `/api/auth/profile`) that the frontend `AuthContext` expects.

The plan covers:
1. Creating the 5 missing auth API routes
2. Marking legacy `session-store.ts` and `user-store
...(truncated)

### build (2026-04-07T20:52:52)
Implementation complete. Here's what was done:

## Summary

### 1. Created 5 Auth API Routes
- **`/api/auth/login/route.ts`** - POST login with email/password, returns JWT tokens
- **`/api/auth/refresh/route.ts`** - POST refresh tokens using refresh token
- **`/api/auth/logout/route.ts`** - POST logout (uses withAuth HOC)
- **`/api/auth/register/route.ts`** - POST register new users with viewer role
- **`/api/auth/profile/route.ts`** - GET/PATCH user profile (uses withAuth HOC with RBAC)

### 2.
...(truncated)

### review (2026-04-07T20:56:55)
## Verdict: FAIL

## Summary

This diff creates 5 new auth API routes (login, logout, profile, refresh, register) and adds a Payload migration for auth token fields. The routes correctly use the existing `AuthService`/`JwtService` infrastructure and `withAuth` HOC. However, there are **3 critical/major issues** that must be addressed before merge: the logout endpoint fails to invalidate refresh tokens server-side, the `isActive` user deactivation mechanism is non-functional due to a missing DB c
...(truncated)

### review-fix (2026-04-07T20:59:23)
All critical and major issues have been fixed:

## Summary of Fixes

### Critical Issues

1. **`logout/route.ts`** - Now calls `authService.logout(user.id)` to invalidate the refresh token in the database, preventing token replay after logout.

2. **`Users.ts` + migration** - Added `isActive` field (checkbox, default `true`) to the Users collection schema. Updated the migration to include the `isActive` column so the `isActive` check in `AuthService` actually works.

### Major Issues

3. **`logi
...(truncated)

### review (2026-04-07T20:59:58)
## Verdict: PASS

## Summary

This diff creates 5 new auth API routes (login, logout, profile, refresh, register) and adds a Payload migration for auth token fields + `isActive` column. The routes correctly use the existing `AuthService`/`JwtService` infrastructure and `withAuth` HOC. All previously identified critical/major issues have been addressed.

## Findings

### Critical

None.

### Major

None.

### Minor

**`src/app/api/auth/login/route.ts:19`** and **`src/app/api/auth/refresh/route.ts
...(truncated)

### review-fix (2026-04-07T21:00:36)
The implementation is complete and the review passed. Here's the final summary:

## Completed Implementation

**Auth API Routes Created:**
- `src/app/api/auth/login/route.ts` - POST login
- `src/app/api/auth/refresh/route.ts` - POST token refresh
- `src/app/api/auth/logout/route.ts` - POST logout (with server-side token invalidation)
- `src/app/api/auth/register/route.ts` - POST registration
- `src/app/api/auth/profile/route.ts` - GET/PATCH profile

**Schema & Migration Updates:**
- Added `isAct
...(truncated)
