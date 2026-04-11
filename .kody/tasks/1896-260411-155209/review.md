The code has been updated since the last review. The `login.ts` now validates RBAC roles before JWT signing rather than blindly casting. Let me provide the updated review.

## Verdict: FAIL

## Summary

Two route handlers at `POST /api/auth/login` and `POST /api/auth/register` expose existing business logic. The critical role-cast issue in `login.ts` was partially addressed — invalid roles are now rejected at login time rather than corrupting the JWT — but this introduces a new problem: users with `UserStore` roles outside `RbacRole` cannot log in at all, which may be overly restrictive depending on intended behavior.

## Findings

### Critical

**`src/api/auth/login.ts:57-60`** — Login now rejects users with non-RBAC roles at authentication time with 403 "Account has incompatible role". The previous issue was that invalid roles were silently cast into the JWT, corrupting downstream auth. The fix of rejecting them is safer but may be overcorrected: if any user with `UserStore` role `'instructor'`, `'student'`, `'user'`, or `'guest'` should legitimately be able to log in, they now cannot. This effectively locks out 4 out of 6 role types. Confirm whether this lockout is intentional per system design.

```typescript
// Lines 57-60 — gates login behind RBAC role check
const validRbacRoles = ['admin', 'editor', 'viewer'] as const
if (!validRbacRoles.includes(user.role as (typeof validRbacRoles)[number])) {
  throw createError('Account has incompatible role', 403)
}
```

### Minor

**`src/app/api/auth/login/route.ts:7`** and **`src/app/api/auth/register/route.ts:9`** — `request.json()` throws `SyntaxError` on malformed JSON, caught as 500. Should be 400.

**`src/app/api/auth/register/route.ts:26`** — `confirmPassword ?? password` still present. When client sends `{ email, password }` without `confirmPassword`, the register call receives `password` as `confirmPassword`. The route-level check on line 16 prevents a mismatch error, so this is functionally a silent fallback to "confirm = password". This matches the task spec ("accepts `{ email, password }`") but the intent of a confirmation field is weakened.

**`src/app/api/auth/register/route.ts:13`** — `AuthService` instantiated per request rather than using module-level singleton from `@/auth`.

---

## Two-Pass Review

### Pass 1 — CRITICAL

### Enum & Value Completeness

**Role gate (`login.ts:57-60`)** — Login now validates role before JWT issuance. The fix is security-appropriate (rejects invalid roles rather than issuing corrupted tokens) but creates a hard block. Verify that only `admin|editor|viewer` users should have API access, and that no legitimate workflow requires `'student'|'instructor'|'user'|'guest'` users to log in via this endpoint.

### SQL / Race Conditions / Shell Injection / LLM Trust

None — no raw SQL, parameterized queries via Payload SDK.

### Pass 2 — INFORMATIONAL

### Conditional Side Effects

**`register/route.ts:26`** — `confirmPassword ?? password` means `{ email, password }` requests pass `password` as confirmation. The route-level check prevents mismatch errors, so this silently succeeds. Functionally correct per task spec but semantically odd.

### Test Gaps

No tests for these route handlers. Task specification lists required integration tests that do not exist.

### Dead Code / Consistency

**`src/auth/auth-service.ts:94`** — Same `as RbacRole` cast exists in `AuthService.login()`, but this is a pre-existing issue not introduced by this diff.

### Crypto & Entropy

None in these files. `UserStore.verifyPassword` uses SHA-256 (pre-existing, weaker than PBKDF2 per project memory).
