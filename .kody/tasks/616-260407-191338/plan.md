## Existing Patterns Found

- `src/auth/auth-service.ts` — Full JWT-based auth using Payload CMS with `login()`, `refresh()`, `verifyAccessToken()`, and `logout()` methods following PBKDF2 password hashing
- `src/auth/jwt-service.ts` — JWT signing/verification with `signAccessToken()` (15min) and `signRefreshToken()` (7 days), plus token blacklisting
- `src/auth/_auth.ts:17-21` — `ROLE_HIERARCHY` constant mapping `admin > editor > viewer` with numeric levels
- `src/auth/_auth.ts:37-61` — `checkRole()` function already implements hierarchical role permission checks
- `src/auth/withAuth.ts` — HOC already uses `AuthService.verifyAccessToken()` and `checkRole()` for JWT validation
- `src/migrations/*.ts` — Payload migration pattern with `up()` and `down()` functions using raw SQL
- `src/auth/auth-service.test.ts` — Test pattern using `vi.fn()` mocks for Payload SDK

---

## Plan

### Step 1: Create migration script for user schema changes

**File:** `src/migrations/20260407_000000_migrate_auth_to_jwt_rbac.ts`
**Change:** Create migration that:
- Adds `roles` column as `text[]` array to users table
- Adds `rbacRole` column as `text` (mapped from old role)
- Migrates existing users: `student/instructor/guest/user` → `viewer`, `admin` stays `admin`
- Drops `permissions` column if it exists (old schema)
- Marks old sessions invalid via `sessionRevokedAt` timestamp column
**Why:** Database schema change must happen before code changes
**Verify:** `pnpm test:int` passes

---

### Step 2: Update UserStore to align with RbacRole

**File:** `src/auth/user-store.ts`
**Change:** Replace `UserRole` type (`'admin'|'user'|'guest'|'student'|'instructor'`) with `RbacRole` (`'admin'|'editor'|'viewer'`). Update `hashPassword` to use PBKDF2 instead of SHA-256 (matching `AuthService`). Add `roles: RbacRole[]` array field.
**Why:** Unify the dual auth systems — UserStore should use the same role type and hashing as AuthService
**Verify:** `pnpm test:int` — UserStore tests should pass

---

### Step 3: Create rbac.ts with role permission checks

**File:** `src/auth/rbac.ts`
**Change:** Extract `ROLE_HIERARCHY` and `checkRole` from `_auth.ts` into a dedicated `rbac.ts` module. Add `hasPermission(user, permission)` and `canAccessRole(user, targetRole)` helpers.
```typescript
import type { RbacRole } from './auth-service'

export const ROLE_HIERARCHY: Record<RbacRole, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
}

export function checkRole(user: AuthenticatedUser | undefined, roles: RbacRole[] | undefined): AuthContext { ... }
export function canAccessRole(userRole: RbacRole, targetRole: RbacRole): boolean { ... }
```
**Why:** Single responsibility — RBAC logic belongs in its own module, not mixed with auth extraction utilities
**Verify:** `pnpm test:int` — existing withAuth tests should pass

---

### Step 4: Update withAuth.ts to use rbac.ts

**File:** `src/auth/withAuth.ts`
**Change:** Update imports to use `checkRole` from `./rbac` instead of `./_auth`. Remove redundant `checkRole` export from `withAuth.ts`.
**Why:** After extracting RBAC to rbac.ts, withAuth should import from the new module
**Verify:** `pnpm test:int`

---

### Step 5: Update src/auth/_auth.ts to re-export from rbac.ts

**File:** `src/auth/_auth.ts`
**Change:** Keep `extractBearerToken` and `AuthContext`/`AuthOptions` types. Re-export `checkRole` and `ROLE_HIERARCHY` from `./rbac` for backward compatibility.
**Why:** Maintain existing import paths (`from './_auth'`) that other files use
**Verify:** `pnpm test:int`

---

### Step 6: Update auth/index.ts to remove SessionStore exports

**File:** `src/auth/index.ts`
**Change:** Remove `SessionStore` import and export. Keep `UserStore`, `JwtService`, and type exports.
```typescript
import { UserStore } from './user-store'
import { JwtService } from './jwt-service'
// Remove: import { SessionStore } from './session-store'

export const userStore = new UserStore()
export const jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')
// Remove: export const sessionStore = new SessionStore()
```
**Why:** SessionStore is being deprecated — JWT tokens are self-contained and don't need server-side session storage
**Verify:** `pnpm test:int`

---

### Step 7: Update middleware/auth-middleware.ts to remove SessionStore dependency

**File:** `src/middleware/auth-middleware.ts`
**Change:** Remove `SessionStore` from the middleware. JWT tokens are verified via `jwtService.verify()` and user lookup via Payload. Remove session generation tracking since JWT handles this via `generation` claim.
```typescript
export function createAuthMiddleware(
  userStore: UserStore,
  jwtService: JwtService  // Remove sessionStore
) {
  return async function authMiddleware(req: RequestContext): Promise<AuthContext> {
    // Remove sessionStore.findByToken() and session.generation checks
    // JWT generation is handled by the token itself via the generation claim
  }
}
```
**Why:** JWT tokens contain generation counter — no need for server-side session tracking
**Verify:** `pnpm test:int` — auth-middleware tests should pass

---

### Step 8: Update src/api/auth/login.ts to remove SessionStore

**File:** `src/api/auth/login.ts`
**Change:** Remove `SessionStore` dependency. Use `jwtService.signAccessToken()` and `jwtService.signRefreshToken()` directly. No longer create sessions — tokens are self-contained.
```typescript
export async function login(
  email: string,
  password: string,
  ipAddress: string,
  userAgent: string,
  userStore: UserStore,
  jwtService: JwtService  // Remove sessionStore
): Promise<LoginResult> {
  // Remove: sessionStore.create() call
  // Remove: sessionStore.refresh() call
}
```
**Why:** JWT tokens don't require server-side session storage
**Verify:** `pnpm test:int` — login tests should pass

---

### Step 9: Update src/auth/session-store.ts to deprecate

**File:** `src/auth/session-store.ts`
**Change:** Add `/** @deprecated Use JwtService tokens instead — sessions are now self-contained in JWT */` deprecation comment at the top. Keep the class but mark for removal in future version.
**Why:** Signal to consumers that SessionStore is deprecated but avoid breaking changes during transition
**Verify:** `pnpm test:int`

---

### Step 10: Add integration test for auth migration

**File:** `src/auth/auth-migration.test.ts`
**Change:** Create integration test that:
- Seeds a user with old role mapping (student → viewer, instructor → editor)
- Verifies JWT login works with new RBAC roles
- Verifies old sessions are invalidated via migration timestamp
**Why:** TDD approach — test the migration behavior before full deployment
**Verify:** `pnpm test:int` passes

---

### Step 11: Verify full test suite

**Change:** Run `pnpm test:int` and `pnpm build` to confirm all auth changes work end-to-end.
**Verify:** All tests pass, build succeeds
