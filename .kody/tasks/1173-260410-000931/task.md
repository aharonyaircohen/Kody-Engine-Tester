# Add User model with password hash field

## Context
The auth feature requires a User model to store user credentials. This model will store the password in hashed form for security. All other auth-related tasks depend on this model existing.

## Acceptance Criteria
- User model is defined with fields: id, email, passwordHash, createdAt, updatedAt
- Password is never stored in plain text
- Model includes proper TypeScript types
- Model is exported for use by other modules

## Test Strategy
- Unit test: verify password hashing produces different hash each time (no timing attacks)
- Unit test: verify model type definitions are correct
- Integration test: creating a user persists hashed password, not plain text

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1173-260410-000204` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24219368755))

To rerun: `@kody rerun 1173-260410-000204 --from <stage>`

**@aharonyaircohen** (2026-04-10):
🏗️ **Kody has architecture questions:**

1. The task acceptance criteria lists `updatedAt` field, but the existing `Users` Payload collection uses `hash`/`salt` from Payload's built-in auth (not `passwordHash`). Should this new model intentionally use `passwordHash` naming (which differs from Payload's `hash`) to clarify this is a separate domain model, or should it align with Payload's field names?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1173-260410-000931` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24219548881))

To rerun: `@kody rerun 1173-260410-000931 --from <stage>`

