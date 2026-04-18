# Add User model with password hash field

## Context
The codebase has a dual auth system (UserStore with SHA-256 and AuthService with PBKDF2/JWT) causing inconsistent user representation. A proper User model is needed to serve as the source of truth for credentials, with a secure password hash field using PBKDF2 (consistent with existing AuthService).

## Acceptance Criteria
- User model/collection defined in `src/collections/`
- Password hash field stored securely (PBKDF2), never in plaintext
- Email field for login identity
- Consistent role field aligned with RbacRole ('admin'|'editor'|'viewer')
- Payload hook for password hashing on create/update
- User can be retrieved by email for login flow

## Test Strategy
- Unit test: verify password hash is generated on user create
- Unit test: verify same password produces different hash (salted)
- Integration test: create user via Payload, retrieve and verify hash exists


---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2656-260418-100644`

