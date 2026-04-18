Now I have a full picture. Let me write the plan.

---

## Existing Patterns Found

- **`logout.test.ts` / `refresh.test.ts` AuthService pattern**: Mock `@/getPayload`, create `new JwtService('test-secret')`, create `new AuthService(mockPayload, jwtService)`, `vi.clearAllMocks()` in `beforeEach` — this exact pattern must be applied to `login.test.ts`.
- **`register.test.ts` AuthService test pattern**: Same structure as above, with `crypto` mock for PBKDF2.
- **`register.ts` line 69**: Already delegates to `authService.login()` — `login.ts` follows the same delegation pattern.
- **`auth-service.ts` `login()` method**: Handles all Payload user lookups, PBKDF2 verification, token generation, and refresh token storage. `login.ts` becomes a thin wrapper.

## Plan

### Step 1: Refactor `login.ts` to delegate to `AuthService`

**File:** `src/api/auth/login.ts`
**Change:** Replace the entire file content. The new `login()` function accepts `payload` and `authService` and delegates directly to `authService.login()`. Drop all `UserStore`, `SessionStore`, manual JWT signing, lockout logic, and failed-attempt tracking.

**Why:** `AuthService.login()` already handles Payload user lookup, PBKDF2 password verification (25000 iterations), JWT generation, and refresh token storage — no duplication needed. `login.ts` becomes the thin HTTP-layer wrapper.

**Verify:** `pnpm test:int -- --run src/api/auth/login.test.ts` (fails until step 2 is done)

---

### Step 2: Rewrite `login.test.ts` with the AuthService pattern

**File:** `src/api/auth/login.test.ts`
**Change:** Replace the entire file. Adopt the `logout.test.ts` pattern: mock `@/getPayload`, `vi.clearAllMocks()` in `beforeEach`, `new JwtService` + `new AuthService(mockPayload, jwtService)`. Remove tests for UserStore-specific behaviour (lockout `423`, failed-attempt increment). Keep tests that map directly to `AuthService.login()`:
- 200 — successful login returns tokens + user
- 401 — unknown email
- 401 — wrong password
- 400 — missing credentials
- 403 — inactive user

**Verify:** `pnpm test:int -- --run src/api/auth/login.test.ts` passes

---

### Step 3: Run full auth integration suite

**Verify:** `pnpm test:int -- --run src/api/auth/` — all auth test files pass.

---

## Questions

None — the task is well-scoped and the patterns are clear from existing files.