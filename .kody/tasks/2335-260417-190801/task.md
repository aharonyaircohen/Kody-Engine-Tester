# Add User Payload collection with password hash field

## Context
The codebase has dual auth systems (UserStore with SHA-256 vs AuthService with PBKDF2/JWT) creating inconsistency. This task creates a proper User collection in Payload CMS that stores hashed passwords, replacing or unifying the existing user representation.

## Acceptance Criteria
- Create `src/collections/Users.ts` Payload collection
- Collection includes `email` (unique), `passwordHash` (field name `password` using Payload's built-in auth hash), and `role` fields
- Password field uses Payload's built-in hash field type (handles salting + hashing via PBKDF2)
- Auth hooks verify password on login attempts
- Collection indexed on `email` for fast lookups
- Migration script generated for `pnpm payload migrate`


## Test Strategy
- Unit: verify password hash field type is `auth` in Payload config
- Unit: verify collection has unique email index
- Integration: run `pnpm payload migrate` and verify migration succeeds
- Manual: create a user via Payload admin panel, verify password is hashed (not plaintext)

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-17):
@kody

**@aharonyaircohen** (2026-04-17):
🚀 Kody pipeline started: `2335-260417-190801`

