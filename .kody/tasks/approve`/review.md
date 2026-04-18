I now have a complete picture. Here is my structured review:

---

## Verdict: PASS

## Summary

Two Next.js route handlers (`POST /api/auth/login`, `POST /api/auth/register`) were added alongside co-located Vitest integration tests. The implementation is well-structured: register uses Payload's DB-level unique constraint to catch duplicate emails (avoiding TOCTOU), both handlers use the mini-Zod schema library for input validation, and auth errors return generic messages to prevent information leakage.

## Findings

### Critical

None.

### Major

None.

### Minor

`src/app/api/auth/register/route.ts:148–160` — Post-creation error cleanup silently swallows `payload.delete()` failures with a bare `catch {}`, then returns a generic 500. If cleanup itself fails, the orphaned user record is unaddressed and the caller has no indication. Consider adding a structured comment noting this is intentional (to avoid leaking internal state via the error channel), or surface a distinct `500` sub-code so operators can distinguish this path in logs.

`src/app/api/auth/login/route.ts:8–11` — `LoginSchema` only validates that `email` is a non-null string; bare `"email": ""` passes schema parsing and falls through to `authService.login`, which returns a 400 with `"Email is required"`. Consider `s.string().min(1)` in the schema so the 400 originates at the route layer, keeping error shaping consistent.

`src/app/api/auth/register/route.test.ts` — No test covers the post-creation cleanup branch where `payload.delete()` in the `catch` block fails (user created → login throws → delete throws → response). A `vi.fn().mockRejectedValue(new Error('db down'))` on `mockPayload.delete` would close this gap.

---

## Two-Pass Review

**Pass 1 — CRITICAL (must fix before merge):**

### SQL & Data Safety
- No raw SQL. All DB writes go through Payload ORM's typed `create`/`update`/`delete` calls. ✓
- `src/app/api/auth/register/route.ts:126–134` — Duplicate email detection relies on Payload catching the PostgreSQL `23505` error from the unique constraint, not a check-then-insert TOCTOU pattern. ✓
- `src/app/api/auth/register/route.ts:112–121` — `payload.create` with direct field injection (`email`, `hash`, `salt`, `role`, `isActive`) bypasses Payload collection hooks. This is consistent with the existing `AuthService.login` pattern but means any `beforeChange` hooks on the `users` collection (e.g., password policy enforcement) will be skipped. Flag for awareness if password policy hooks are added later.

### Race Conditions & Concurrency
- Register: creates user atomically in Payload, catches unique-constraint violation. No check-then-set race window. ✓
- Login: stateless read-verify-update per request; no shared state mutated without a DB unique index behind it. ✓

### LLM Output Trust Boundary
N/A — no LLM involvement.

### Shell Injection
N/A — no shell commands.

### Enum & Value Completeness
- `src/app/api/auth/register/route.ts:118` — `role: 'viewer'` hard-coded. `RbacRole = 'admin' | 'editor' | 'viewer'`. ✓ Aligned.
- No new enum values introduced beyond `'viewer'`.

### Auth Error Disclosure
- `src/app/api/auth/login/route.ts:76–79` — Catch block returns `error.message` from `authService.login` directly. `AuthService` throws `createError('Invalid credentials', 401)` and `createError('Account is inactive', 403)` — both generic, no email enumeration risk. ✓
- `src/app/api/auth/register/route.ts:163` — `error.message ?? 'Registration failed'` — generic fallback. ✓

### Crypto & Entropy
- `src/app/api/auth/auth-service.ts:53` — `crypto.timingSafeEqual` used for hash comparison. ✓ Constant-time.
- `src/app/api/auth/register/route.ts:43–52` — PBKDF2, 25000 iterations, SHA-256, 64-byte output — matches Payload's `generatePasswordSaltHash` algorithm. ✓
- `src/app/api/auth/register/route.ts:100` — `crypto.randomBytes(16)` for salt — 128 bits of entropy. ✓
- `AuthService` stores `sessionId = \`session-${userId}-${Date.now()}\`` — `Date.now()` is low-entropy but not security-sensitive (session ID uniqueness is enforced by JWT signature, not entropy). Acceptable.

---

**Pass 2 — INFORMATIONAL (should review, may auto-fix):**

### Conditional Side Effects
- `src/app/api/auth/register/route.ts:151–160` — Post-creation cleanup: when login fails, `payload.delete` is called inside a `catch {}` that silently ignores its failure. The outer `catch` then returns 500. See Minor finding above.

### Test Gaps
- No test for 500 from login throwing (e.g., DB connection error mid-request) in `login/route.test.ts`.
- No test for cleanup failure in `register/route.test.ts`. See Minor finding above.

### Dead Code & Consistency
- `src/app/api/auth/login/route.ts:59–60` — `ipAddress` and `userAgent` are extracted but `AuthService.login` marks them `_ipAddress`/`_userAgent` (unused). Consistent with existing `AuthService` signature — acceptable for future logging/rate-limiting hooks.
- `MIN_PASSWORD_LENGTH = 8` in `register/route.ts:16` is consistent with the service-layer behavior. ✓

### Performance & Bundle Impact
No new heavy dependencies. `crypto` and `NextRequest` are Node.js built-ins / Next.js platform APIs. ✓

### Type Coercion at Boundaries
- `src/app/api/auth/login/route.ts:54` — `(e as Error).message` from `SchemaError`. Safe since `s.parse()` only throws `SchemaError` which extends `Error`. ✓
- `src/app/api/auth/register/route.ts:120` — `as any` cast on `payload.create` data — consistent with codebase pattern (Payload's generated types use `any` for collection data). Expected.
- `newUserId` typed as `number | string | undefined`; Payload IDs are typically numeric. Consistent with `AuthService` usage. ✓