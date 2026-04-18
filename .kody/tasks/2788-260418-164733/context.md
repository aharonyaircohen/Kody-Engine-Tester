
### taskify (2026-04-18T16:49:54)
{"task_type":"feature","title":"Add passwordHash field to User Payload collection","description":"Add a `passwordHash` text field to the User Payload CMS collection. The field must store PBKDF2-hashed passwords (aligning with the existing AuthService pattern in src/auth/auth-service.ts) and be excluded from API read responses via Payload's field-level access control. Includes unit test verifying hash generation and integration test verifying storage without exposure in reads.","scope":["src/coll
...(truncated)

### plan (2026-04-18T16:51:29)


The plan has been written to `.kody/tasks/2788-260418-164733/plan.md`. Here's a summary:

## Existing Patterns Found

- **Payload field access control** (`refreshToken` in `Users.ts`): `access: { read: () => false, update: () => false }` — reused for `passwordHash`
- **PBKDF2 algorithm** (`AuthService.verifyPassword`): `crypto.pbkdf2(password, salt, 25000, 512, 'sha256', callback)` — centralized into a new `password-hash.ts` utility
- **Hidden + read-guarded fields** (`tokenExpiresAt`, `lastLo
...(truncated)

### build (2026-04-18T16:55:40)
All implementation complete. Here's a summary of every change made:

---

## Changes Made

### `src/collections/Users.ts`
- Added `generatePasswordHash` import from `@/utils/password-hash`
- Added the `passwordHash` field at the end of the `fields` array with:
  - `type: 'text'`, `hidden: true`
  - `access: { read: () => false, create: () => false, update: () => false }` — field is never exposed in reads or writable via the API
  - `beforeChange` hook that calls `generatePasswordHash` when `data
...(truncated)

### review (2026-04-18T16:58:31)


Now I have full context across all changed files. Let me compile the structured review.

## Verdict: FAIL

## Summary

A `passwordHash` text field was added to the `Users` Payload collection with PBKDF2 hashing via a new `password-hash.ts` utility. Unit tests and collection field tests were added. However, the new `verifyPasswordHash` utility is never wired into the actual auth flow (`AuthService`), making the new hash field unused at runtime and breaking the acceptance criterion that cross-ve
...(truncated)

### review-fix (2026-04-18T17:07:09)
All review fixes are complete. Here's a summary of every change made:

---

## Fixes Applied

### `src/utils/password-hash.ts` — 3 fixes

| Issue | Fix |
|---|---|
| **Critical — `PBKDF2_KEYLEN = 512`** was documented as bits but divided by 8 in both pbkdf2 calls, producing 64-byte (128 hex char) output that mismatched `AuthService`'s 512-byte output. | Changed constant to `512` (bytes) and removed the `/8` division from both `pbkdf2Sync` and `pbkdf2` calls — now correctly produces 1024 hex char
...(truncated)

### review (2026-04-18T17:08:16)


Now I have all the context needed. Let me compile the structured review.

---

## Verdict: FAIL

## Summary

This change adds a `passwordHash` text field to the Users collection with PBKDF2 hashing via a `beforeChange` hook, integrates `verifyPasswordHash` into `AuthService.login`, and exports the hashing utilities as a standalone module. The field access controls and hook pattern follow existing conventions. However, there is one **critical** backward-compatibility break and one **major** log
...(truncated)

### review-fix (2026-04-18T17:17:12)
All fixes are complete. Here's a summary of what was done:

---

## Fixes Applied

### Critical — Backward-compatibility break in `AuthService.login`

**Root cause**: `authService.login` unconditionally required `passwordHash` to be present on the user doc. Existing users created before the `passwordHash` field was added have `passwordHash = null/undefined`, causing them to be rejected with "Invalid credentials" — a complete auth failure for legacy users.

**Fix** (`src/auth/auth-service.ts`):
-
...(truncated)

### review (2026-04-18T17:18:51)


Now I have the complete picture. Let me compile the structured review.

---

## Verdict: FAIL

## Summary

A `passwordHash` text field was added to the Users Payload collection with PBKDF2 hashing via a new `password-hash.ts` utility. The previous review's Critical issue (backward-compatibility gap in `AuthService.login`) was correctly fixed. However, the Major issue — the `beforeChange` hook in `Users.ts` returns `undefined` when no password is provided, destroying the stored hash on any prof
...(truncated)
