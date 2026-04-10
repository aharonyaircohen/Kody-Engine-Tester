## Existing Patterns Found

- **JwtService HS256**: `src/auth/jwt-service.ts` uses Web Crypto API (`crypto.subtle.importKey`, `HMAC`, `SHA-256`) with same `TokenPayload` shape (`userId, email, role, sessionId, generation, iat, exp`). Methods: `signAccessToken` (15min), `signRefreshToken` (7 days), `blacklist`, `cleanupBlacklist`.
- **Role guard HOF**: `src/middleware/role-guard.ts` — `requireRole(...roles)` returns function `(context: RoleContext) => error | undefined` using `ROLE_HIERARCHY` from `_auth.ts`.
- **Auth service integration**: `src/auth/auth-service.ts` uses JwtService + Payload SDK for login/refresh/verifyAccessToken/logout.
- **Test pattern**: `src/auth/jwt-service.test.ts` — `beforeEach` creates fresh service instance, tests cover sign/verify, expiry, blacklist, generation.

## Plan

**Step 1: Write `src/auth/jwt-v2.test.ts` (TDD first)**

**File:** `src/auth/jwt-v2.test.ts`
**Change:** Create test file for new RS256 JWT service following existing `jwt-service.test.ts` patterns. Mock RSA key pair generation via `vi.mock('crypto', ...)` for `subtle.generateKey` and `subtle.importKey`. Test `signAccessToken`, `signRefreshToken`, `verify`, blacklist, and migration mode detection (RS256 vs HS256 tokens).
**Why:** TDD — write tests before implementation.
**Verify:** `pnpm test:int src/auth/jwt-v2.test.ts` (fails until step 2)

---

**Step 2: Write `src/auth/jwt-v2.ts`**

**File:** `src/auth/jwt-v2.ts`
**Change:** Create `JwtServiceV2` class using RS256 (RSA-OAEP with SHA-256) via Web Crypto API. RSA key pair loaded from `process.env.JWT_V2_PUBLIC_KEY` / `process.env.JWT_V2_PRIVATE_KEY` (PEM format, base64-decoded). Falls back to derived keys from `JWT_SECRET` during migration. Same `TokenPayload` interface as v1. Constructor accepts optional migration-mode flag. Methods: `sign`, `verify`, `signAccessToken`, `signRefreshToken`, `blacklist`, `cleanupBlacklist`, `isRs256Token(token)` helper.
**Why:** RS256 requires RSA key pairs — different from HMAC secret approach. Same payload shape for backward compatibility.
**Verify:** `pnpm test:int src/auth/jwt-v2.test.ts` passes

---

**Step 3: Write `src/middleware/rbac.test.ts`**

**File:** `src/middleware/rbac.test.ts`
**Change:** Test new `createRbacMiddleware` factory. Test hierarchical role inheritance (admin→editor→viewer). Test legacy `UserRole` (`'admin'|'user'|'guest'|'student'|'instructor'`) mapping to new `RbacRole` during migration. Test both authenticated and unauthenticated requests.
**Why:** TDD for new RBAC middleware.
**Verify:** `pnpm test:int src/middleware/rbac.test.ts` (fails until step 4)

---

**Step 4: Write `src/middleware/rbac.ts`**

**File:** `src/middleware/rbac.ts`
**Change:** Create `createRbacMiddleware` factory function that returns Express-style middleware chain. Uses existing `requireRole` pattern but supports both `RbacRole` and legacy `UserRole` types via role mapping. Reads `Authorization: Bearer <token>` header, verifies via `JwtServiceV2`, applies role check via `requireRole`. Exports singleton instance `rbacMiddleware`.
**Why:** Extends existing `role-guard.ts` pattern; must support legacy roles during migration.
**Verify:** `pnpm test:int src/middleware/rbac.test.ts` passes

---

**Step 5: Update `src/auth/_auth.ts`**

**File:** `src/auth/_auth.ts`
**Change:** Add `MIGRATION_MODE` constant and `AuthMode` type (`'legacy' | 'v2' | 'dual'`). Add `dualVerify(token)` function that tries v1 HS256 first, then v2 RS256 if v1 fails. Update `extractBearerToken` to detect RS256 tokens by header prefix. Export `AuthMode` and `dualVerify`.
**Why:** All changes must be backwards compatible during 30-day migration — existing HS256 tokens must still work.
**Verify:** `pnpm test:int src/auth/` still passes

---

**Step 6: Write `docs/jwt-migration.md`**

**File:** `docs/jwt-migration.md`
**Change:** Migration guide covering: (1) Generate RSA key pair for RS256, (2) Set environment variables `JWT_V2_PRIVATE_KEY`, `JWT_V2_PUBLIC_KEY`, `AUTH_MODE=dual`, (3) How to enable v2-only mode after 30 days, (4) Rollback procedure (set `AUTH_MODE=legacy`), (5) Token format differences between HS256 and RS256, (6) Impact on existing API routes.
**Why:** Acceptance criteria requires migration doc with rollback procedure.
**Verify:** File exists at `docs/jwt-migration.md`

---

**Step 7: Run full test suite**

**Change:** Run `pnpm test:int` to confirm all existing auth tests (`jwt-service.test.ts`, `auth-service.test.ts`, `role-guard.test.ts`, `user-store.test.ts`) still pass alongside new tests.
**Verify:** `pnpm test:int` passes with 0 failures

---

## Questions

- Should `JwtServiceV2` auto-detect RS256 vs HS256 tokens by checking the `alg` claim in the JWT header, or should the caller explicitly choose which service to use?
- Should the RSA key pair be generated once at startup and cached, or loaded fresh on each verification (affects cold-start latency)?
- Should `AUTH_MODE` default to `'dual'` (migration mode) or `'legacy'` (current behavior) when the environment variable is unset?
