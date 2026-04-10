
### taskify (2026-04-10T07:55:07)
{
  "task_type": "feature",
  "title": "Add passwordHash field to User model with bcrypt hashing",
  "description": "Add a `passwordHash` field to the existing Users collection and create a password hashing utility using bcrypt (or argon2). This involves: (1) adding the `passwordHash` field to `src/collections/Users.ts`, (2) creating a password hashing utility in `src/utils/` with hash and verify functions, (3) adding a database migration to create the column, and (4) writing unit tests for the 
...(truncated)

### plan (2026-04-10T07:56:38)
Now I have a clear picture. Let me write the plan.

## Pattern Discovery Report

- **Payload collection pattern** (`src/collections/Users.ts`): Collection config with fields array, access controls, hooks. No `passwordHash` field exists yet.
- **Migration pattern** (`src/migrations/20260405_000000_add_users_permissions_lastLogin.ts`): Uses `sql` template tag with `ALTER TABLE ADD COLUMN` for adding columns to existing tables.
- **Utility test pattern** (`src/utils/*.test.ts`): Co-located tests, `
...(truncated)

### build (2026-04-10T08:01:22)
All 48 tests pass. Here's a summary of the implementation:

## Summary of Changes

### 1. Added bcryptjs dependency (`package.json`)
- Added `bcryptjs: ^2.4.3` to dependencies
- Added `@types/bcryptjs: ^2.4.6` to devDependencies

### 2. Created password hashing utility (`src/utils/password-hash.ts`)
- `hashPassword(password: string): Promise<HashResult>` - hashes password with bcrypt (10 salt rounds)
- `verifyPassword(password: string, hash: string): Promise<boolean>` - verifies password against
...(truncated)
