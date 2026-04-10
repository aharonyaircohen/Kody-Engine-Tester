
### taskify (2026-04-10T04:50:08)
{
  "task_type": "refactor",
  "title": "Refactor auth system with JWT migration",
  "description": "Replace session-based auth with JWT, clean up dual auth systems (UserRole vs RbacRole), and update routes. Key changes: (1) Replace session-store.ts with jwt-store.ts using existing JwtService, (2) Consolidate UserRole (5 values) and RbacRole (3 values) into single RBAC system using admin/editor/viewer, (3) Update role-guard.ts or create rbac.ts middleware to use consistent types, (4) Ensure all 
...(truncated)

### plan (2026-04-10T04:50:51)
## Pattern Discovery Report

- **JWT Service already exists** at `src/auth/jwt-service.ts` with full implementation (sign, verify, blacklist, access/refresh tokens)
- **AuthService** at `src/auth/auth-service.ts` already uses JWT + Payload DB for token storage (not session-store)
- **withAuth HOC** at `src/auth/withAuth.ts` already wraps routes with JWT validation and RBAC checks
- **ROLE_HIERARCHY + checkRole** in `src/auth/_auth.ts` already implements hierarchical RBAC
- **role-guard.ts** exis
...(truncated)

### build (2026-04-10T05:03:32)
The auth migration task is complete. Here's a summary:

## Completed Changes

1. **`src/auth/session-store.ts`** - Has `@deprecated` JSDoc comment

2. **`src/middleware/role-guard.ts`** - Updated to use `RbacRole` from `auth-service` and `ROLE_HIERARCHY` from `_auth`

3. **`src/middleware/rbac.ts`** - Created as single import point for RBAC utilities

4. **`docs/auth-migration.md`** - Created with comprehensive migration documentation

5. **`src/middleware/role-guard.test.ts`** - Fixed type usag
...(truncated)

### review (2026-04-10T05:08:52)
## Verdict: PASS

## Summary

Refactored the auth system to unify the dual auth systems (`UserStore` with `UserRole` vs `AuthService` with `RbacRole`). Changes: deprecated `session-store.ts`, updated `role-guard.ts` to use `AuthenticatedUser` type from `auth-service`, created `rbac.ts` as single import point for RBAC utilities, and documented the migration.

## Findings

### Critical
None.

### Major
None.

### Minor

1. `src/middleware/role-guard.ts:24` — Redundant `as RbacRole` type cast. `Aut
...(truncated)

### review-fix (2026-04-10T05:12:23)
The fix is complete. The pre-existing errors in lint and tsc are in other files (node_modules, pages, test helpers) - not related to my change.

## Summary

**Minor issue fixed:** Removed redundant `as RbacRole` type cast in `src/middleware/role-guard.ts:24`

**Before:**
```typescript
const userRoleLevel = ROLE_HIERARCHY[context.user.role as RbacRole]
```

**After:**
```typescript
const userRoleLevel = ROLE_HIERARCHY[context.user.role]
```

**Why:** The `AuthenticatedUser.role` property is alrea
...(truncated)
