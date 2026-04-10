## Pattern Discovery Report

- **JWT Service already exists** at `src/auth/jwt-service.ts` with full implementation (sign, verify, blacklist, access/refresh tokens)
- **AuthService** at `src/auth/auth-service.ts` already uses JWT + Payload DB for token storage (not session-store)
- **withAuth HOC** at `src/auth/withAuth.ts` already wraps routes with JWT validation and RBAC checks
- **ROLE_HIERARCHY + checkRole** in `src/auth/_auth.ts` already implements hierarchical RBAC
- **role-guard.ts** exists but imports from mismatched types (UserStore.UserRole vs RbacRole)
- **Dual auth inconsistency**: UserStore (SHA-256, in-memory) vs AuthService (PBKDF2, JWT, Payload DB) — AuthService should be the target
- **Only 1 route file** (`src/routes/notifications.ts`) already uses withAuth correctly

## Implementation Plan

### Step 1: Deprecate session-store.ts
**File:** `src/auth/session-store.ts`
**Change:** Add `@deprecated use auth-service.ts JWT handling instead` JSDoc comment at top of file
**Why:** session-store.ts pattern is superseded by jwt-service.ts + auth-service.ts. Keeping file (not deleting) preserves test file references and allows gradual migration
**Verify:** `pnpm lint` passes

### Step 2: Fix role-guard.ts type imports
**File:** `src/middleware/role-guard.ts`
**Change:** Remove imports from `../auth/user-store` and `../auth/auth-service`. Update to import `RbacRole` from `../auth/_auth.ts` or `../auth/auth-service.ts` and remove the `ROLE_HIERARCHY` import from `_auth` since `role-guard.ts` is redundant with `checkRole` in `_auth.ts`
**Why:** role-guard.ts currently mixes UserRole (5 values) with RbacRole (3 values) causing type conflicts. The `checkRole` in `_auth.ts` is the canonical RBAC implementation
**Verify:** `pnpm lint` and `pnpm test:int` pass

### Step 3: Create rbac.ts middleware (optional consolidation)
**File:** `src/middleware/rbac.ts`
**Change:** Create a thin re-export/wrapper combining `requireRole` from role-guard.ts with `checkRole` from `_auth.ts` for route-level use:
```typescript
export { requireRole } from './role-guard'
export { checkRole, extractBearerToken } from '../auth/_auth'
export type { RbacRole } from '../auth/auth-service'
```
**Why:** Provides single import point for RBAC utilities in route handlers
**Verify:** `pnpm lint` passes

### Step 4: Verify notifications route uses withAuth
**File:** `src/routes/notifications.ts`
**Change:** Confirm route already uses `withAuth` HOC correctly (no changes likely needed)
**Why:** Route already follows the correct pattern — JWT validation via withAuth, no direct session-store usage
**Verify:** `pnpm test:int` passes

### Step 5: Create migration guide
**File:** `docs/auth-migration.md`
**Change:** Document the auth architecture decisions:
- AuthService (Payload DB + JWT) is the canonical auth system
- UserStore is deprecated (in-memory, SHA-256 — do not use for new code)
- RbacRole = admin/editor/viewer (from auth-service.ts)
- UserRole mapping: admin→admin, user→viewer, instructor→editor, student/guest→viewer
- session-store.ts is deprecated, jwt-service.ts handles token operations
**Why:** Records architectural decisions for future developers
**Verify:** File created at correct path

### Step 6: Run full test suite
**Change:** Execute `pnpm test:int` and `pnpm lint`
**Why:** Confirms no regressions from deprecating session-store.ts and updating role-guard.ts
**Verify:** All tests pass

## Questions

- **JWT token storage**: Recommend Payload DB (like auth-service.ts) over in-memory (session-store.ts pattern) — auth-service.ts already stores refresh tokens in the users collection. Approve Payload DB approach?
- **UserRole → RbacRole mapping**: Recommend mapping to 3-role system (admin→admin, user→viewer, instructor→editor, student/guest→viewer). Approve this mapping?
- **session-store.ts deletion**: Recommend keeping as deprecated (not deleting) to avoid breaking test imports and allow rollback during migration. Approve deprecation over deletion?
