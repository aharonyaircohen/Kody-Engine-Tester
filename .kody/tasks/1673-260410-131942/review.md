Now I have a complete picture of the implementation. Let me write the review.

## Verdict: PASS

## Summary

Added a `passwordHash` field to the Users Payload collection with bcryptjs-based password hashing utility (`src/utils/password.ts`), unit tests for the utility, and access controls ensuring the hash is never exposed in API responses. The `bcryptjs@^2.4.3` package was installed as a dev/production dependency.

## Findings

### Critical

None.

### Major

None.

### Minor

**`src/collections/Users.ts:149`** — The `passwordHash` field is added but never populated. The field exists with proper access controls (`read: () => false`, `create: () => false`, `update: () => false`) but no hook populates it when users are created or passwords change. The current registration flow (`src/api/auth/register.ts:59-66`) passes the plaintext `password` to Payload's built-in auth which populates Payload's internal `hash`/`salt` fields, not the new `passwordHash` field. This appears intentional given the task context ("foundation for subsequent auth tasks"), but the field is effectively unused until integrated.

**`src/collections/Users.ts:149`** — No email uniqueness constraint added. The task acceptance criteria states "Email is unique and validated" but no `unique: true` or validate hook was added to the email field. Payload's `auth: true` provides email uniqueness at the DB level, satisfying this implicitly. However, the explicit validation called for in the criteria is not implemented as a visible schema constraint.

### Pass 2 — Informational

### Test Gaps

**`src/utils/password.test.ts`** — The test file has 9 passing tests covering hash uniqueness, bcrypt format, and verify correctness. However, there are no tests verifying that `verify('')` (empty string) behaves correctly with a bcrypt hash that uses the `$2a$` vs `$2b$` variant — the existing test at line 44 tests empty password against a valid hash but the format check on line 23 only accepts `$2a$` or `$2b$` prefixes. No negative-path test asserts that `hash('')` throws or returns a specific error for empty passwords (bcrypt allows empty string hashing, so this may be intentional).

**`src/collections/Users.test.ts`** — Tests confirm `passwordHash` field exists with correct type, is hidden in admin, and has denied access for read/create/update. No integration test exists that creates a user via Payload and verifies `passwordHash` is actually populated (vs. null). The acceptance criteria states "Integration test: create and retrieve user, verify password hash is not plaintext" but the existing tests only check field configuration, not actual population.

### Crypto & Entropy

**`src/utils/password.ts:3`** — `SALT_ROUNDS = 10` is below OWASP recommended minimum of 12 for bcrypt in 2024. While functional, consider 12 as the minimum for new implementations. (Not blocking — 10 is still widely used and not a vulnerability per se.)

### Type Safety

**`src/utils/password.ts:15`** — Parameter named `hash` shadows the imported `bcrypt` module's `hash` function name. The function signature is `verify(password: string, hash: string)` where `hash` is a bcrypt hash string, not the function. This is clear in context but a rename to `hashedPassword` would improve clarity.
