# Add User model with password hash field

## Context
The User model is the foundation for JWT authentication. It stores user credentials needed for login and registration. The password must be stored as a hash, never plaintext.

## Acceptance Criteria
- User model includes an email field (unique, used for login)
- User model includes a passwordHash field (stores bcrypt/argon2 hash of the user's password)
- User model validation ensures email is present and valid format
- Password hash is never exposed in API responses

## Test Strategy
- Unit tests for User model creation with valid/invalid email
- Unit tests confirming passwordHash is populated on user creation
- Unit tests confirming passwordHash is excluded from JSON serialization

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1676-260410-131450` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24244726296))

To rerun: `@kody rerun 1676-260410-131450 --from <stage>`

