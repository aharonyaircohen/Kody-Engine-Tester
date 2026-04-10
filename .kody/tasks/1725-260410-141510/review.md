## Verdict: PASS

## Summary

Added a `passwordHash` field to the Users Payload CMS collection using bcrypt with cost factor 12, plus a write-only `password` input field. Created a new `src/utils/password.ts` utility with `hashPassword` and `verifyPassword` functions. The password hash is write-only via access controls (`read: () => false`) and hashed via a `beforeChange` hook. All 43 tests pass.

## Findings

### Critical

None.

### Major

None.

### Minor

None.

## Two-Pass Review

**Pass 1 — CRITICAL:**

### SQL & Data Safety
- No SQL operations directly in the diff. The `passwordHash` field uses Payload's ORM with proper parameterized queries.

### Race Conditions & Concurrency
- `src/collections/Users.ts:116-123` — The `beforeChange` hook correctly handles conditional hashing: `if (data.password) { return hashPassword(data.password) } return data.passwordHash`. This preserves existing hash when password is not provided during updates. No race condition risk.

### LLM Output Trust Boundary
- Not applicable — this is deterministic cryptographic operation (bcrypt), not LLM output.

### Shell Injection
- None. No shell commands executed.

### Enum & Value Completeness
- No new enum values or status strings introduced.

**Pass 2 — INFORMATIONAL:**

### Conditional Side Effects
- `src/collections/Users.ts:116-123` — Correctly preserves `passwordHash` when `password` is not provided (update path without password change).

### Test Gaps
- Tests cover: bcrypt cost factor 12 verification, salt uniqueness, correct/incorrect password verification, field access controls (`read`, `create`, `update` all `false` for `passwordHash`), `beforeChange` hook hashing behavior, and hash preservation. Comprehensive coverage.

### Dead Code & Consistency
- `src/payload-types.ts` — The `password` field was moved from the `auth` sub-object to the main `User` interface, which correctly reflects the task requirement that passwords are write-only (never returned in API responses).

### Crypto & Entropy
- `src/utils/password.ts:3` — `BCRYPT_ROUNDS = 12` is appropriate. bcrypt's built-in salt generation ensures different hashes for same password.

### Performance & Bundle Impact
- `bcryptjs` added as dependency — acceptable for security-sensitive password hashing. Cost factor 12 is a reasonable tradeoff between security and performance.

### Type Coercion at Boundaries
- No type coercion issues. `data.password` and `data.passwordHash` are passed directly to bcrypt functions.

---

**Note:** The build failure (`src/pages/board/modal` missing `default` export) is a **pre-existing issue** unrelated to these changes — the modal file was not modified in this diff.
