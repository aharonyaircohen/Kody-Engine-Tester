Now I have a complete picture. Let me write the plan.

## Existing Patterns Found

- `src/auth/_auth.ts`: `ROLE_HIERARCHY`, `checkRole()`, `extractBearerToken()` — already exported by `withAuth.ts`; reused by `role-guard.ts`
- `src/auth/auth-service.ts`: `AuthService` with `login()`, `refresh()`, `verifyAccessToken()`, `logout()` — uses Payload + JwtService; pattern to preserve
- `src/auth/jwt-service.ts`: JWT signing/verification with token blacklist already implemented
- `src/middleware/role-guard.ts`: `requireRole()` factory using `ROLE_HIERARCHY` — reusable pattern
- `src/app/api/enroll/route.ts`: Shows API route pattern using `withAuth` HOC with `roles` option
- `src/auth/index.ts`: Exports module-level singletons (`userStore`, `sessionStore`, `jwtService`)
- Migration files in `src/migrations/` follow `MigrateUpArgs`/`MigrateDownArgs` signature with raw SQL

---

## Plan

### Step 1: Create `src/auth/roles.ts` with RBAC constants

**File:** `src/auth/roles.ts`
**Change:** Create new file exporting `RbacRole` type, `ROLE_HIERARCHY`, and permission constants — extracted from `_auth.ts` to establish a dedicated roles module.
**Why:** Task requires `roles.ts` to exist; consolidates RBAC constants in one place rather than scattered across `_auth.ts`.
**Verify:** `pnpm tsc --noEmit` passes

```typescript
import type { RbacRole } from './auth-service'

export type { RbacRole } from './auth-service'

/**
 * Role hierarchy: higher numbers include permissions of lower numbers
 * admin (3) > editor (2) > viewer (1)
 */
export const ROLE_HIERARCHY: Record<RbacRole, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
}

export type Permission = 'read' | 'write' | 'delete' | 'admin'

export const ROLE_PERMISSIONS: Record<RbacRole, Permission[]> = {
  admin: ['read', 'write', 'delete', 'admin'],
  editor: ['read', 'write'],
  viewer: ['read'],
}

export function hasPermission(role: RbacRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}
```

---

### Step 2: Update `src/auth/_auth.ts` to import from `roles.ts`

