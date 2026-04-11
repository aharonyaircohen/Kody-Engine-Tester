# Add User model with password hash field

## Context
Defines the User entity for the authentication system. This model is the foundation for all subsequent auth tasks. The model must store a hashed password rather than plaintext for security.

## Acceptance Criteria
- User model has fields: id (UUID), email (unique), passwordHash, createdAt, updatedAt
- Password is never stored in plaintext — only the hash is persisted
- Password hash uses bcrypt with a cost factor of at least 12
- Model includes timestamps for created/updated
- User email is unique and indexed
- Model is defined in a file using kebab-case (e.g., `user-model.ts`)

## Test Strategy
- Unit test: verify hash function produces different output for same input (salt)
- Unit test: verify hash can be compared against plaintext password
- Unit test: verify model fields are correctly typed
- Integration test: creating a user persists the hash, not plaintext password

---

## Discussion (11 comments)

**@aharonyaircohen** (2026-04-11):
@kody

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `1923-260411-160620` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286262772))

To rerun: `@kody rerun 1923-260411-160620 --from <stage>`

**@aharonyaircohen** (2026-04-11):
🤔 **Kody has questions before proceeding:**

1. Should the model file be placed in `src/models/` (following the existing domain model pattern with notification.ts) or elsewhere in `src/auth/`?
2. Should bcrypt be added as a new dependency or is there an existing hashing utility to use?
3. Should the model include any role/permission fields, or is it strictly id/email/passwordHash/timestamps?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `approve`` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286344993))

To rerun: `@kody rerun approve` --from <stage>`

**@aharonyaircohen** (2026-04-11):
🤔 **Kody has questions before proceeding:**

1. Should the model file be placed in `src/models/` (following the existing domain model pattern with notification.ts) or elsewhere in `src/auth/`?
2. Should bcrypt be added as a new dependency or is there an existing hashing utility to use?
3. Should the model include any role/permission fields, or is it strictly id/email/passwordHash/timestamps?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24286262772))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286319146))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24286262772)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🤔 **Kody has questions before proceeding:**

1. Should the model file be placed in src/models/ (following the existing domain model pattern with notification.ts) or elsewhere in src/auth/?
2. Should bcrypt be added as a new dependency or is there an existing hashing utility to use?
3. Should the model include any role/permission fields, or is it strictly id/email/passwordHash/timestamps?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `approve`` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286344992))

To rerun: `@kody rerun approve` --from <stage>`

**@aharonyaircohen** (2026-04-11):
🤔 **Kody has questions before proceeding:**

1. Should the model file be placed in `src/models/` (following the existing domain model pattern with notification.ts) or elsewhere in `src/auth/`?
2. Should bcrypt be added as a new dependency or is there an existing hashing utility to use?
3. Should the model include any role/permission fields, or is it strictly id/email/passwordHash/timestamps?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24286344993))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286384756))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24286344993)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `approve`` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286411844))

To rerun: `@kody rerun approve` --from <stage>`

