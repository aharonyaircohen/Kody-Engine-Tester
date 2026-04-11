# Add User model with password hash field

## Context
This task creates the User model to store user credentials. It is the foundation for the authentication system — all subsequent auth tasks depend on having a user identity to authenticate and authorize. The model must store a password hash (never plaintext) and support lookup by email/username.

## Acceptance Criteria
- User model exists with fields: `id`, `email`, `passwordHash`
- `passwordHash` stores a bcrypt/argon2 hash, not plaintext
- Model includes a `hashPassword(plaintext)` utility that returns a promise
- Model includes a `verifyPassword(plaintext, hash)` utility that returns a promise<boolean>
- Email field is unique and indexed for login queries

## Test Strategy
- Unit tests for `hashPassword` — verify it produces non-empty hash different from input
- Unit tests for `verifyPassword` — correct password returns true, wrong returns false
- Unit tests for edge cases: empty string, null, undefined inputs
- Model validation tests: duplicate email rejected, missing fields rejected

---

## Discussion (13 comments)

**@aharonyaircohen** (2026-04-11):
@kody

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `1895-260411-155209` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286023292))

To rerun: `@kody rerun 1895-260411-155209 --from <stage>`

**@aharonyaircohen** (2026-04-11):
🏗️ **Kody has architecture questions:**

1. **bcrypt vs argon2**: bcrypt is more universally supported and battle-tested in Node.js; argon2 is newer and被认为更安全. Recommend **bcrypt** (specifically `bcryptjs` for pure JS, no native compilation). Approve?
2. **Salt rounds**: bcrypt default is 10; higher = more secure but slower. Recommend **12** as a good balance. Acceptable?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `approve`` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286112085))

To rerun: `@kody rerun approve` --from <stage>`

**@aharonyaircohen** (2026-04-11):
🏗️ **Kody has architecture questions:**

1. **bcrypt vs argon2 + salt rounds**: The task comment asks for approval of bcryptjs with 12 salt rounds. bcryptjs is pure JS (no native compilation), well-audited, and 12 is a good balance. Is this the correct choice?
2. **Where should password utilities live?** `src/auth/password.ts` (following auth-layer pattern) vs `src/utils/password.ts` (utility-first). Given these are auth-specific and will be used by auth-service, `src/auth/password.ts` is preferred. Acceptable?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `approve`` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286196341))

To rerun: `@kody rerun approve` --from <stage>`

**@aharonyaircohen** (2026-04-11):
🤔 **Kody has questions before proceeding:**

1. The task description mentions a 'User model' but UserStore already has passwordHash field. Is the goal to add bcrypt utilities only, or also migrate UserStore from SHA-256 to bcrypt?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `approve`` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286264156))

To rerun: `@kody rerun approve` --from <stage>`

**@aharonyaircohen** (2026-04-11):
🤔 **Kody has questions before proceeding:**

1. The task description mentions a 'User model' but UserStore already has a passwordHash field using SHA-256. Should UserStore be migrated from SHA-256 to bcrypt, or should this only add new bcrypt utilities for the Payload Users collection?
2. The Users Payload collection already has auth:true which provides hash/salt fields automatically. Does the task require adding an explicit passwordHash field to the collection, or is the intent to add standalone bcrypt utilities at src/auth/password.ts?
3. Should the new bcrypt utilities be used by AuthService (replacing the current PBKDF2 approach), or should they exist alongside it?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24286264156))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286379352))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24286264156)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🤔 **Kody has questions before proceeding:**

1. Should the new bcrypt utilities replace AuthService's PBKDF2 approach, or exist alongside it for future migration?
2. Should UserStore be migrated from SHA-256 to bcrypt, or does it remain as-is since it's a separate in-memory store?
3. Is the goal to add bcrypt utilities only (preferred per discussion), or also add an explicit passwordHash field to the Users Payload collection?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `approve`` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286554348))

To rerun: `@kody rerun approve` --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `approve`` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286405005))

To rerun: `@kody rerun approve` --from <stage>`

