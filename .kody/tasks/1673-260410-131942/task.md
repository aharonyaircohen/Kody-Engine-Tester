# Add User model with password hash field

## Context
Defines the User entity that stores credentials for authentication. This model is the foundation for all subsequent auth tasks. It should store the hashed password, never the plaintext.

## Acceptance Criteria
- User model has `id`, `email`, and `passwordHash` fields
- `passwordHash` stores a bcrypt/argon2 hash of the plaintext password
- Email is unique and validated
- Password is never returned in API responses

## Test Strategy
- Unit tests for password hashing utility (hash, verify)
- Unit tests for User model validation (email format, password strength if applicable)
- Integration test: create and retrieve user, verify password hash is not plaintext

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1673-260410-131413` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24244700866))

To rerun: `@kody rerun 1673-260410-131413 --from <stage>`

**@aharonyaircohen** (2026-04-10):
🤔 **Kody has questions before proceeding:**

1. Should we use bcrypt or argon2 for password hashing, given neither is currently installed?
2. Should we deprecate the existing SHA-256 based UserStore and migrate to the Payload-native auth, or keep both systems?
3. Is the goal to add a custom passwordHash field to the Users collection (alongside Payload's built-in hash), or to use Payload's built-in hash field?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1673-260410-131942` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24244871739))

To rerun: `@kody rerun 1673-260410-131942 --from <stage>`

