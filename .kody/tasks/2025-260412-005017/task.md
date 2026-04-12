# Add User model with password hash field

## Context
Adds the foundational User model needed for authentication. This model stores user credentials and must include a password hash field (never plain text) following security best practices.

## Acceptance Criteria
- User model in `src/models/User.ts`
- Fields: `id` (UUID), `email` (unique), `passwordHash`, `createdAt`, `updatedAt`
- Password is never stored in plain text — only the hash is persisted
- TypeScript strict mode enabled
- Model exports named export

## Test Strategy
- Unit test: model fields are correctly typed
- Unit test: password hash is generated and verified correctly
- Integration test: User can be created and retrieved from database

---

## Discussion (3 comments)

**@aharonyaircohen** (2026-04-11):
@kody

**@aharonyaircohen** (2026-04-12):
@kody full

**@aharonyaircohen** (2026-04-12):
🚀 Kody pipeline started: `2025-260412-005017` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24295283872))

