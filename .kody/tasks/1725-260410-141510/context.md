
### taskify (2026-04-10T14:18:31)
{
  "task_type": "feature",
  "title": "Add bcrypt passwordHash field to Users collection",
  "description": "Add a passwordHash field to the Payload CMS Users collection using bcrypt with cost factor 12. Email must be unique and indexed. The password field must be write-only (never returned in API responses). Tests verify: password hashing produces valid bcrypt hash, password comparison works, hash is not returned in serialized user, and creating a user persists correct hash to database.",
  "s
...(truncated)

### plan (2026-04-10T14:19:33)
## Existing Patterns Found

- `src/collections/Users.ts`: Payload CMS CollectionConfig with `auth: true`, field-level `access` controls with `read: () => false`, and `beforeChange` hooks for derived fields (displayName)
- `src/auth/user-store.ts`: Uses `hashPassword` / `verifyPassword` pattern — but SHA-256, task requires bcrypt
- `src/collections/Users.test.ts`: Unit tests for field structure, access control, and hooks using `findField` helper
- `src/utils/*.test.ts`: Co-located test files, `vi
...(truncated)

### build (2026-04-10T14:23:18)
## Implementation Complete

I've successfully implemented the User model with password hash field. Here's what was done:

### Changes Made

1. **Added bcryptjs dependency** (`package.json`)
   - Added `bcryptjs: ^2.4.3` to dependencies
   - Added `@types/bcryptjs: ^2.4.6` to devDependencies

2. **Created password utility** (`src/utils/password.ts`)
   - `hashPassword(password)` - hashes password using bcrypt with cost factor 12
   - `verifyPassword(password, hash)` - verifies password against bc
...(truncated)
