
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
