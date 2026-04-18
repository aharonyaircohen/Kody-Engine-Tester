# Add password hash field to User collection

## Context
The existing User collection in Payload CMS lacks a password hash field. This task adds the field needed to store hashed passwords for JWT-based authentication.

## Acceptance Criteria
- User Payload collection has a `passwordHash` field (text, not stored plaintext)
- Password hashing uses PBKDF2 (aligning with existing AuthService pattern)
- Field is excluded from API responses (not exposed in reads)

## Test Strategy
- Unit test: verify password hash is generated and not equal to plaintext
- Integration test: create a user and verify passwordHash is stored (not returned in read)

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2788-260418-164733`

