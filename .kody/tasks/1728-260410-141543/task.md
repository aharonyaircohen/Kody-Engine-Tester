# Add User model with password hash field and hashing utility

## Context
The authentication system requires a User model to store user credentials. The model must store a password hash (not plaintext) and needs a utility to hash and verify passwords. This is the foundation for all subsequent auth tasks.

## Acceptance Criteria
- User model has `id`, `email`, `passwordHash`, and `createdAt` fields
- Password hashing utility exports `hashPassword(plaintext: string): Promise<string>` and `verifyPassword(plaintext: string, hash: string): Promise<boolean>`
- Uses bcrypt or equivalent for secure hashing with salt
- Unit tests cover: hashing produces different output each time, verification works correctly, verification fails on wrong password

## Test Strategy
- Unit tests for hashPassword and verifyPassword using the describe/it pattern
- Test edge cases: empty string, very long password, special characters

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1728-260410-141543` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24247322909))

To rerun: `@kody rerun 1728-260410-141543 --from <stage>`

