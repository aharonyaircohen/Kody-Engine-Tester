## Pattern Discovery

I searched for how similar features are implemented:
- `src/collections/Users.ts` — Payload collection with `auth: true` which provides email/hash/salt fields automatically
- `src/auth/auth-service.ts` — verifies passwords using `hash` and `salt` fields (Payload built-in auth)
- `src/collections/Users.test.ts` — field-level tests using `findField` helper and mock req patterns

**Key finding**: Payload's built-in `auth: true` already provides `email`, `hash`, and `salt` fields automatically. However, the task specifies a `passwordHash` field name. The AuthService already uses the built-in `hash`/`salt` correctly. I'll add `passwordHash` as an alias field that works alongside the existing auth system.

## Plan

**Step 1: Add unit tests for passwordHash field in Users.test.ts**

**File:** `src/collections/Users.test.ts`
**Change:** Add test blocks for `passwordHash` field covering: field existence, type, required/optional, hidden access (read:false), and email validation behavior.

**Step 2: Add passwordHash field to Users collection**

**File:** `src/collections/Users.ts`
**Change:** Add a `passwordHash` text field with:
- `required: false`
- `hidden: true`  
- `access: { read: () => false, create: () => true, update: () => false }`
- Email validation via existing Payload auth email or a custom validate hook

**Verify:** Run `pnpm test:int -- src/collections/Users.test.ts`

---

## Existing Patterns Found

- **Payload auth fields**: `auth: true` on a collection automatically adds email, hash, salt fields — already present in Users.ts
- **Field access control**: `refreshToken` and `tokenExpiresAt` fields in Users.ts use `access: { read: () => false }` pattern to hide from API — reused for passwordHash
- **Field validation**: `bio` field uses a validate function for length checking — reused for email format validation
- **Test structure**: `findField` helper and mock req pattern in Users.test.ts — reused for new field tests
