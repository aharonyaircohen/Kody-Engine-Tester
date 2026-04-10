# Add User model with password hash field

## Context
We need a User model to store user credentials for JWT authentication. This is the foundation of the auth system — all subsequent auth tasks depend on having a user entity to work with.

## Acceptance Criteria
- User model with `email` (unique) and `passwordHash` fields
- Password is never stored in plain text — use bcrypt or argon2
- User model is typed with TypeScript interfaces
- Database migration creates the users table

## Test Strategy
- Unit tests for password hashing/verification utilities
- Model validation tests (email format, password length)
- Integration test that a user can be created and hashed password verified

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1435-260410-075136` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24232606396))

To rerun: `@kody rerun 1435-260410-075136 --from <stage>`

