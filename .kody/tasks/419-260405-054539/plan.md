Now I have a complete picture. Let me write the plan.

## Existing Patterns Found

- **`src/auth/_auth.ts:26` - `checkRole` function**: Exact-match RBAC using `roles.includes(user.role)`. **Plan adds hierarchical support** by defining `ROLE_HIERARCHY = { admin: 3, editor: 2, viewer: 1 }` and comparing numeric levels.
- **`src/auth/auth-service.ts`**: Full JWT auth (login, refresh, verify, logout) with token rotation. **Plan updates `src/api/auth/*` handlers to delegate to this instead of SessionStore.**
- **`src/auth/withAuth.ts`**: HOC wrapping routes with JWT validation + RBAC — already correctly used by all `src/app/api/*` routes.
- **`src/collections/Users.ts`**: Payload collection config with role field. **Plan adds `permissions` array and `lastLogin` timestamp fields.**
- **`src/middleware/role-guard.ts`**: `requireRole` guard — **Plan updates it to use the improved `checkRole` from `_auth.ts`.**
- **`src/api/auth/login.ts` + `logout.ts` + `refresh.ts` + `register.ts` + `profile.ts`**: Still use `SessionStore`/`UserStore`. **Plan updates them to use `AuthService`.**
- **`vi.fn()` + `mockResolvedValue` pattern**: Used in existing auth tests. **Plan follows same pattern for new tests.**

---

## Plan

### Step 1: Add hierarchical RBAC to `checkRole` in `_auth.ts`

**File:** `src/auth/_auth.ts`
**Change:** Replace the flat `roles.includes()` check with a numeric hierarchy comparison. Add a `ROLE_HIERARCHY` map and a `hasMinimumRole` helper.
**Why:** The task requires "hierarchical roles (admin > editor > viewer)" but the current implementation only does exact-match.
**Verify:** `pnpm test:int src/auth/_auth.test.ts` (new test file)

### Step 2: Add `requireRole` hierarchical support in `role-guard.ts`

**File:** `src/middleware/role-guard.ts`
**Change:** Update `requireRole` to use the same hierarchical RBAC logic from `_auth.ts` — import `checkRole` or replicate the hierarchy comparison.
**Why:** Consistent hierarchical enforcement across both `withAuth` HOC and direct middleware usage.
**Verify:** `pnpm test:int src/middleware/role-guard.test.ts`

### Step 3: Update `src/api/auth/logout.ts` to use `AuthService`

**File:** `src/api/auth/logout.ts`
**Change:** Replace `SessionStore` + `JwtService` dependency with `AuthService.logout()`.
**Why:** `AuthService` already implements correct logout with token blacklisting. Removes SessionStore coupling.
**Verify:** `pnpm test:int src/api/auth/logout.test.ts`

### Step 4: Update `src/api/auth/refresh.ts` to use `AuthService`

**File:** `src/api/auth/refresh.ts`
**Change:** Replace `SessionStore` + `JwtService` with `AuthService.refresh()`.
**Why:** `AuthService.refresh()` already handles token rotation correctly.
**Verify:** `pnpm test:int src/api/auth/refresh.test.ts`

### Step 5: Update `src/api/auth/register.ts` to use `AuthService`

**File:** `src/api/auth/register.ts`
**Change:** Replace `UserStore` + `SessionStore` + `login()` with `AuthService` + Payload user creation. Register should create a Payload user and call `AuthService.login()`.
**Why:** Aligns with Payload-based auth model used by `AuthService`.
**Verify:** `pnpm test:int src/api/auth/register.test.ts`

### Step 6: Update `src/api/auth/profile.ts` to use `AuthService`

**File:** `src/api/auth/profile.ts`
**Change:** Replace `UserStore` with Payload queries and `AuthService` for password operations.
**Why:** `AuthService` uses Payload directly; the profile module should too for consistency.
**Verify:** `pnpm test:int src/api/auth/profile.test.ts`

### Step 7: Add `permissions` and `lastLogin` fields to `Users` collection

**File:** `src/collections/Users.ts`
**Change:** Add `permissions` (array of strings, hidden) and `lastLogin` (date, hidden) fields alongside existing fields.
**Why:** Task requirement: "add roles field (admin/editor/viewer), add permissions array, add lastLogin timestamp". The role field already exists.
**Verify:** `pnpm test:int src/collections/Users.test.ts`

### Step 8: Write Payload migration script for new Users fields

**File:** `src/migrations/YYYYMMDD_HHMMSS_add_users_permissions_lastLogin.ts` (or similar)
**Change:** Add a Payload migration that adds `permissions` and `lastLogin` columns to the users collection.
**Why:** Schema changes require a database migration in Payload.
**Verify:** `pnpm ci` (runs `payload migrate`)

### Step 9: Add integration tests for full auth flow

**File:** `tests/int/auth-flow.int.test.ts` (new)
**Change:** Write integration tests that exercise login → authenticated request → refresh → logout using the full Payload-backed stack.
**Why:** Comprehensive test coverage requirement in task.
**Verify:** `pnpm test:int`

### Step 10: Final verification

**Change:** Run `pnpm test:int` and `pnpm build` to confirm all changes work together.
**Verify:** `pnpm ci`

---

## Questions

- **SessionStore deprecation**: `src/api/auth/logout.ts` and `refresh.ts` currently use `SessionStore`. After migrating to `AuthService`, should `SessionStore` be completely removed (and `session-store.ts` deleted), or kept for any remaining non-JWT use cases? **Recommendation: Remove it since all auth is now JWT-based via `AuthService`.**
- **Permissions structure**: What specific permissions should be in the `permissions` array — free-form strings (e.g., `'users:read'`, `'courses:write'`) or a fixed enum set? **Recommendation: Free-form strings for flexibility, with constants defined in a `permissions.ts` file.**
- **lastLogin vs lastTokenUsedAt**: The Users collection already has `lastTokenUsedAt` which is updated on every token refresh. Is `lastLogin` meant to track actual login events (separate from token refresh)? **Recommendation: `lastLogin` = login event timestamp, `lastTokenUsedAt` = last API access timestamp — both useful for audit.**
