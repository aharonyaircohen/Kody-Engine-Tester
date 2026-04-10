
### taskify (2026-04-10T14:19:13)
{
  "task_type": "feature",
  "title": "Add User model with passwordHash field and password hashing utility",
  "description": "Create a User domain model (src/models/user.ts) with id, email, passwordHash, and createdAt fields. Create a password hashing utility (src/utils/password.ts) exporting hashPassword and verifyPassword functions using bcrypt-equivalent secure hashing with embedded salt. Co-located unit tests cover: hash output varies each call, verification succeeds for correct password, 
...(truncated)

### plan (2026-04-10T14:19:59)
## Pattern Discovery Report

- **Domain model pattern**: `src/models/notification.ts` - TypeScript interface with `id`, `email`, `createdAt` fields — reused for User model structure
- **Password hashing reference**: `src/auth/auth-service.ts` uses PBKDF2 (25000 iterations, sha256, 512 bits) — qualifies as "bcrypt or equivalent"
- **Test colocation**: `src/utils/*.test.ts` pattern — vitest describe/it, co-located with source
- **bcrypt unavailable**: Not in `package.json`; using PBKDF2 with embed
...(truncated)

### build (2026-04-10T14:21:16)
TypeScript errors are all pre-existing in other files — none from the new files I created. 

**Summary of implementation:**

1. **`src/models/user.ts`** — User interface with `id`, `email`, `passwordHash`, `createdAt` fields, following the `notification.ts` pattern.

2. **`src/utils/password.ts`** — PBKDF2-based password utility:
   - `hashPassword(plaintext)` — generates random 128-bit salt, applies PBKDF2 (25000 iterations, sha256, 512-bit key), returns `salt:hash` hex string
   - `verifyPassw
...(truncated)

### review (2026-04-10T14:23:48)
## Verdict: PASS

## Summary

Created a `User` domain model interface (`src/models/user.ts`) with `id`, `email`, `passwordHash`, and `createdAt` fields, and a password utility (`src/utils/password.ts`) providing `hashPassword` and `verifyPassword` functions using PBKDF2 (25000 iterations, SHA-256, 512-bit key) with embedded random salt in `salt:hash` format. Unit tests in `src/utils/password.test.ts` cover all acceptance criteria: hash uniqueness, correct verification, wrong password rejection, 
...(truncated)
