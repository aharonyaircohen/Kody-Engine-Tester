
### taskify (2026-04-09T22:50:11)
Based on my exploration, I can see:

1. **`src/collections/Users.ts`** - Payload collection with `auth: true` (uses Payload's built-in hash/salt)
2. **`src/auth/user-store.ts`** - Has a `User` interface with `passwordHash` (SHA-256)
3. **`src/auth/auth-service.ts`** - Has password verification using PBKDF2 matching Payload's algorithm

The task appears to be creating a unified User domain model with proper password hashing. Let me output the classification:

{
"task_type": "feature",
"title": "A
...(truncated)

### build (2026-04-09T23:01:20)

## Implementation Complete

I've implemented the User model with password hash field. Here's a summary:

### Files Created

**1. `src/models/user.ts`** - User domain model with:
- `User` interface with fields: `id` (UUID), `email` (unique), `passwordHash`, `createdAt`, `updatedAt`
- `UserRole` type: `'admin' | 'editor' | 'viewer' | 'guest' | 'student' | 'instructor'`
- Email validation with regex and Result type
- Password hash validation (requires 64+ chars for PBKDF2)
- `createUser()` - creat
...(truncated)
