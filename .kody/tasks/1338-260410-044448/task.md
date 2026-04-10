# Add User model with password hash field

## Context
The User model is the foundation for JWT authentication. It stores user credentials needed for login and registration. All auth-related features depend on this model existing first.

## Acceptance Criteria
- User type/class defined with `id`, `email`, and `passwordHash` fields
- `passwordHash` field stores bcrypt/argon2 hashed passwords (never plain text)
- Email field is unique and validated
- Timestamps for `createdAt` and `updatedAt`
- Unit tests covering model creation and validation

## Test Strategy
- Unit tests for User model instantiation with hashed password
- Test that password is properly hashed before storage
- Test validation for email format and required fields

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1338-260410-044448` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24226817914))

To rerun: `@kody rerun 1338-260410-044448 --from <stage>`

