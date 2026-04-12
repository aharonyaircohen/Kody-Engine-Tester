
### taskify (2026-04-12T00:52:47)
```json
{
  "task_type": "feature",
  "title": "Add User model with password hash field",
  "description": "Create a User domain model in `src/models/User.ts` with fields: `id` (UUID), `email` (unique), `passwordHash`, `createdAt`, `updatedAt`. Password must never be stored in plain text — only the hash is persisted. Follow the existing `src/models/notification.ts` pattern for TypeScript interface structure. The model should use PBKDF2 for password hashing (matching `src/auth/auth-service.ts`) r
...(truncated)

### build (2026-04-12T00:54:00)
Implementation complete. I've created `src/models/User.ts` with:

- **`User` interface** with fields:
  - `id: string` (UUID)
  - `email: string` (unique)
  - `passwordHash: string` (PBKDF2-derived hash)
  - `salt: string` (random salt for PBKDF2)
  - `createdAt: Date`
  - `updatedAt: Date`

- **`CreateUserInput` interface** for input validation (email + plain password, never stored)

- **`UserFilter` interface** for query filtering

- **Named export** following the existing `notification.ts` pa
...(truncated)

### autofix (2026-04-12T00:55:45)
Fixed. The variable `context` on line 80 was declared with `let` but never reassigned — it was only ever spread into new objects, so `const` is the correct choice.

