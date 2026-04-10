
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
