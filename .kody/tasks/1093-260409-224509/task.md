# Add User model with password hash field

## Context
Create a User model to store user credentials for JWT authentication. This is the foundation for the auth system — all subsequent auth tasks depend on having a place to store users and their hashed passwords.

## Acceptance Criteria
- User model/entity exists with at minimum: id, email, and passwordHash fields
- Password hash field stores the result of a secure hashing algorithm (e.g., bcrypt, argon2)
- Plain-text passwords are never stored
- User model includes any timestamps (createdAt, updatedAt) per project conventions

## Test Strategy
- Unit tests for password hashing: verify hash is different from plain text, same input produces different hashes (salted)
- Unit tests for password verification: correct password returns true, incorrect returns false
- Edge cases: empty password, very long password

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `1093-260409-224509` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24216984485))

To rerun: `@kody rerun 1093-260409-224509 --from <stage>`

