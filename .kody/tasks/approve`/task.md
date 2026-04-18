# Add password hash field to User model

## Context
The project has dual auth systems (UserStore with SHA-256 and AuthService with PBKDF2/JWT). This task consolidates by ensuring the Payload User collection has a proper passwordHash field with hooks for secure password hashing using PBKDF2, aligning with the existing AuthService.

## Acceptance Criteria
- User Payload collection includes a `passwordHash` field
- Password hashing uses PBKDF2 with appropriate salt and iterations
- A `hashPassword` utility function is exported for use by registration
- Existing User data is not modified (additive migration only)

## Test Strategy
- Unit test `hashPassword` produces different hash each call (due to random salt)
- Unit test `hashPassword` is deterministic when same input/salt provided
- Integration test: create user via Payload, verify password can be verified
- Run `pnpm payload migrate` to verify migration applies cleanly

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-17):
@kody

**@aharonyaircohen** (2026-04-17):
🚀 Kody pipeline started: `2449-260417-235022`

**@aharonyaircohen** (2026-04-17):
🤔 **Kody has questions before proceeding:**

1. Should a verifyPassword function be included alongside hashPassword, or is verifying against the hash out of scope for this task?
2. Should the new passwordHash field replace the SHA-256 hash in UserStore entirely, or should both coexist during a transition period?
3. Is there an existing migration naming convention or directory structure (e.g., src/migrations/) that the migration file should follow?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-17):
🚀 Kody pipeline started: `approve``

