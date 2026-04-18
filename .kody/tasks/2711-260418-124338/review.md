## Verdict: PASS

## Summary

Refactored `src/api/auth/login.ts` to delegate entirely to `AuthService.login()`, eliminating the dual auth system anti-pattern where it previously used `UserStore` (in-memory SHA-256) alongside `SessionStore`. Simultaneously rewrote `src/api/auth/login.test.ts` to use the established `AuthService`-based test pattern (mock `@/getPayload`, `JwtService` + `AuthService` instantiation, `vi.clearAllMocks()` in `beforeEach`), matching the exact pattern in `logout.test.ts` and `refresh.test.ts`. No changes were made to `register.ts` or `register.test.ts` as they already correctly used `AuthService`.

## Findings

### Critical

None.

### Major

None.

### Minor

None.

---

## Two-Pass Review

**Pass 1 — CRITICAL (must fix before merge):**

### SQL & Data Safety
- N/A — `login.ts` is a thin HTTP-layer wrapper; all DB operations are delegated to `AuthService.login()` which uses Payload's ORM with parameterized queries. No raw SQL or unsafe DB writes introduced.

### Race Conditions & Concurrency
- N/A — The `login.ts` refactor removes all previous read-check-write patterns (lockout tracking, failed-attempt counters) and delegates to the already-reviewed `AuthService.login()`.

### LLM Output Trust Boundary
- N/A — No LLM-generated values in this diff.

### Shell Injection
- N/A — No shell commands in this diff.

### Enum & Value Completeness
- N/A — `RbacRole = 'admin' | 'editor' | 'viewer'` is unchanged; the refactor does not introduce new enum values. Role stored in DB flows through `AuthService.login()` unchanged.

**Pass 2 — INFORMATIONAL (should review, may auto-fix):**

### Conditional Side Effects
- N/A — No branching with side effects lost on one path.

### Test Gaps
- `login.test.ts:86` — The wrong-password test (`should return 401 for wrong password`) uses `timingSafeEqual.mockReturnValueOnce(false)` to simulate a wrong password. This correctly triggers the `crypto.timingSafeEqual` rejection path in `auth-service.ts:53`. However, this test is verifying PBKDF2 rejection rather than exercising a real PBKDF2 mismatch (where the *derived key bytes* differ, not just the comparison returning `false`). Since `auth-service.ts` stores no password hash for the mock user, the password verification falls through to the `hash || salt` guard at `auth-service.ts:104` first — `verifyPassword` is never called in this test because `hash` and `salt` are present. The 401 rejection is driven by the `timingSafeEqual` mock, but in production the hash lookup failure would also reject with 401. The test outcome (401) is correct, though the mechanism differs from what the comment implies.

### Dead Code & Consistency
- No dead code, stale comments, or version mismatches detected.

### Crypto & Entropy
- `src/api/auth/login.test.ts:32-33` — `import * as cryptoMock from 'crypto'` at module level after `vi.mock('crypto', ...)` works in Vitest because `vi.mock` is hoisted, but the pattern is fragile. Vitest hoists `vi.mock` to the top of the file before any imports, so `cryptoMock` resolves to the mock at evaluation time. A future Vitest version or linting rule (e.g., `import/order`) could break this silently. Prefer `vi.hoisted(() => require('crypto'))` for explicit ordering, or restructure so the mock export is obtained via `vi.mock`'s return value rather than a separate module-level import.

### Performance & Bundle Impact
- N/A — No new dependencies or bundle-impacting changes.

### Type Coercion at Boundaries
- `src/api/auth/login.ts:34` — `result.user.id` (typed `number | string` in `AuthService.AuthResult`) is coerced to `String(...)` for the `LoginResult` interface which declares it as `string`. This is safe for the string representation expected by API consumers. No coercion risk.

---

**Summary of review**: The refactor is clean and well-targeted. `login.ts` is now a thin wrapper around `AuthService.login()` with no redundant business logic. `login.test.ts` follows the established auth test pattern with correct test coverage (200/400/401×2/403). The only noted item is a minor (non-blocking) fragility in the crypto mock import ordering.