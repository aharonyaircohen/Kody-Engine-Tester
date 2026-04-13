## Existing Patterns Found

- `src/auth/jwt-service.ts`: `JwtService` class with `verify()` method using HMAC-SHA256 — JWT validation already implemented
- `src/middleware/auth-middleware.ts`: Factory pattern `createAuthMiddleware()` that calls `jwtService.verify(token)` — already validates JWTs
- `src/auth/withAuth.ts`: Next.js HOC pattern wrapping routes with `AuthService.verifyAccessToken()` which internally calls `JwtService.verify()` — already validates JWTs

## Plan

The taskify stage correctly identified that JWT token validation is **already implemented**. This plan focuses on verification rather than implementation.

### Step 1: Verify JWT service tests exist and pass

**File:** `src/auth/jwt-service.test.ts`
**Change:** Run existing tests to confirm JWT verification works
**Verify:** `pnpm test:int -- src/auth/jwt-service.test.ts`

---

### Step 2: Verify auth middleware tests exist and pass

**File:** `src/middleware/auth-middleware.test.ts`
**Change:** Run existing tests to confirm middleware integration with JWT service
**Verify:** `pnpm test:int -- src/middleware/auth-middleware.test.ts`

---

### Step 3: Verify withAuth tests exist and pass

**File:** `src/auth/withAuth.ts` — check for `withAuth.test.ts`
**Change:** Run existing tests to confirm HOC JWT validation
**Verify:** `pnpm test:int -- src/auth/`

---

### Step 4: Confirm no implementation gaps

**File:** `src/auth/jwt-service.ts`, `src/middleware/auth-middleware.ts`, `src/auth/withAuth.ts`
**Change:** Verify the JWT validation chain is complete:
1. `JwtService.verify()` validates signature + expiry
2. `auth-middleware.ts` calls `jwtService.verify()` on Bearer token
3. `withAuth` calls `authService.verifyAccessToken()` which calls `jwtService.verify()`
**Verify:** Code review confirms validation chain is complete
