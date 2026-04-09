## Existing Patterns Found

- **AuthService (Payload-based)**: `src/auth/auth-service.ts` - already implements JWT auth with Payload, uses `verifyAccessToken()` for token validation
- **withAuth HOC**: `src/auth/withAuth.ts` - already correctly uses `AuthService.verifyAccessToken()` instead of UserStore/SessionStore
- **JwtService**: `src/auth/jwt-service.ts` - custom HMAC-SHA256 JWT implementation with access/refresh token rotation
- **Payload Users collection**: `src/collections/Users.ts` - already has `role: admin/editor/viewer` aligned with `RbacRole`
- **API routes**: Most routes (`logout.ts`, `refresh.ts`, `profile.ts`, `register.ts`) already use `AuthService` - only `login.ts` uses the deprecated UserStore/SessionStore path

---

## Plan

### Step 1: Update `src/api/auth/login.ts` to use AuthService

**File:** `src/api/auth/login.ts`
**Change:** Replace the UserStore/SessionStore-based login flow with `AuthService.login()`
**Why:** Consolidate all auth to use the single AuthService path; UserStore/SessionStore is only used here
**Verify:** `pnpm test:int src/api/auth/login.test.ts`

### Step 2: Refactor `src/middleware/auth-middleware.ts` to use AuthService

**File:** `src/middleware/auth-middleware.ts`
**Change:** Rewrite `createAuthMiddleware` to accept `AuthService` instead of `UserStore`/`SessionStore`. Remove sessionStore dependency since AuthService handles session state via JWT generation counter. Keep rate limiting.
**Why:** `withAuth` already uses AuthService; middleware should too for consistency
**Verify:** `pnpm test:int src/middleware/auth-middleware.test.ts`

### Step 3: Update `src/middleware/auth-middleware.test.ts` for new implementation

**File:** `src/middleware/auth-middleware.test.ts`
**Change:** Rewrite tests to mock `AuthService` instead of `UserStore`/`SessionStore`
**Why:** Tests must match the new implementation
**Verify:** `pnpm test:int src/middleware/auth-middleware.test.ts`

### Step 4: Update `src/auth/index.ts` to remove deprecated exports

**File:** `src/auth/index.ts`
**Change:** Remove `userStore` and `sessionStore` singleton exports. Export `AuthService` and `getAuthService()`. Keep `jwtService` export.
**Why:** Clean up the public API; UserStore/SessionStore are internal details
**Verify:** `pnpm build`

### Step 5: Verify all API routes use consistent auth

**File:** `src/api/auth/*.ts`
**Change:** Confirm `logout.ts`, `refresh.ts`, `profile.ts`, `register.ts` already use `AuthService`. Verify `login.ts` now uses it too.
**Why:** Ensure no remaining dual-auth paths
**Verify:** `pnpm test:int` (all auth tests pass)

### Step 6: Run full test suite

**Verify:** `pnpm test:int && pnpm build`

---

## Questions

- The task mentions "migrate the user schema" but `src/collections/Users.ts` already has `role: admin/editor/viewer` aligned with `RbacRole`. Should I interpret this as verifying the schema is correct and no migration is needed, or is there a user schema migration beyond the role field?
