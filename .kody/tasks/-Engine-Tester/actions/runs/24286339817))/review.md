Now I have the full uncommitted diff. Let me review the current state of the working tree.

## Verdict: PASS

## Summary

The working tree contains fixes for both Major issues identified in the previous review: `signAccessTokenLongLived()` now issues 24h JWTs, and `getJwtService()` has been removed in favor of the direct `jwtService` export. Route handlers correctly use the shared `jwtService` singleton with `AuthService`.

## Findings

### Critical

None.

### Major

None.

### Minor

1. **`src/auth/index.ts:7`** — `getJwtService()` is removed from the working tree but still exists in the committed HEAD. Once committed, the dual-singleton issue will be fully resolved. Until then, the working tree state is correct.

2. **`src/auth/jwt-service.ts:94-96`** — `signAccessToken()` (15 min) coexists with `signAccessTokenLongLived()` (24h). Existing consumers of `signAccessToken()` (e.g., token refresh in `auth-service.ts:193`) will continue to issue short-lived tokens. This is intentional for refresh flows but creates two JWT expiry behaviors in the same codebase. Documenting which flow uses which method would prevent future confusion.

3. **Missing trailing newline** — `src/app/api/auth/login/route.ts` and `src/app/api/auth/register/route.ts` lack trailing newlines.

## Two-Pass Review

**Pass 1 — CRITICAL (must fix before merge):**

### SQL & Data Safety

- `register.ts:54-58` uses parameterized Payload query (`where: { email: { equals: email } }`) — safe from injection.
- `register.ts:65-74` passes `firstName`/`lastName` to `payload.create()` — no raw SQL.
- Parameterized throughout. No issues.

### Race Conditions & Concurrency

- `register.ts:54-62` check-then-create on email: if two concurrent requests register the same email, both could pass the `find` check before either creates. The `users` collection should have a unique index on `email` at the DB level. This is Payload's responsibility (enforced by the `auth: true` flag on the Users collection), but worth verifying in the migration/schema.

### Shell Injection

Not applicable.

### LLM Output Trust Boundary

Not applicable.

### Enum & Value Completeness

- No new enum values introduced. `role: 'viewer'` was already present before this diff.

**Pass 2 — INFORMATIONAL:**

### Conditional Side Effects

- `register.ts:77` calls `authService.login()` after user creation. If login fails, the user is orphaned. The route handler propagates the error correctly, so the client receives an error — but the user record remains in the DB. This is consistent with the prior behavior and acceptable.

### Test Gaps

- `route.test.ts` files mock `AuthService.login` and `jwtService` methods directly, covering HTTP status codes and error messages. Full integration tests (with a real DB) would strengthen confidence but are not required for route handler unit tests. Tests are adequate for the feature scope.

### Dead Code & Consistency

- `signAccessToken()` (15 min) is still called internally by `auth-service.ts:193` for token refresh. This is correct behavior — refresh tokens should remain short-lived. No dead code introduced by this diff.

### Crypto & Entropy

- No issues. `crypto.pbkdf2` is used for password hashing via Payload's internal mechanism. JWT signing uses Web Crypto API (`jose` library based on the implementation pattern).
