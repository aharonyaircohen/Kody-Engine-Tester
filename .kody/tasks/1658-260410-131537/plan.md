Now I have a complete picture. Let me create the implementation plan.

## Existing Patterns Found

- `src/auth/_auth.ts:17-21` - `ROLE_HIERARCHY` constant (admin=3, editor=2, viewer=1) — to be extracted to `rbac.ts`
- `src/auth/_auth.ts:37-61` - `checkRole` function with hierarchical inheritance — to be reused in `rbac.ts`
- `src/auth/jwt-service.ts:23-122` - `JwtService` with sign/verify/blacklist — already implemented
- `src/auth/auth-service.ts:62-262` - `AuthService` using Payload CMS + JWT — already implemented, handles login/refresh/verify/logout
- `src/auth/withAuth.ts:55-108` - `withAuth` HOC using `authService.verifyAccessToken` — already implemented
- `src/collections/Users.ts:76-86` - Payload `Users` collection with `role: select` already using `['admin', 'editor', 'viewer']`
- `src/migrations/*.ts` - Payload migration pattern with `up`/`down` functions

## Questions

1. **Should `user-store.ts` and `session-store.ts` be deleted or kept as deprecated stubs?** The `AuthService` already handles all user management via Payload CMS. Keeping stubs may cause confusion.

2. **Should the new `rbac.ts` include permission masks beyond role hierarchy?** The task mentions "specific permission masks" but `checkRole` only uses hierarchical role comparison (admin > editor > viewer).

3. **Should `auth-middleware.ts` be deprecated in favor of `withAuth.ts`?** `withAuth` already handles JWT validation + role checking. The middleware pattern with rate limiting is a separate concern.

---

## Implementation Plan

### Step 1: Create `src/auth/rbac.ts` with tests

**File:** `src/auth/rbac.ts`
**Change:** Create new file extracting RBAC from `_auth.ts`. Add `Permission` type and `hasPermission` function with explicit permission masks per role.
**Why:** Task requires `rbac.ts` as a distinct module; separation of concerns from `_auth.ts`.
**Verify:** `pnpm test:int src/auth/rbac.test.ts`

```typescript
import type { AuthenticatedUser, RbacRole } from './auth-service'

export type Permission = 
  | 'users:read' | 'users:write' | 'users:delete'
  | 'courses:read' | 'courses:write' | 'courses:delete'
  | 'grades:read' | 'grades:write'
  | 'enrollments:read' | 'enrollments:write'

export const ROLE_HIERARCHY: Record<RbacRole, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
}

export const ROLE_PERMISSIONS: Record<RbacRole, Permission[]> = {
  admin: ['users:read', 'users:write', 'users:delete', 'courses:read', 'courses:write', 'courses:delete', 'grades:read', 'grades:write', 'enrollments:read', 'enrollments:write'],
  editor: ['courses:read', 'courses:write', 'grades:read', 'enrollments:read', 'enrollments:write'],
  viewer: ['courses:read', 'enrollments:read'],
}

export function hasPermission(user: AuthenticatedUser, permission: Permission): boolean {
  const userPermissions = ROLE_PERMISSIONS[user.role]
  return userPermissions?.includes(permission) ?? false
}

export function checkRole(user: AuthenticatedUser | undefined, roles: RbacRole[] | undefined): { user?: AuthenticatedUser; error?: string; status?: number } {
  if (!user) return { error: 'Authentication required', status: 401 }
  if (!roles || roles.length === 0) return { user }
  if (!user.role) return { error: 'User role not configured', status: 401 }
  
  const userRoleLevel = ROLE_HIERARCHY[user.role]
  const hasSufficientRole = roles.some((requiredRole) => userRoleLevel >= ROLE_HIERARCHY[requiredRole])
  
  if (!hasSufficientRole) {
    return { error: `Forbidden: requires role ${roles.join(' or ')}`, status: 403 }
  }
  return { user }
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}
```

---

### Step 2: Update `src/auth/_auth.ts` to import from `rbac.ts`

**File:** `src/auth/_auth.ts`
**Change:** Remove duplicated `ROLE_HIERARCHY`, `checkRole`, `extractBearerToken` implementations; re-export from `rbac.ts` for backward compatibility.
**Why:** DRY; maintain backward compatibility for existing importers.
**Verify:** `pnpm test:int src/auth/`

