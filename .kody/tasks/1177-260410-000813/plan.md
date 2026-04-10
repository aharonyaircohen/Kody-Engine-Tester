Now I have a comprehensive understanding. Let me create the plan.

## Existing Patterns Found

- **Payload collection config**: `src/collections/Users.ts` has `auth: true`, field-level access controls with `hidden: true` and `access: { read: () => false }`, and uses hooks for computed fields
- **Password hashing utility pattern**: `src/auth/user-store.ts` has `hashPassword`/`verifyPassword` methods, but uses SHA-256 (noted as anti-pattern)
- **Auth service dependency injection**: `src/auth/auth-service.ts` uses `Payload` and `JwtService` as constructor dependencies
- **Utility file pattern**: `src/utils/debounce.ts` + `debounce.test.ts` - single responsibility, co-located tests with vi.fn() mocks

## Plan

### Step 1: Install bcrypt package

**File:** `package.json`
**Change:** Add `bcrypt` dependency (recommended over argon2 for widespread adoption and simpler API)
**Why:** No bcrypt/argon2 currently installed; bcrypt is industry-standard for password hashing
**Verify:** `pnpm install` and check `node_modules/bcrypt` exists

---

### Step 2: Create password hashing utility

**File:** `src/utils/password-hash.ts`
**Change:** Create new utility with `hashPassword(password: string): Promise<string>` and `verifyPassword(password: string, hash: string): Promise<boolean>`
**Why:** Reusable utility following existing single-responsibility pattern in `src/utils/`
**Verify:** `pnpm test:int src/utils/password-hash.test.ts`

---

### Step 3: Write unit tests for password hashing utility

**File:** `src/utils/password-hash.test.ts`
**Change:** Test `hashPassword` generates non-empty hash, `verifyPassword` correctly validates, edge cases (empty string, very long password)
**Why:** TDD - tests before implementation; follows existing `*.test.ts` co-location pattern
**Verify:** Tests fail initially (red), pass after Step 4 (green)

---

### Step 4: Implement password hashing utility

**File:** `src/utils/password-hash.ts`
**Change:** Implement using bcrypt with salt rounds 12, timing-safe comparison for verify
**Why:** bcrypt with 12 rounds is industry standard; timing-safe comparison prevents timing attacks
**Verify:** `pnpm test:int src/utils/password-hash.test.ts` passes

---

### Step 5: Add passwordHash field to Users collection

**File:** `src/collections/Users.ts`
**Change:** Add `passwordHash` field after existing fields:
```typescript
{
  name: 'passwordHash',
  type: 'text',
  required: false,
  hidden: true,
  access: {
    read: () => false,
    create: () => false,
    update: () => false,
  },
},
```
**Why:** Field-level access controls prevent exposure in API responses; matches existing hidden field pattern (refreshToken, tokenExpiresAt)
**Verify:** `pnpm test:int src/collections/Users.test.ts` passes

---

### Step 6: Add email uniqueness validation

**File:** `src/collections/Users.ts`
**Change:** Payload's built-in `auth: true` already provides email uniqueness. Add explicit `unique: true` to email field if not already set by auth
**Why:** Task requires email unique and validated; Payload's auth provides this automatically
**Verify:** `pnpm test:int src/collections/Users.test.ts` passes

---

### Step 7: Update Users collection tests

**File:** `src/collections/Users.test.ts`
**Change:** Add tests for `passwordHash` field existence and access controls, email field has uniqueness
**Why:** TDD - tests for new functionality
**Verify:** `pnpm test:int src/collections/Users.test.ts` passes

---

### Step 8: Run full test suite

**Change:** Run `pnpm test:int` to verify all tests pass
**Verify:** Full integration test suite passes

---

## Questions

- **Algorithm choice**: Recommend bcrypt with 12 salt rounds over argon2 — more widely adopted, simpler API, sufficient for most use cases. Agree with bcrypt?
- **Coexistence vs replacement**: The plan assumes `passwordHash` coexists alongside Payload's built-in auth hash (not replacing it). This adds a new field for future JWT auth flows while keeping Payload's built-in auth working. Confirm this approach?
- **Password length validation**: No explicit max length specified in task. Recommend 128 characters as reasonable limit (bcrypt truncates at 72 bytes anyway). Set max length, or leave unbounded?
