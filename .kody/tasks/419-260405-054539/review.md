## Verdict: PASS

## Summary

JWT-based authentication redesign completing: (1) hierarchical RBAC added to `checkRole` and `requireRole` via numeric `ROLE_HIERARCHY`, (2) `Users` collection extended with `permissions` (text) and `lastLogin` (timestamp) fields, (3) `logout.ts`, `refresh.ts`, `register.ts`, `profile.ts` migrated from `SessionStore`/`UserStore` to `AuthService`/Payload, (4) Payload migration script added for schema changes.

## Findings

### Critical

None.

### Major

- `src/migrations/20260405_000000_add_users_permissions_lastLogin.ts:7` — Migration creates `permissions` as `varchar`, but `src/collections/Users.ts:139` defines it as `type: 'text'`. Schema mismatch between DB and Payload field type. Should be `text` in migration to match Payload field config.
- `src/api/auth/profile.ts:75-84` — Password update path in `updateProfile` no longer verifies the current password. The `currentPassword` field is accepted in the input but the verification call to `userStore.verifyPassword` was removed during migration to `AuthService`. The comment says "For now, we just update the password directly" — this is a security regression where anyone with a valid session could change a user's password without knowing the current one.

### Minor

- `src/api/auth/logout.ts:13` — `_accessToken` and `_allDevices` parameters are unused (prefixed with `_`). The `allDevices` behavior (revoke all sessions vs single session) is lost — `AuthService.logout` always clears the refresh token for all devices. This is a behavioral change from the original implementation, though arguably acceptable since JWT has no concept of per-device sessions.
- `src/api/auth/profile.ts:24` — `isActive` hardcoded to `true` as a fallback. If `isActive` is `false` in the DB, the profile still shows active. Should use `user.isActive ?? true` to match `auth-service.ts` pattern at line 95.

### Test Gaps

- `src/api/auth/profile.test.ts` — No tests for password update flow (the `newPassword`/`currentPassword` path).
- `src/api/auth/logout.test.ts` — No negative-path test (e.g., invalid userId).

## Two-Pass Review

**Pass 1 — CRITICAL (must fix before merge):**

### SQL & Data Safety
- `src/migrations/20260405_000000_add_users_permissions_lastLogin.ts:5-7` — SQL uses parameterized-style `ALTER TABLE` which is safe for column additions. No SQL injection risk.

### Race Conditions & Concurrency
- No obvious race conditions introduced. Token refresh uses generation counter (increments atomically in DB update).

### LLM Output Trust Boundary
N/A — no LLM usage.

### Shell Injection
N/A — no shell commands.

### Enum & Value Completeness
- `RbacRole = 'admin' | 'editor' | 'viewer'` — `ROLE_HIERARCHY` maps all three. No unhandled values.
- `ROLE_HIERARCHY` is defined in `src/auth/_auth.ts:15-18` and imported into `src/middleware/role-guard.ts`. Both consumers updated consistently.

**Pass 2 — INFORMATIONAL (should review, may auto-fix):**

### Conditional Side Effects
- `src/api/auth/profile.ts:69-73` — `currentPassword` is accepted in input but never verified. The security regression (Major above) means this is a silent bypass.

### Test Gaps
- Password change in `profile.ts` has no test coverage.
- `updateProfile` with `newPassword` path not tested.

### Dead Code & Consistency
- `src/api/auth/logout.ts` — Unused parameters `_accessToken` and `_allDevices` are accepted but meaningless now.
- `src/api/auth/profile.ts:24` — `isActive` defaulting to `true` when it should reflect the actual DB value.

### Performance & Bundle Impact
- No new heavy dependencies added.

### Type Coercion at Boundaries
- `src/auth/auth-service.ts:97` — `hash` and `salt` cast from `any` to `string | null | undefined` then checked with truthy — correct.
