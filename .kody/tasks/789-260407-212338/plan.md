Now I have a comprehensive understanding of the codebase. Let me write the plan.

## Existing Patterns Found

- **JwtService** (`src/auth/jwt-service.ts`): Stateless JWT sign/verify/blacklist — already the backbone of the new auth; `signAccessToken(15min)` and `signRefreshToken(7days)` already exist
- **AuthService** (`src/auth/auth-service.ts`): Payload-backed login/refresh/logout using JwtService — already stateless (stores only `refreshToken` on user doc, not session); uses `RbacRole = 'admin'|'editor'|'viewer'`
- **ROLE_HIERARCHY** (`src/auth/_auth.ts`): `admin:3 > editor:2 > viewer:1` with `checkRole()` — already handles hierarchical RBAC
- **withAuth HOC** (`src/auth/withAuth.ts`): Wraps route handlers, already uses AuthService + JwtService — the main gateway for all protected routes
- **role-guard.ts** (`src/middleware/role-guard.ts`): `requireRole()` HOC using ROLE_HIERARCHY — already works with RbacRole
- **SessionStore** (`src/auth/session-store.ts`): In-memory session tracking — **to be removed**; only `auth-middleware.ts` uses it (not AuthService)
- **auth-middleware.ts** (`src/middleware/auth-middleware.ts`): Hybrid middleware using BOTH SessionStore and JwtService — **to be simplified** to pure JWT
- **Users collection** (`src/collections/Users.ts`): Payload collection with `role: select(['admin','editor','viewer'])` — already uses target roles; `refreshToken`/`tokenExpiresAt`/`lastTokenUsedAt` fields already exist

The plan reuses: JwtService (stateless JWT), AuthService (Payload-backed auth), ROLE_HIERARCHY + checkRole (RBAC), withAuth HOC (route protection), Users collection fields (already aligned).

---

## Plan

### Step 1: Add roles array to Users collection
**File:** `src/collections/Users.ts`
**Change:** Add a new `roles` field (array of `RbacRole`) alongside the existing `role` field for backwards compatibility. Both fields coexist during migration. Also add `roles` to the select options if needed, but since it's an array, use a `relationship` or just a JSON-backed array field. Actually Payload's `type: 'select'` with `hasMany` supports arrays. Update the `role` field options to `['admin', 'editor', 'viewer']` (already correct) and add the `roles` field.
**Why:** The user schema needs a `roles: RbacRole[]` array per requirements. The existing `role` field is kept for backwards compatibility.
**Verify:** `pnpm build` passes

### Step 2: Update auth-service.ts to use roles array
**File:** `src/auth/auth-service.ts`
**Change:** In `login()`, `refresh()`, and `verifyAccessToken()`, change role field reads from `(user as any).role` (single) to check both `(user as any).roles` (array) and fall back to `(user as any).role`. Add a helper `getPrimaryRole(user)` that returns `user.roles?.[0] ?? user.role ?? 'viewer'`.
**Why:** AuthService is the primary auth engine — it must read the new roles array.
**Verify:** `pnpm test:int src/auth/auth-service.test.ts` passes

### Step 3: Remove SessionStore from auth-middleware.ts
**File:** `src/middleware/auth-middleware.ts`
**Change:** Remove `SessionStore` dependency. Change auth flow to: extract Bearer token → `jwtService.verify(token)` → fetch user from userStore → return `AuthContext` without session. Remove `session` from `AuthContext` interface. Remove rate-limit logic (or keep it but without session store coupling).
**Why:** `auth-middleware.ts` currently does dual validation (JWT verify + SessionStore lookup). With stateless JWT, only the JWT verify is needed. SessionStore is only used here — removing it eliminates the stateful session tracking.
**Verify:** `pnpm test:int src/middleware/auth-middleware.test.ts` passes

