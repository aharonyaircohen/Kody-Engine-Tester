The plan is ready for your review at `/home/runner/.claude/plans/ancient-splashing-sloth.md`. Here's a summary of what it covers:

**4 steps, in order:**

1. **Unit tests for `hash-password`** (`src/utils/hash-password.test.ts`) — 7 tests covering hash generation, salting, and `verifyPassword` correctness vs wrong passwords vs malformed input.

2. **`hash-password` utility** (`src/utils/hash-password.ts`) — PBKDF2-SHA256 via Web Crypto API (310k iterations, 16-byte salt), exports `hashPassword` and `verifyPassword` returning `Result<T, HashError>`.

3. **User Payload collection** (`src/collections/User.ts`) — adds `email` (unique), `passwordHash` (admin-hidden), `role` (RbacRole-aligned select), a `beforeChange` hook that hashes `password` on create/update, and `findUserByEmail` for login flow.

4. **Integration tests for User collection** (`src/collections/User.test.ts`) — tests the hook's hash/set behaviour and `findUserByEmail` with mocked Payload SDK.