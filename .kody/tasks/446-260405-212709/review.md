## Verdict: PASS

## Summary

The commit fixes the previous critical schema mismatch (the `permissions` field was `text[]` in migration but scalar `text` in Payload field definition) and now correctly uses `json`/`jsonb` for the `permissions` field. It adds `lastLogin` timestamp field, `push: false` for migration control, and regenerates `payload-types.ts`.

## Findings

### Critical

- `src/auth/auth-service.ts:136` — `lastLogin: new Date().toISOString()` writes an ISO string to the `lastLogin` field defined as `type: 'date'`. Payload stores `date` fields as PostgreSQL `timestamp`. The ISO string will be coerced by PostgreSQL, but this is implicit and fragile. If the PostgreSQL column receives a bare timestamp instead of an ISO string, it may store incorrect values depending on the session timezone. **Suggested fix:** Use `new Date()` (Date object) instead of `new Date().toISOString()`, letting Payload handle the conversion consistently.

### Major

- `src/auth/auth-service.ts:33` — `REFRESH_TOKEN_EXPIRY_MS` constant is defined but never used. The `AuthService` uses the JWT service's own expiry configuration. Dead constant creates misleading maintenance burden. **Suggested fix:** Remove the unused constant.

### Minor

- `src/collections/Users.ts:136-147` — The `permissions` field has `admin: { readOnly: true }` and `access: { read: () => false, update: () => false }`, meaning it can never be populated via Payload's API or admin panel. The field exists but no code writes to it. If this is intentional for future use, the field adds confusion; if it should be populated, the auth service should write permissions on login/role-change.

- `src/payload.config.ts:42-43` — Adding `push: false` and `migrationDir` is a correct production pattern but requires explicit `payload migrate` in the deployment pipeline. The `CI Quality Gates` in project memory already document `pnpm ci` runs `payload migrate`, so this is covered — no action needed.

## Two-Pass Review

**Pass 1 — CRITICAL (must fix before merge):**

### SQL & Data Safety

- None — `permissions` now correctly uses `json`/`jsonb`; `lastLogin` uses `timestamp(3) with time zone`.

### Race Conditions & Concurrency

- `src/auth/auth-service.ts` — Token refresh with generation counter (tracked in JWT payload) provides replay protection for refresh tokens. This is correctly implemented.

### Enum & Value Completeness

- The `RbacRole` values (`admin`, `editor`, `viewer`) are defined in `src/auth/auth-service.ts:6` and consumed in `src/auth/_auth.ts:17-21` and `src/middleware/role-guard.ts`. No completeness issues.

**Pass 2 — INFORMATIONAL (should review, may auto-fix):**

### Conditional Side Effects

- `src/auth/auth-service.ts:136` — `lastLogin` is updated on every login. No issues.

### Dead Code & Consistency

- `src/auth/auth-service.ts:33` — `REFRESH_TOKEN_EXPIRY_MS` constant unused (see Major finding above).

### Test Gaps

- `lastLogin` field is written in `auth-service.ts` but no unit test directly asserts that `lastLogin` is set (it may be indirectly covered by integration tests). This is a minor gap.

---

**Suppressions:** The `push: false` / `migrationDir` configuration is a standard Payload production pattern and is already covered by the documented `pnpm ci` pipeline that runs `payload migrate`.
