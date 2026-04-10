# Add User model with password hash field

## Context
Create the User model as the foundation for JWT authentication. This model stores user credentials needed for login and registration. The password must be stored as a hash, never plaintext.

## Acceptance Criteria
- User model has fields: id, email, passwordHash, createdAt, updatedAt
- Password hash is generated using a secure algorithm (e.g., bcrypt, argon2)
- Password hash is never exposed in API responses
- User email is unique and validated

## Test Strategy
- Unit tests for password hashing utility (hash, verify)
- Unit tests for password hash function edge cases (empty string, very long password)
- Model creation test verifying hash is generated on password set

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1177-260410-000142` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24219374335))

To rerun: `@kody rerun 1177-260410-000142 --from <stage>`

**@aharonyaircohen** (2026-04-10):
🤔 **Kody has questions before proceeding:**

1. Which secure algorithm should be used - bcrypt or argon2?
2. Should the new passwordHash field replace Payload's built-in auth hash, or coexist alongside it?
3. What is the maximum password length limit for validation?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1177-260410-000813` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24219512657))

To rerun: `@kody rerun 1177-260410-000813 --from <stage>`

