# Add User collection with passwordHash field to Payload CMS

## Context
The codebase has dual auth systems: `UserStore` (SHA-256, in-memory) and `AuthService` (PBKDF2, JWT). The project domain model defines a `User` entity with roles (admin/editor/viewer/guest/student/instructor) but no Payload CMS collection exists for it. This task creates the canonical `User` collection with a `passwordHash` field, replacing the in-memory `UserStore` and aligning with the existing `AuthService` JWT flow.

## Acceptance Criteria
- Payload CMS `User` collection created in `src/collections/` with fields: `email` (unique), `passwordHash`, `role` (admin/editor/viewer/guest/student/instructor)
- Collection uses the existing Drizzle ORM adapter for PostgreSQL persistence
- Access control: only admin can create/delete users; users can update their own password
- Hooks: `beforeChange` hashes password using PBKDF2 (matching `AuthService` approach), `afterRead` strips `passwordHash` from API responses
- `src/collections/index.ts` exports the new `User` collection

## Test Strategy
- Unit test: password hashing hook produces non-empty hash different from plaintext
- Unit test: `afterRead` hook strips `passwordHash` from response object
- Integration test: create user via Payload API, verify hash is stored and email is unique constraint enforced


---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2632-260418-095429`

