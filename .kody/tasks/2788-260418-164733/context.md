
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
