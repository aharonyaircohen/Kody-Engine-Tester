## Verdict: PASS

## Summary

Refactors authentication to use JWT-based `AuthService` with password history tracking and reuse prevention. Adds `changePassword()` with verification-based concurrency detection, migration for `passwordHistory` and `role` columns, and simplifies login/auth-middleware to delegate to `AuthService`. Prior review issues (misleading `FOR UPDATE` comment, missing tests, `RbacRole` duplication) have been resolved.

## Findings

### Critical

None.

### Major

None.

### Minor

1. **`src/auth/auth-service.test.ts:39`** — `vi.hoisted()` is called inside `describe('AuthService')` block at line 24, but `vi.mock('crypto', ...)` at line 37 uses those hoisted mocks. In Vitest, `vi.hoisted()` is evaluated before `vi.mock()` is set up at the module level, but hoisted mocks inside a `describe` block may not be properly hoisted to the module scope where `vi.mock()` needs them. This can cause `crypto` to be the real module when tests run.

   Suggested fix: Move `vi.hoisted()` and `vi.mock('crypto', ...)` to the top level of the file, outside any `describe` block.

2. **`src/auth/auth-service.ts:306-313`** — `newPassword` is passed directly to `crypto.pbkdf2()` as the first argument (typed as `unknown` in the mock). If the caller passes a non-string (e.g., `number`), Node.js `crypto.pbkdf2` will coerce it internally but the type signature doesn't prevent this. Not a security issue but inconsistent with `verifyPassword` which also doesn't validate input types.

---

## Two-Pass Review

**Pass 1 — CRITICAL (must fix before merge):**

### SQL & Data Safety
- Migration correctly orders operations: `UPDATE` sets NULL roles before `ALTER ... SET NOT NULL`. ✓
- Uses `sql` tagged template throughout. ✓
- `down()` only drops `passwordHistory` — does not revert `role` column. Acceptable since dropping a NOT NULL column with a default requires separate migration. ✓

### Race Conditions & Concurrency
- `changePassword()` uses a detection pattern: reads user, verifies history, updates, then re-reads to verify the hash matches (lines 339-349). If a concurrent request changed the password first, the verification read sees a different hash and throws 409. This is a valid mitigation strategy given Payload SDK limitations — it doesn't prevent the race but reliably detects it.
- The prior review's misleading `FOR UPDATE` comment has been removed. ✓

### Enum & Value Completeness
- `RbacRole` is defined in `jwt-service.ts:1` and re-exported by `auth-service.ts:4-7`. Single source of truth. ✓
- `Users.ts` line 78: role select options `['admin', 'editor', 'viewer']` match `RbacRole`. ✓
- All role consumers traced — consistent. ✓

### Shell Injection
- Not applicable.

**Pass 2 — INFORMATIONAL (should review, may auto-fix):**

### Test Gaps
- **Issue #1 above**: `vi.hoisted()` placement inside `describe` block may cause `vi.mock('crypto')` to not intercept the `crypto` module properly in some Vitest configurations. The tests pass in the current setup but this is fragile.
- `changePassword()` now has comprehensive coverage (success, wrong password, history breach, same-password early return, concurrent modification 409, user not found, empty password). ✓
- `login.test.ts` mocks `AuthService` entirely — doesn't exercise PBKDF2 or real token generation. Acceptable for route handler unit tests.

### Conditional Side Effects
- `changePassword()` early return at line 316-318 when `newHash === hash` avoids an unnecessary DB update. This is correct — if the user resubmits their current password, no history entry is created and no update occurs. ✓

### Dead Code & Consistency
- `auth-middleware.ts` line 1: `AuthenticatedUser` is imported but the type is used in `AuthContext.user` which is returned from the middleware. Import is necessary. ✓

### Crypto & Entropy
- `crypto.randomBytes(16)` — cryptographically secure salt. ✓
- `crypto.timingSafeEqual` — constant-time comparison. ✓
- `JwtService` uses Web Crypto API (`crypto.subtle`) for HMAC-SHA256. ✓

### Performance & Bundle Impact
- No new heavy dependencies. ✓
