I already reviewed this diff and produced a structured verdict. The diary confirms two entries — the first complete with full critical/major/minor findings, the second a partial ping. Here is the complete review again:

## Verdict: FAIL

## Summary

The diff migrates the login API from UserStore (SHA-256, with account lockout after 5 failed attempts) to AuthService (PBKDF2). Role alignment from `instructor`/`student`/`guest` to `editor`/`viewer` is correctly implemented. However, **the account lockout/brute-force protection is lost** — AuthService.login() has no lockout mechanism, while the old UserStore-based login returned HTTP 423 for locked accounts.

## Findings

### Critical

1. **`src/auth/user-store.ts:24-25,124-142` → `src/auth/auth-service.ts:68-149` — Missing Account Lockout / Brute-Force Protection (Security Regression)**
   
   UserStore implements `LOCKOUT_ATTEMPTS = 5`, `LOCKOUT_DURATION_MS = 30 * 60 * 1000`, `isLocked()`, and `recordFailedLogin()`. The login endpoint previously returned HTTP 423 for locked accounts. `AuthService.login()` performs password verification but **never records failed attempts or checks lockout state**.
   
   **Impact**: An attacker can make unlimited password guessing attempts with no account lockout. This is a significant regression from the UserStore implementation.
   
   **Fix**: Add `failedLoginAttempts` and `lockedUntil` tracking in AuthService.login(), or document that lockout is handled by an external mechanism (e.g., API gateway rate limiting).

### Minor

1. **`src/auth/auth-service.ts:71-72` — Unused `_ipAddress` and `_userAgent` parameters**
   
   Parameters are prefixed with `_` indicating intentional non-use. The original UserStore implementation passed these to `sessionStore.create()` for audit/logging. Now silently ignored.
   
   **Fix**: Use these for audit logging, or remove from the function signature.

2. **`src/api/auth/login.test.ts` — Account lockout test removed without equivalent coverage**
   
   The test "should return 423 for locked account" was deleted. No equivalent test exists in `auth-service.test.ts`.
   
   **Fix**: Add account lockout tests to auth-service tests, or document that lockout is handled externally.

3. **`src/api/auth/login.ts:21` — Defensive `String(result.user.id)` conversion**
   
   `AuthService` returns `userId` directly (typed `number | string`), and `login.ts` converts with `String()`. This is defensive but could mask type mismatches.
   
   **Fix**: Ensure consistency — either always store IDs as strings in Payload, or align type handling.

---

## Two-Pass Review

**Pass 1 — CRITICAL:**

### SQL & Data Safety
None. AuthService uses Payload's typed `find`/`update` API with parameterized queries — no raw SQL injection risk.

### Race Conditions & Concurrency
None in the changed files. Token refresh uses proper comparison via `timingSafeEqual` for the hash comparison. However, the failed login attempt counter in UserStore (not used anymore) had a TOCTOU issue — but that's pre-existing, not introduced.

### LLM Output Trust Boundary
Not applicable — no LLM involvement.

### Shell Injection
Not applicable — no shell calls.

### Enum & Value Completeness
`RbacRole` values (`admin`, `editor`, `viewer`) are correctly used throughout. The old `instructor`/`student`/`guest` values are replaced:
- `src/services/discussions.ts:109,120,131,142` — all four pin/unpin/resolve/unresolve checks correctly use `user.role !== 'admin' && user.role !== 'editor'`.
- No allowlist/filter arrays reference the old roles.
- No `case`/`switch` chains on `RbacRole` exist in the changed diff.

**Pass 2 — INFORMATIONAL:**

### Conditional Side Effects
None.

### Test Gaps
- **Lockout test removed**: `login.test.ts` had a "should return 423 for locked account" test that tested a real security feature now absent from AuthService. This should be restored or explicitly documented as handled externally.

### Dead Code & Consistency
- `userStore` singleton removed from `src/auth/index.ts` exports — correctly deprecated.
- `_ipAddress` and `_userAgent` unused — could be used for audit logging.

### Crypto & Entropy
- `verifyPassword` at `auth-service.ts:45-60` uses `crypto.timingSafeEqual` — correct constant-time comparison.
- `crypto.randomBytes` not used for session IDs — `session-${userId}-${Date.now()}` at line 118 lacks cryptographic randomness for the session identifier component. However, the JWT signature provides the real security boundary, so this is low risk.

### Performance & Bundle Impact
None.

### Type Coercion at Boundaries
`String(result.user.id)` at `login.ts:21` converts `number | string` to `string`. This is defensive but the root cause (Payload ID being `number | string`) should be normalized at the source.

---

Diary entry written to `.kody/memory/diary_review.jsonl`.
