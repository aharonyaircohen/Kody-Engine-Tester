# Add User model with password hash field

## Context
Introduces the User entity that will underpin authentication. All subsequent auth tasks (endpoints, middleware) depend on this model existing.

## Acceptance Criteria
- User type/interface with id, email, and passwordHash fields
- passwordHash field stores bcrypt/argon2 hashed passwords (never plaintext)
- User creation includes password hashing
- Unit tests covering password hashing round-trip

## Test Strategy
- Unit test: hash a password, verify it matches the original
- Unit test: hash same password twice, verify stored hashes differ (salted)
- Unit test: verify wrong password fails comparison

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-07):
@kody

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `811-260407-212615` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24105213132))

To rerun: `@kody rerun 811-260407-212615 --from <stage>`

**@aharonyaircohen** (2026-04-07):
🏗️ **Kody has architecture questions:**

1. The task specifies "bcrypt/argon2" but neither package is installed. The existing code uses SHA-256 (`crypto.subtle`) in user-store and PBKDF2 (`crypto.pbkdf2`) in auth-service. Should I add `bcrypt` as a dependency to fulfill the explicit requirement, or is the current SHA-256+random-salt approach acceptable since it still satisfies "never plaintext"?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `811-260407-213341` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24105454203))

To rerun: `@kody rerun 811-260407-213341 --from <stage>`