**File:** `src/auth/_auth.ts`
**Change:** Replace inline `ROLE_HIERARCHY` with `export { ROLE_HIERARCHY } from './roles'`. Keep `extractBearerToken` and `checkRole` locally (they're small).
**Why:** DRY — `ROLE_HIERARCHY` lives in `roles.ts` now; `_auth.ts` re-exports it for backward compat with existing imports.
**Verify:** `pnpm tsc --noEmit` passes

---

### Step 3: Update `src/auth/user-store.ts` to use `RbacRole` (align with Payload)

**File:** `src/auth/user-store.ts`
**Change:** Replace `UserRole = 'admin'|'user'|'guest'|'student'|'instructor'` with `RbacRole = 'admin'|'editor'|'viewer'` imported from `auth-service`. Add JWT-specific fields (`refreshToken`, `tokenExpiresAt`, `lastTokenUsedAt`, `lastLogin`) to `User` interface. Update `seed()` to use only `RbacRole` values.
**Why:** Eliminates dual-role-system confusion; `UserStore` used only for test/dev should match Payload's actual `users` collection schema.
**Verify:** `pnpm test:int src/auth/user-store.test.ts` passes

---

### Step 4: Create `src/app/api/auth/login/route.ts`

**File:** `src/app/api/auth/login/route.ts`
**Change:** Create new file with `POST` handler calling `authService.login()`. Request body: `{ email, password }`. Response: `{ accessToken, refreshToken, user }`.
**Why:** `AuthService` has `login()` but no route handler exposes it. All other API routes use `withAuth` but there was no login endpoint.
**Verify:** `pnpm tsc --noEmit` passes

```typescript
import { NextRequest } from 'next/server'
import { withAuth } from '@/auth/withAuth'
import { getPayloadInstance } from '@/services/progress'
import { JwtService } from '@/auth/jwt-service'
import { AuthService } from '@/auth/auth-service'

const jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const payload = await getPayloadInstance()
    const authService = new AuthService(payload, jwtService)
    const result = await authService.login(email, password, req.headers.get('x-forwarded-for') ?? 'unknown', req.headers.get('user-agent') ?? 'unknown')

    return Response.json(result, { status: 200 })
  } catch (err) {
    const status = (err as { status?: number }).status ?? 401
    const message = err instanceof Error ? err.message : 'Login failed'
    return Response.json({ error: message }, { status })
  }
}
```

---

### Step 5: Create `src/app/api/auth/refresh/route.ts`

**File:** `src/app/api/auth/refresh/route.ts`
**Change:** Create `POST` handler calling `authService.refresh(refreshToken)`. Request body: `{ refreshToken }`. Response: `{ accessToken, refreshToken }`.
**Why:** `AuthService` has `refresh()` but no route handler. Token refresh is a required auth endpoint.
**Verify:** `pnpm tsc --noEmit` passes

```typescript
import { NextRequest } from 'next/server'
import { JwtService } from '@/auth/jwt-service'
import { AuthService } from '@/auth/auth-service'
import { getPayloadInstance } from '@/services/progress'

const jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return Response.json({ error: 'Refresh token is required' }, { status: 400 })
    }

    const payload = await getPayloadInstance()
    const authService = new AuthService(payload, jwtService)
    const result = await authService.refresh(refreshToken)

    return Response.json(result, { status: 200 })
  } catch (err) {
    const status = (err as { status?: number }).status ?? 401
    const message = err instanceof Error ? err.message : 'Refresh failed'
    return Response.json({ error: message }, { status })
  }
}
```

---

### Step 6: Update `src/middleware/auth-middleware.ts` to use `AuthService`

**File:** `src/middleware/auth-middleware.ts`
**Change:** Replace SessionStore/UserStore usage with `AuthService.verifyAccessToken()`. Remove SessionStore and UserStore imports. Keep rate limiting.
**Why:** `auth-middleware.ts` still uses old SessionStore pattern; should use the same `AuthService` that route handlers use via `withAuth`.
**Verify:** `pnpm test:int src/middleware/auth-middleware.test.ts` passes

---

### Step 7: Create migration `src/migrations/20260407_add_jwt_fields_to_users.ts`

**File:** `src/migrations/20260407_add_jwt_fields_to_users.ts`
**Change:** Add `roles` text[] column to users table (if not already present from prior migration). Note: Payload `Users` collection already has `refreshToken`, `tokenExpiresAt`, `lastTokenUsedAt`, `lastLogin` fields defined — verify via `db.execute(sql\`...\`)` that these exist.
**Why:** Task requires migration scripts for existing users. The Users collection in Payload already defines the JWT-specific fields, but a DB migration may be needed for existing tables.
**Verify:** `pnpm payload migrate` runs without error

---

### Step 8: Add token blacklist integration to `auth-middleware.ts`

**File:** `src/middleware/auth-middleware.ts`
**Change:** After token verification via `AuthService`, call `jwtService.blacklist(token)` on logout or token refresh. Ensure `verifyAccessToken` path does NOT blacklist (only explicit logout/refresh should).
**Why:** Task mentions "add token blacklist" — `JwtService` already has `blacklist()` method; integrate it into logout flow.
**Verify:** `pnpm test:int src/middleware/auth-middleware.test.ts` passes

---

### Step 9: Export `RbacRole` from `src/auth/index.ts`

**File:** `src/auth/index.ts`
**Change:** Add `export type { RbacRole } from './auth-service'` and `export { ROLE_HIERARCHY } from './roles'`.
**Why:** Central auth barrel export should expose all auth types for consumers.
**Verify:** `pnpm tsc --noEmit` passes

---

### Step 10: Run full test suite

**Change:** `pnpm test:int` and `pnpm build`
**Why:** Verify all auth refactoring works together without breaking existing routes.
**Verify:** All tests pass; `pnpm build` succeeds

---

## Questions

- **RS256 vs HS256**: The task description says "RS256 tokens" but `jwt-service.ts` uses HS256 (HMAC-SHA256) and the tests already pass with HS256. HS256 is simpler (no key pair management) and fine for single-server JWT signing. Should I proceed with HS256, or is RS256 (asymmetric) specifically required?
- **SessionStore deprecation**: `session-store.ts` is imported by `auth/index.ts` and `auth-middleware.ts`. After this refactor, `auth-middleware.ts` will use `AuthService` (no SessionStore). Should `session-store.ts` be deleted, or kept as a test utility?
