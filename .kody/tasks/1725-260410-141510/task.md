# Add User model with password hash field

## Context
Adds the foundational User model needed to support JWT authentication. This model stores user identity and credentials, enabling subsequent login/register flows. Follows the existing Payload CMS collection pattern in the codebase.

## Acceptance Criteria
- User collection defined with fields: id, email, passwordHash, createdAt, updatedAt
- Password hash field uses bcrypt with cost factor 12
- User email is unique and indexed
- Password field is write-only (never returned in API responses)
- Payload CMS collection config in src/collections/Users.ts

## Test Strategy
- Unit test: verify password hashing produces valid bcrypt hash
- Unit test: verify password comparison works correctly
- Unit test: verify hash is not returned when user is serialized
- Integration test: creating a user persists correct hash to database

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1725-260410-141510` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24247320276))

To rerun: `@kody rerun 1725-260410-141510 --from <stage>`

