# Add User model with password hash field

## Context
Create a User model to store user credentials. This is the foundation for JWT authentication — without a persistent user store, login and registration cannot function.

## Acceptance Criteria
- User model has fields: id, email, passwordHash
- Password is never stored in plain text (use bcrypt or argon2)
- User email is unique
- Model is defined in the appropriate models directory following project conventions

## Test Strategy
- Unit test: verify password hashing produces different hash each time (salted)
- Unit test: verify password comparison works correctly (match/mismatch)
- Unit test: model schema validation for required fields

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-07):
@kody

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `808-260407-212609` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24105193808))

To rerun: `@kody rerun 808-260407-212609 --from <stage>`

**@aharonyaircohen** (2026-04-07):
🤔 **Kody has questions before proceeding:**

1. The task requires bcrypt or argon2 for password hashing, but the project improvement area notes prefer AuthService (PBKDF2 via Node crypto). Should I use bcrypt as specified, or follow the project preference for PBKDF2 to align with existing AuthService?
2. The Users collection (src/collections/Users.ts) already has auth enabled with hash/salt fields managed by Payload. Is the new User model intended to be a separate domain model, or should it integrate with/extend the existing Payload collection?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `808-260407-213142` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24105370721))

To rerun: `@kody rerun 808-260407-213142 --from <stage>`

