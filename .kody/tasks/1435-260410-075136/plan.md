Now I have a clear picture. Let me write the plan.

## Pattern Discovery Report

- **Payload collection pattern** (`src/collections/Users.ts`): Collection config with fields array, access controls, hooks. No `passwordHash` field exists yet.
- **Migration pattern** (`src/migrations/20260405_000000_add_users_permissions_lastLogin.ts`): Uses `sql` template tag with `ALTER TABLE ADD COLUMN` for adding columns to existing tables.
- **Utility test pattern** (`src/utils/*.test.ts`): Co-located tests, `vi.fn()` mocks, describe blocks per function/feature.
- **Collection test pattern** (`src/collections/Users.test.ts`): `findField()` helper, `makeMockReq()` helper, describe blocks per field.

No bcrypt or argon2 currently in dependencies. Will use `bcryptjs` (pure JS, no native bindings needed).

---

## Plan

### Step 1: Add bcryptjs dependency
**File:** `package.json`
**Change:** Add `"bcryptjs": "^2.4.3"` to dependencies
**Why:** bcryptjs is a pure JS implementation — no native bindings, works across all Node versions and deployment targets.
**Verify:** `grep bcryptjs package.json`

### Step 2: Create password hashing utility
**File:** `src/utils/password-hash.ts`
**Change:** Create utility with `hashPassword(password: string): Promise<{ hash: string; salt: string }>` and `verifyPassword(password: string, hash: string, salt: string): Promise<boolean>`
**Why:** Reusable utility following existing single-function file pattern in `src/utils/`.
**Verify:** File created, exports correct types.

### Step 3: Add `passwordHash` field to Users collection
**File:** `src/collections/Users.ts`
**Change:** Add `passwordHash` field to the fields array (type: `text`, required: false, hidden: true, access: `{ read: () => false, update: () => false }`)
**Why:** Password hash is stored but never exposed in API responses. Field is hidden in admin UI.
**Verify:** `pnpm test:int src/collections/Users.test.ts` passes.

### Step 4: Create migration for `passwordHash` column
**File:** `src/migrations/20260410_000000_add_users_password_hash.ts`
**Change:** `ALTER TABLE "users" ADD COLUMN "password_hash" text`
**Why:** Database migration follows existing pattern from `20260405_000000_add_users_permissions_lastLogin.ts`.
**Verify:** Migration file runs without error.

### Step 5: Write unit tests for password hashing utility
**File:** `src/utils/password-hash.test.ts`
**Change:** Tests for `hashPassword` (deterministic? unique salts?) and `verifyPassword` (correct password returns true, wrong returns false, empty password handled)
**Why:** TDD — tests written before implementation per task requirements.
**Verify:** `pnpm test:int src/utils/password-hash.test.ts` passes.

### Step 6: Add model validation tests for email/password
**File:** `src/collections/Users.test.ts`
**Change:** Add test for `passwordHash` field existence and type, add email format validation test, add password length validation test.
**Why:** Task test strategy requires model validation tests.
**Verify:** `pnpm test:int src/collections/Users.test.ts` passes.

---

## Questions

1. **Bcrypt vs PBKDF2**: The existing `auth-service.ts` uses PBKDF2 from Node crypto (25000 iterations). Should `passwordHash` use the same algorithm for consistency, or is bcrypt preferred as specified in the task?
   - Recommendation: Use bcrypt as the task specifies — it's purpose-built for password hashing with automatic salt generation and cost factor tuning, while PBKDF2 is a key derivation function not specifically designed for password storage.

2. **Field naming**: Payload snake_cases DB columns (`password_hash`) but the task asks for `passwordHash` (camelCase). Should the field be named `passwordHash` (TypeScript/Payload config) with DB column `password_hash`, or just `passwordHash` throughout?
   - Recommendation: `passwordHash` in Payload config maps to `password_hash` DB column — Payload handles the mapping automatically.
