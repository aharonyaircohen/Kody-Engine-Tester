The JWT auth redesign has been substantially implemented. All auth and middleware tests pass (76 tests total). Let me create a verification plan.

## Plan: Verify JWT Auth Implementation

### Step 1: Verify core JWT service works with token lifecycle
**File:** `src/auth/jwt-service.ts`  
**Change:** No changes needed - already implemented with HS256 signing  
**Verify:** `pnpm vitest run src/auth/jwt-service.test.ts`

### Step 2: Verify AuthService login/refresh/verify/logout flow
**File:** `src/auth/auth-service.ts`  
**Change:** No changes needed  
**Verify:** `pnpm vitest run src/auth/auth-service.test.ts`

### Step 3: Verify RBAC middleware and role hierarchy
**File:** `src/middleware/role-guard.ts`, `src/auth/_auth.ts`  
**Change:** No changes needed  
**Verify:** `pnpm vitest run src/middleware/role-guard.test.ts src/middleware/auth-middleware.test.ts`

### Step 4: Verify user schema has required fields
**File:** `src/collections/Users.ts`  
**Change:** No changes needed - already has role, permissions, refreshToken, tokenExpiresAt, lastLogin fields  
**Verify:** `grep -n "role\|permissions\|refreshToken" src/collections/Users.ts`

### Step 5: Verify database migration for user fields
**File:** `src/migrations/20260405_000000_add_users_permissions_lastLogin.ts`  
**Change:** No changes needed  
**Verify:** `cat src/migrations/20260405_000000_add_users_permissions_lastLogin.ts`

### Step 6: Verify API routes use withAuth RBAC
**File:** `src/app/api/notes/route.ts`, etc.  
**Change:** No changes needed - routes already use `withAuth(handler, { roles: [...] })`  
**Verify:** `grep -n "withAuth" src/app/api/*/route.ts src/app/api/*/*/route.ts`

### Step 7: Run all auth tests to confirm implementation
**Change:** None  
**Verify:** `pnpm vitest run src/auth src/middleware/auth-middleware src/middleware/role-guard --reporter=verbose`

---

## Existing Patterns Found

- `src/auth/jwt-service.ts` - JWT signing with HS256, token blacklisting, access/refresh token generation (15min/7day)
- `src/auth/auth-service.ts` - AuthService with login (PBKDF2 password verify), refresh (token rotation), verifyAccessToken, logout
- `src/auth/withAuth.ts` - HOC wrapper for route handlers with JWT validation and role checks
- `src/middleware/role-guard.ts` - requireRole() function using ROLE_HIERARCHY for role inheritance
- `src/auth/_auth.ts` - extractBearerToken, checkRole, ROLE_HIERARCHY constants
- `src/collections/Users.ts` - User collection with role select, refreshToken, tokenExpiresAt, lastLogin, permissions fields
- `src/migrations/20260405_000000_add_users_permissions_lastLogin.ts` - Adds lastLogin and permissions columns

## Verification Summary

| Requirement | Status | Notes |
|------------|--------|-------|
| JWT-based auth | ✅ Done | Uses HS256 (not RS256 as specified) |
| User schema with roles | ✅ Done | admin/editor/viewer roles in Users collection |
| Permissions arrays | ✅ Done | `permissions` text[] field exists |
| RBAC middleware | ✅ Done | withAuth HOC + checkRole |
| Token refresh with rotation | ✅ Done | generation counter increments on refresh |
| Database migration | ✅ Done | 20260405 migration adds columns |
| API routes use RBAC | ✅ Done | notes, quizzes, gradebook, notifications |
| Auth flow integration tests | ✅ Done | 59 auth tests + 17 middleware tests pass |

## Questions

- **HS256 vs RS256**: The implementation uses HS256 (symmetric) instead of the specified RS256 (asymmetric). HS256 is simpler and sufficient for most use cases. RS256 would allow public key verification (useful if you wanted to verify tokens on other services without sharing the secret). Should we accept HS256 or migrate to RS256?
- **Remaining session-store.ts**: The old `src/auth/session-store.ts` still exists alongside the new JWT system. Should this be removed since JWT replaced session-based auth?
- **Integration test failure**: The `tests/int/api.int.spec.ts` test fails due to a database query parameter issue (not related to auth). Should this be fixed as part of this task?
