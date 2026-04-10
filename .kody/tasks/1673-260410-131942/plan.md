## Existing Patterns Found

- **Payload auth with built-in hash/salt**: `src/collections/Users.ts` uses `auth: true` which provides Payload's `hash` and `salt` fields automatically; `src/auth/auth-service.ts` reads `(user as any).hash` and `(user as any).salt` for PBKDF2 verification
- **Password hashing in UserStore**: `src/auth/user-store.ts` has `passwordHash` + `salt` fields with SHA-256 (deprecated pattern)
- **Test colocation**: Tests live alongside source as `*.test.ts` with `vi.fn()` mocks and `describe`/`it` blocks
- **Payload field access control**: Fields use `access: { read: () => false, update: () => false }` to hide from API responses

## Plan

**Step 1: Install bcrypt package**
- **File:** `package.json`
- **Change:** Add `"bcrypt": "^5.1.1"` to dependencies
- **Why:** Neither bcrypt nor argon2 is installed; bcrypt is more widely used with Payload and simpler to integrate
- **Verify:** `pnpm install` completes without error

---

**Step 2: Create password hashing utility**
- **File:** `src/utils/password.ts`
- **Change:** Create `hash(password: string): Promise<string>` and `verify(password: string, hash: string): Promise<boolean>` using bcrypt
- **Why:** Reusable utility following existing single-function module pattern in `src/utils/`
- **Verify:** `pnpm test:int src/utils/password.test.ts` passes

---

**Step 3: Create unit tests for password hashing utility**
- **File:** `src/utils/password.test.ts`
- **Change:** Test `hash` produces non-plaintext output, `verify` returns true for correct password and false for wrong password, hash is non-reversible
- **Why:** TDD — tests before implementation; follows `src/utils/*.test.ts` colocation pattern
- **Verify:** Test file exists and fails before implementation (red phase)

---

**Step 4: Add passwordHash field to Users collection**
- **File:** `src/collections/Users.ts`
- **Change:** Add `passwordHash` field (type: `text`, `hidden: true`, `access: { read: () => false, update: () => false }`) to prevent plaintext password from being returned in API responses
- **Why:** Payload's built-in `auth: true` provides `hash`/`salt`, but task requires explicit `passwordHash` field; access control ensures it's never exposed
- **Verify:** `pnpm test:int src/collections/Users.test.ts` passes

---

**Step 5: Add integration test for password hash not being plaintext**
- **File:** `src/collections/Users.test.ts`
- **Change:** Add test that creates a user and verifies `passwordHash` field is not equal to plaintext password
- **Why:** Task acceptance criteria: "Integration test: create and retrieve user, verify password hash is not plaintext"
- **Verify:** Test passes

---

**Step 6: Run full integration test suite**
- **File:** N/A
- **Change:** Run `pnpm test:int` to confirm all tests pass
- **Why:** Verify no regressions from changes
- **Verify:** All integration tests pass

## Questions

- **Recommended approach for hashing**: bcrypt is simpler to integrate (synchronous `bcrypt.hash`/`bcrypt.compare`) vs argon2 which requires `argon2` package with more complex options. Given neither is installed and bcrypt is the de facto standard for password hashing, recommend bcrypt.
- **Custom passwordHash vs Payload built-in hash**: Recommend adding `passwordHash` as a custom field (task requirement) alongside Payload's built-in `hash` field, rather than replacing Payload's built-in auth mechanism. This avoids breaking existing auth flows while satisfying the task requirement.
