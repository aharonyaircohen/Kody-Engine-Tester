
### taskify (2026-04-10T13:20:51)
```json
{
  "task_type": "feature",
  "title": "Add User model with password hash field",
  "description": "Add a passwordHash field to the Users Payload collection with bcrypt/argon2 hashing, email uniqueness validation, and ensuring passwords are never returned in API responses. This includes creating a password hashing utility and unit tests for hash/verify operations.",
  "scope": [
    "src/collections/Users.ts"
  ],
  "risk_level": "medium",
  "existing_patterns": [
    "src/auth/auth-serv
...(truncated)

### plan (2026-04-10T13:21:43)
## Existing Patterns Found

- **Payload auth with built-in hash/salt**: `src/collections/Users.ts` uses `auth: true` which provides Payload's `hash` and `salt` fields automatically; `src/auth/auth-service.ts` reads `(user as any).hash` and `(user as any).salt` for PBKDF2 verification
- **Password hashing in UserStore**: `src/auth/user-store.ts` has `passwordHash` + `salt` fields with SHA-256 (deprecated pattern)
- **Test colocation**: Tests live alongside source as `*.test.ts` with `vi.fn()` moc
...(truncated)

### build (2026-04-10T13:26:06)
## Implementation Complete

I've implemented the User model with password hash field following the plan. Here's a summary:

### Changes Made

**1. Installed `bcryptjs` package** (switched from `bcrypt` due to native build issues)
- Added `bcryptjs@^2.4.3` to dependencies
- Added `@types/bcryptjs@^2.4.6` to devDependencies

**2. Created password hashing utility** (`src/utils/password.ts`)
- `hash(password: string): Promise<string>` - hashes using bcryptjs with 10 salt rounds
- `verify(password: s
...(truncated)
