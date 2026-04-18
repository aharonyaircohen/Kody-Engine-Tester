# Add hash and salt fields to Users collection

## Context
The AuthService (PBKDF2, JWT-based) expects `hash` and `salt` fields on the Payload Users collection for password verification, but these fields are not currently defined in the collection config. The existing Users collection uses Payload's built-in `auth: true` which handles passwords internally but doesn't expose `hash`/`salt` to application code. Additionally, the codebase has a dual auth system anti-pattern: UserStore (SHA-256, in-memory) coexists with AuthService (PBKDF2, JWT). Adding explicit hash/salt fields enables consistent PBKDF2 password verification across the AuthService path.

## Acceptance Criteria
- Users Payload collection includes `hash` and `salt` text fields with appropriate access controls (hidden from client reads, admin-only update)
- Payload hooks automatically populate `hash` and `salt` when a user is created via the registration flow
- AuthService password verification works against the stored fields
- Existing tests pass (or are updated to reflect the new fields)

## Test Strategy
- Unit test: verify Users collection fields are defined with correct access controls
- Unit test: verify password hashing hook populates hash and salt on user creation
- Integration test: register a new user and verify hash/salt are persisted
- Integration test: login and verify password verification succeeds against stored hash/salt

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2791-260418-164939`

