
### taskify (2026-04-11T16:30:50)
{
  "task_type": "feature",
  "title": "Add User model with password hash field",
  "description": "Create a User domain model in src/models/user-model.ts with fields: id (UUID), email (unique, indexed), passwordHash, createdAt, updatedAt. Password hashing must use bcrypt with cost factor >= 12. No role/permission fields per acceptance criteria.",
  "scope": [
    "src/models/user-model.ts",
    "package.json"
  ],
  "risk_level": "medium",
  "existing_patterns": [
    "src/models/notification.t
...(truncated)

### plan (2026-04-11T16:31:16)
## Existing Patterns Found

- `src/models/notification.ts` — domain model using TypeScript interface, kebab-case filename, exported types
- `src/auth/auth-service.ts:45-60` — password verification using `crypto.pbkdf2` (25000 iterations, SHA-256)
- `src/auth/user-store.ts:53-58` — `hashPassword` using `crypto.subtle.digest` (SHA-256)
- Test colocation pattern: `*.test.ts` alongside source files in same directory

## Plan

### Step 1: Add bcrypt dependency

**File:** `package.json`
**Change:** Ad
...(truncated)

### build (2026-04-11T16:36:21)
Implementation complete. Here's a summary:

## Changes Made

**Step 1: Added dependencies**
- `bcryptjs` ^3.0.2 (pure JavaScript bcrypt implementation - avoids native binding build issues)
- `@types/bcryptjs` ^2.4.6

**Step 2: Created `src/models/user-model.ts`**
- `User` interface with `id`, `email`, `passwordHash`, `createdAt`, `updatedAt`
- `hashPassword(password)` - uses bcrypt with cost factor 12
- `verifyPassword(password, hash)` - compares plaintext against hash

**Step 3: Created `src/mo
...(truncated)
