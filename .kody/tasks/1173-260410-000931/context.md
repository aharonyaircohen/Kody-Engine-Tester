
### taskify (2026-04-10T00:11:00)
```json
{
  "task_type": "feature",
  "title": "Add User domain model with password hash field",
  "description": "Create a User domain model in src/models/user.ts with fields: id, email, passwordHash, createdAt, updatedAt. The model should be a TypeScript interface exported for use by other auth modules. Unit tests should verify password hashing produces unique hashes per user (due to salt) and model type correctness. Integration test should verify creating a user persists hashed password, not 
...(truncated)

### build (2026-04-10T00:14:43)
The implementation is complete. Let me provide a summary:

## Summary

I've implemented the User domain model with password hash field as requested:

### Files Created

**`src/models/user.ts`**
- `User` interface with fields: `id`, `email`, `passwordHash`, `createdAt`, `updatedAt`
- `CreateUserInput` and `UserFilter` interfaces for input handling
- `hashPassword()` function using PBKDF2 (25000 iterations, sha256, 512 bytes key) with random salt
- `verifyPassword()` function using `crypto.timingS
...(truncated)
