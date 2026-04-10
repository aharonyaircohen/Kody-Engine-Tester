# Add User model with password hash field

## Context
Adds a User model to represent authenticated users in the system. This is the foundation for the auth feature — all other auth tasks depend on having a user entity to store credentials against. Follows project conventions: TypeScript strict mode, camelCase for fields.

## Acceptance Criteria
- User model has fields: `id` (uuid), `email` (unique, not null), `passwordHash` (not null), `createdAt`, `updatedAt`
- Password hash field stores bcrypt-scoped hash (cost factor 12)
- Model is in a file matching kebab-case convention (e.g., `user.model.ts`)
- Includes timestamps (createdAt, updatedAt) auto-managed
- Unit tests cover: creating user, hashing verification, edge cases (empty email, invalid email format)

## Test Strategy
- Unit tests using Jest describe/it pattern
- Test password hashing with bcrypt
- Test model validation (unique email constraint)
- Test edge cases: null email, empty password, duplicate email

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1507-260410-095508` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24237304503))

To rerun: `@kody rerun 1507-260410-095508 --from <stage>`

**@aharonyaircohen** (2026-04-10):
🤔 **Kody has questions before proceeding:**

1. Should bcryptjs be added as a direct dependency, or should Node.js crypto.scrypt be used as a bcrypt-compatible alternative (since no bcrypt library is currently in package.json)?
2. Since the existing UserStore uses SHA-256 and AuthService uses PBKDF2, should this new User model be independent or share validation logic with those systems?
3. What email validation format should be enforced - simple presence check or RFC-compliant email regex?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1507-260410-100110` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24237476072))

To rerun: `@kody rerun 1507-260410-100110 --from <stage>`

