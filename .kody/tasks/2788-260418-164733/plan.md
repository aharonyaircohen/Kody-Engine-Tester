

The plan has been written to `.kody/tasks/2788-260418-164733/plan.md`. Here's a summary:

## Existing Patterns Found

- **Payload field access control** (`refreshToken` in `Users.ts`): `access: { read: () => false, update: () => false }` — reused for `passwordHash`
- **PBKDF2 algorithm** (`AuthService.verifyPassword`): `crypto.pbkdf2(password, salt, 25000, 512, 'sha256', callback)` — centralized into a new `password-hash.ts` utility
- **Hidden + read-guarded fields** (`tokenExpiresAt`, `lastLogin`, `permissions`): `hidden: true` + `access.read: () => false` — pattern reused
- **Test colocation**: `Users.test.ts` uses `findField(name)` helper + `makeMockReq()` — pattern extended for new field tests

## Plan Steps

| Step | File | Action |
|------|------|--------|
| 1 (TDD) | `src/collections/Users.test.ts` | Add `describe('Users fields - passwordHash')` — asserts field type, `access.read: false`, `access.update: false` |
| 2 (TDD) | `src/utils/password-hash.test.ts` (new) | Unit tests: hash ≠ plaintext, 128-char hex, salt uniqueness, verify correct/wrong passwords |
| 3 | `src/utils/password-hash.ts` (new) | Export `generatePasswordHash` + `verifyPasswordHash` using 25000-iteration PBKDF2 (same as AuthService) |
| 4 | `src/collections/Users.ts` | Add `passwordHash` text field with `hidden: true`, `access: { read/create/update: () => false }`, and `beforeChange` hook that calls `generatePasswordHash` when `password` is present |
| 5 | — | `pnpm test:int` to verify all tests pass |

### Key Design Choice
The `passwordHash` field stores both `salt:hash` as a single delimited string so `verifyPasswordHash` in `AuthService` can retrieve both values. This matches how `AuthService` already reads `hash` and `salt` fields — a future task would rename those reads to `passwordHash` once the field is populated on existing users.