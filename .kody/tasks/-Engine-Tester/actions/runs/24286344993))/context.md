
### taskify (2026-04-11T16:22:53)
{
  "task_type": "feature",
  "title": "Add User model with bcrypt password hash",
  "description": "Create a User domain model in src/models/user-model.ts with fields: id (UUID), email (unique), passwordHash, createdAt, updatedAt. Password hashing must use bcrypt with cost factor >= 12. Model should include email index for uniqueness. Tests should verify: hash function produces unique outputs (salt), hash can be compared against plaintext, model fields are correctly typed, and creating a user p
...(truncated)

### plan (2026-04-11T16:23:30)
## Existing Patterns Found

- `src/models/notification.ts`: TypeScript interface-only domain model with JSDoc module annotation
- `src/auth/user-store.ts:53-58`: Async password hashing pattern using crypto.subtle
- `src/utils/result.ts`: `Result<T, E>` discriminated union + `ok()`/`err()` factory functions
- `src/auth/auth-service.ts:45-60`: PBKDF2 password verification (existing Payload-compatible algorithm)
- Test colocation: `*.test.ts` alongside source files in same directory

---

## Plan


...(truncated)

### build (2026-04-11T16:26:25)
## Implementation Complete

### Summary

**Step 1 - Install bcrypt dependency:**
- Added `bcrypt: ^5.1.1` to dependencies
- Added `@types/bcrypt` to devDependencies
- Built the native module successfully

**Step 2 - Created User model (`src/models/user-model.ts`):**
- `User` interface: id, email, passwordHash, createdAt, updatedAt
- `CreateUserInput` interface: email, password
- `PasswordHash` interface: hash, salt
- `PasswordHashingError` custom error class
- `BCRYPT_COST_FACTOR = 12` constant

...(truncated)
