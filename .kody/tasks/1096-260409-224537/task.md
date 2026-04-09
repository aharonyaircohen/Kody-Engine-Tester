# Add User model with password hash field

## Context
Add a User model to represent authentication users. This model stores user credentials securely by hashing passwords rather than storing them in plain text. All authentication features depend on this model.

## Acceptance Criteria
- User model has fields: id (UUID), email (unique), passwordHash, createdAt, updatedAt
- Password is never stored in plain text — only the hash is persisted
- Email is unique and validated format
- TypeScript strict mode enabled with proper types
- Model follows existing project conventions (kebab-case files, camelCase functions, PascalCase types)

## Test Strategy
- Unit tests for password hashing utility (hash, verify)
- Unit tests for User model creation with valid/invalid data
- Test edge cases: duplicate email, invalid email format, empty password

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `1096-260409-224537` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24216988648))

To rerun: `@kody rerun 1096-260409-224537 --from <stage>`