---

### Step 3: Update `src/api/auth/login.ts` to use `AuthService`

**File:** `src/api/auth/login.ts`
**Change:** Replace `UserStore` + `SessionStore` + direct JWT usage with `AuthService.login()`. Remove session creation logic since `AuthService` handles token rotation via Payload.
**Why:** `AuthService` already implements the correct login flow with JWT; the old in-memory stores are not used in production.
**Verify:** `pnpm test:int src/api/auth/login.test.ts`

---

### Step 4: Update `src/api/auth/login.test.ts`

**File:** `src/api/auth/login.test.ts`
**Change:** Rewrite tests to use `AuthService` instead of `UserStore` + `SessionStore`. Mock Payload SDK and `JwtService`.
**Why:** TDD — tests must reflect new implementation.
**Verify:** `pnpm test:int src/api/auth/login.test.ts`

---

### Step 5: Update `src/middleware/auth-middleware.ts` to use `AuthService`

**File:** `src/middleware/auth-middleware.ts`
**Change:** Replace `UserStore` + `SessionStore` validation with `authService.verifyAccessToken()`. Keep rate limiting since it's a separate concern.
**Why:** `AuthService.verifyAccessToken` already validates JWTs; session tracking is no longer needed.
**Verify:** `pnpm test:int src/middleware/auth-middleware.test.ts`

---

### Step 6: Update `src/middleware/auth-middleware.test.ts`

**File:** `src/middleware/auth-middleware.test.ts`
**Change:** Rewrite tests to use `AuthService` mock instead of `UserStore` + `SessionStore`.
**Why:** TDD — tests must reflect new implementation.
**Verify:** `pnpm test:int src/middleware/auth-middleware.test.ts`

---

### Step 7: Deprecate `src/auth/user-store.ts` and `src/auth/session-store.ts`

**File:** `src/auth/user-store.ts`
**Change:** Add `/** @deprecated Use AuthService with Payload CMS instead */` deprecation comment. No code changes needed since existing tests still import it.
**Why:** Signals that these are no longer for production use; allows tests to continue passing during transition.

**File:** `src/auth/session-store.ts`
**Change:** Add `/** @deprecated JWT tokens are validated directly via JwtService; sessions no longer needed */`
**Why:** Same rationale.

---

### Step 8: Add Payload migration for user schema (if needed)

**File:** `src/migrations/YYYYMMDD_HHMMSS_migrate_user_roles.ts`
**Change:** Create migration only if existing users need transformation. Since `Users` collection already uses `RbacRole`, check if migration is needed before creating.
**Why:** Task requires migration script; may not be needed if schema is already correct.
**Verify:** `pnpm payload migrate`

---

### Step 9: Update `src/auth/withAuth.ts` to import `checkRole` from `rbac.ts`

**File:** `src/auth/withAuth.ts`
**Change:** Update import to use `checkRole` from `rbac.ts` instead of local import from `_auth.ts`.
**Why:** After extracting to `rbac.ts`, update imports for consistency.
**Verify:** `pnpm test:int src/auth/withAuth.test.ts` (if exists) or manual verification

---

### Step 10: Run full test suite

**Verify:** `pnpm test:int`

---

## Summary of Changes

| File | Action |
|------|--------|
| `src/auth/rbac.ts` | **Create** — RBAC with permission masks |
| `src/auth/_auth.ts` | **Update** — Re-export from rbac.ts |
| `src/auth/user-store.ts` | **Deprecate** — Add deprecation comment |
| `src/auth/session-store.ts` | **Deprecate** — Add deprecation comment |
| `src/api/auth/login.ts` | **Update** — Use AuthService |
| `src/api/auth/login.test.ts` | **Update** — Test with AuthService |
| `src/middleware/auth-middleware.ts` | **Update** — Use AuthService |
| `src/middleware/auth-middleware.test.ts` | **Update** — Test with AuthService |
| `src/auth/withAuth.ts` | **Update** — Import from rbac.ts |
| `src/migrations/` | **Add** — If schema migration needed |
