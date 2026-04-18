# Add password hash field to User model

## Context
The existing Payload Users collection (`src/collections/Users.ts`) has `auth: true` which provides built-in password hashing via Payload's internal mechanism. However, the codebase has dual auth systems: `UserStore` (SHA-256 in-memory) and `AuthService` (PBKDF2 + Payload). This task ensures the User model has an explicit, well-documented password hash field compatible with the JWT auth system.

## Acceptance Criteria
- User model includes explicit `hash` and `salt` fields for password storage
- Password hashing uses PBKDF2 (25000 iterations, sha256, 512 bits) matching Payload's `generatePasswordSaltHash` algorithm
- Field access is restricted: hash/salt readable only for auth operations, not via API
- The `role` field aligns with `RbacRole = 'admin' | 'editor' | 'viewer'` used by `AuthService`

## Test Strategy
- Unit test password hashing/verification with the configured algorithm
- Integration test creating a user and verifying the hash is stored correctly
- Verify existing tests in `src/collections/Users.test.ts` pass

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2495-260418-035349`

