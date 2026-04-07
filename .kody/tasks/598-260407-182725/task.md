# Add User model with password hash field

## Context
Defines the User entity needed to store credentials for JWT authentication. This model is the foundation for all subsequent auth tasks.
## Acceptance Criteria
- User model has fields: id, email, passwordHash, createdAt, updatedAt
- Password is never stored in plain text — only the hash is persisted
- Model is properly typed for TypeScript usage
## Test Strategy
- Unit test: verify password hashing produces different hash each time (rainbow table resistance)
- Unit test: verify password comparison returns true for correct password, false for incorrect

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-07):
@kody

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `598-260407-182725` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24097660627))

To rerun: `@kody rerun 598-260407-182725 --from <stage>`