### Step 4: Create src/middleware/rbac.ts as consolidated RBAC middleware
**File:** `src/middleware/rbac.ts` (NEW)
**Change:** Create a new file that exports:
- `createRbacMiddleware(options: { roles?: RbacRole[], optional?: boolean })` — returns Express-style middleware function that validates JWT Bearer token via JwtService, checks role hierarchy via `checkRole`, and calls `next()`
- Reuse `extractBearerToken`, `checkRole`, `ROLE_HIERARCHY` from `src/auth/_auth.ts`
- Reuse `JwtService` from `src/auth/jwt-service.ts`
**Why:** Task requirement explicitly calls for new `src/middleware/rbac.ts`. This consolidates RBAC logic in a dedicated middleware file, replacing the need for the hybrid `auth-middleware.ts` for RBAC checks. The existing `role-guard.ts` HOC can remain for HOC-style guards.
**Verify:** `pnpm test:int` passes

### Step 5: Write tests for rbac.ts
**File:** `src/middleware/rbac.test.ts` (NEW)
**Change:** Test `createRbacMiddleware`:
- accepts valid JWT with correct role → calls next()
- accepts valid JWT with insufficient role → returns 403
- missing token (non-optional) → returns 401
- optional mode with missing token → calls next()
- expired/invalid token → returns 401
- hierarchical role inheritance (admin can access editor-required routes)
**Why:** TDD — test before implementation. Tests should be written alongside Step 4.
**Verify:** `pnpm test:int src/middleware/rbac.test.ts` fails initially (red), then passes after Step 4

### Step 6: Update login.ts to remove SessionStore usage
**File:** `src/api/auth/login.ts`
**Change:** Remove `SessionStore` from login flow. The login already creates JWT tokens via `jwtService.signAccessToken/signRefreshToken`. Remove the `sessionStore.create()` and `sessionStore.refresh()` calls. The `sessionId` in the JWT payload can be a generated ID instead of a session store ID.
**Why:** Login currently creates a SessionStore entry alongside JWT tokens. With pure stateless JWT, no server-side session tracking is needed.
**Verify:** `pnpm test:int src/api/auth/login.test.ts` passes

### Step 7: Update logout.ts to remove SessionStore
**File:** `src/api/auth/logout.ts`
**Change:** Remove `sessionStore.revoke()` or similar calls. Use `jwtService.blacklist(token)` instead. Update `logout.test.ts` accordingly.
**Why:** Logout should blacklist the token rather than revoke a server-side session.
**Verify:** `pnpm test:int src/api/auth/logout.test.ts` passes

### Step 8: Update refresh.ts
**File:** `src/api/auth/refresh.ts`
**Change:** Already uses `AuthService.refresh()` which is Payload-backed. No SessionStore involvement. Verify it works with the new roles flow.
**Why:** Ensure refresh flow is aligned with the new auth system.
**Verify:** `pnpm test:int src/api/auth/refresh.test.ts` passes

### Step 9: Delete session-store.ts and session-store.test.ts
**File:** `src/auth/session-store.ts`, `src/auth/session-store.test.ts`
**Change:** Delete both files entirely. SessionStore is no longer needed.
**Why:** Task requirement: "replace session-store.ts with JWT-based tokens"
**Verify:** `pnpm test:int` passes (no references to session-store remain)

### Step 10: Update auth/index.ts
**File:** `src/auth/index.ts`
**Change:** Remove SessionStore export and singleton instance. Keep UserStore, JwtService, AuthService exports.
**Why:** SessionStore is deleted.
**Verify:** `pnpm test:int` passes

### Step 11: Create migration script
**File:** `src/migrations/YYYYMMDD_migrate_to_roles_array.ts` (NEW)
**Change:** Migration that:
- For each user doc in Payload `users` collection, reads the existing `role` field
- Sets `roles: [role]` if `roles` is not already set
- Keeps `role` field for backwards compatibility
- Updates the doc via `payload.update()`
**Why:** Required by task: "comprehensive migration script"
**Verify:** `npx payload migrate` runs without errors

### Step 12: Final verification
**Change:** Run full test suite
**Verify:** `pnpm test:int` and `pnpm build` both pass

---

## Questions

No questions — the task description is clear and the existing patterns (JwtService, AuthService, ROLE_HIERARCHY, withAuth) provide all the building blocks needed. The three discussion questions (migration strategy, rbac.ts vs role-guard.ts, session-store deletion) were already answered by the user approving with `@kody approve`.
