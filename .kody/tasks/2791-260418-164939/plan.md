Now I have a complete picture. Here's my plan:

---

## Pattern Discovery Report

- **Existing field access control pattern**: `refreshToken`, `tokenExpiresAt`, `lastTokenUsedAt` fields in `Users.ts` use `{ hidden: true, access: { read: () => false, update: () => false } }` — I will mirror this exactly for `hash` and `salt`.
- **Hook pattern for field population**: `displayName` field uses `beforeChange` hook to auto-populate on write — same pattern applies for `hash`/`salt` population.
- **PBKDF2 params (already in `auth-service.ts`)**: `25000 iterations, sha256, 512 bits` — will extract to a shared utility to avoid duplication between the hook and `verifyPassword`.
- **`Users.test.ts` co-located tests**: Follow the existing `findField()` helper + `makeMockReq()` pattern.
- **`auth-service.test.ts` already mocks `hash`/`salt`**: No changes needed to existing auth tests.

---

## Plan

### Step 1: Write test for Users collection `hash` and `salt` fields

**File:** `src/collections/Users.test.ts`
**Change:** Add a new `describe('Users fields - hash / salt')` block to the existing test file with tests for both fields' existence, type, and access controls.

**Why:** TDD — tests come before implementation.
**Verify:** `pnpm test:int -- src/collections/Users.test.ts` (should fail until fields are added)

---

### Step 2: Write unit test for the password hashing hook utility

**File:** `src/auth/auth-service.test.ts`
**Change:** Add a new `describe('hashPassword')` block testing that the exported `hashPassword` function returns `{ hash, salt }` and that `verifyPassword(password, hash, salt)` returns `true`.

**Why:** TDD — the exported utility must be tested before wiring it into the hook.
**Verify:** `pnpm test:int -- src/auth/auth-service.test.ts` (should fail until `hashPassword` is exported)

---

### Step 3: Extract `hashPassword` and `generateSalt` into `src/auth/password-utils.ts`

**File:** `src/auth/password-utils.ts`
**Change:** Create new file exporting `generateSalt()` (wraps `crypto.randomBytes(16)`) and `hashPassword(password)` (calls PBKDF2 with the same params as `verifyPassword`, returns `{ hash: hex, salt: hex }`). Re-export them from `src/auth/auth-service.ts` for backward compat.

**Why:** The collection hook needs PBKDF2 hashing without pulling in the full `AuthService`; extracting to a dedicated module keeps the hook clean and the hashing logic in one place.
**Verify:** `pnpm lint` passes

---

### Step 4: Add `hash` and `salt` fields to `Users` collection

**File:** `src/collections/Users.ts`
**Change:** Add two `text` fields inside the `fields` array, after the existing token fields, mirroring the `hidden + access.read=false + access.update=admin-only` pattern used by `refreshToken`:

```typescript
{
  name: 'hash',
  type: 'text',
  required: false,
  hidden: true,
  admin: { readOnly: true },
  access: {
    read: () => false,
    create: () => false,
    update: ({ req: { user } }) => (user as { role?: string } | null)?.role === 'admin',
  },
},
{
  name: 'salt',
  type: 'text',
  required: false,
  hidden: true,
  admin: { readOnly: true },
  access: {
    read: () => false,
    create: () => false,
    update: ({ req: { user } }) => (user as { role?: string } | null)?.role === 'admin',
  },
},
```

**Why:** `read: false` hides from all API responses. `create: false` + `update: admin-only` prevents clients from writing raw hashes; only the hook populates them on write.
**Verify:** `pnpm test:int -- src/collections/Users.test.ts`

---

### Step 5: Wire `hashPassword` into a `beforeChange` collection hook

**File:** `src/collections/Users.ts`
**Change:** Add a `hooks.beforeChange` array at the collection level (or on the `password` field) that calls `hashPassword(data.password as string)` and assigns the result to `data.hash` and `data.salt`. The hook should only run on `create` operations (or also on `update` when the password changes).

```typescript
hooks: {
  beforeChange: [
    async ({ data, operation }) => {
      if (data.password && (operation === 'create' || data._passwordChanged)) {
        const { hash, salt } = await hashPassword(data.password)
        data.hash = hash
        data.salt = salt
      }
      return data
    },
  ],
},
```

**Why:** This is the Payload-native hook mechanism — the hook fires server-side on every write, so `hash`/`salt` are always populated before any client code sees the document. Making it run only on `create` (initial registration) avoids unnecessary re-hashing on every profile update.
**Verify:** `pnpm test:int -- src/api/auth/register.test.ts` (integration test passes)

---

### Step 6: Update `AuthService` to use the exported `hashPassword` for consistency

**File:** `src/auth/auth-service.ts`
**Change:** Import `hashPassword` from `password-utils.ts` (already used in `register` path). No functional change needed since `verifyPassword` already handles verification against the stored fields. The import makes it explicit that hashing originates from the shared utility.

**Why:** Keeps all PBKDF2 logic in one place. No behavioral change to `AuthService.login()` since it already reads `hash`/`salt` from the fetched user doc.
**Verify:** `pnpm test:int -- src/auth/auth-service.test.ts`

---

### Step 7: Run full integration test suite

**File:** `vitest.config.mts`
**Change:** None — just run `pnpm test:int`.

**Verify:** `pnpm test:int` passes with 0 failures.

---

## Questions

No significant architecture decisions needed — the approach directly follows existing patterns for hidden fields (`refreshToken`) and field-level hooks (`displayName`). The only minor tradeoff is whether to re-hash `salt` on every password change (`operation === 'create'`) or only on explicit password updates — I recommend `operation === 'create'` only to avoid re-hashing on unrelated profile updates, accepting that admin-initiated password resets would need a separate admin endpoint to trigger re-hashing.