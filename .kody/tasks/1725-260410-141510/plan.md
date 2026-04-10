## Existing Patterns Found

- `src/collections/Users.ts`: Payload CMS CollectionConfig with `auth: true`, field-level `access` controls with `read: () => false`, and `beforeChange` hooks for derived fields (displayName)
- `src/auth/user-store.ts`: Uses `hashPassword` / `verifyPassword` pattern — but SHA-256, task requires bcrypt
- `src/collections/Users.test.ts`: Unit tests for field structure, access control, and hooks using `findField` helper
- `src/utils/*.test.ts`: Co-located test files, `vi.fn()` for mocks
- No bcrypt usage currently in codebase — must be added as new dependency

---

## Step 1: Add bcrypt dependency

**File:** `package.json`
**Change:** Add `"bcryptjs": "^2.4.3"` to `dependencies` and `"@types/bcryptjs": "^2.4.6"` to `devDependencies`
**Why:** Task requires bcrypt with cost factor 12 for `passwordHash` field
**Verify:** `pnpm install` completes without error

---

## Step 2: Create password hashing utility

**File:** `src/utils/password.ts`
**Change:** Create new file with:
```typescript
import bcrypt from 'bcryptjs'

const BCRYPT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
```
**Why:** Reusable bcrypt utility following the same pattern as `user-store.ts` but with bcrypt; hook-friendly async functions
**Verify:** `pnpm vitest run src/utils/password.test.ts` (will fail until Step 4)

---

## Step 3: Create co-located unit tests for password utility

**File:** `src/utils/password.test.ts`
**Change:** Create new test file:
```typescript
import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from './password'

describe('password utilities', () => {
  describe('hashPassword', () => {
    it('should produce a bcrypt hash with cost factor 12', async () => {
      const hash = await hashPassword('TestPassword123!')
      expect(hash).toMatch(/^\$2[aby]?\$\d{1,2}\$/)
      expect(hash).not.toBe('TestPassword123!')
    })

    it('should produce different hashes for same password (salt)', async () => {
      const hash1 = await hashPassword('SamePassword')
      const hash2 = await hashPassword('SamePassword')
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const hash = await hashPassword('CorrectPassword123!')
      const result = await verifyPassword('CorrectPassword123!', hash)
      expect(result).toBe(true)
    })

    it('should return false for incorrect password', async () => {
      const hash = await hashPassword('CorrectPassword123!')
      const result = await verifyPassword('WrongPassword', hash)
      expect(result).toBe(false)
    })
  })
})
```
**Why:** TDD — tests must exist before implementation; validates bcrypt cost factor 12 and correct/incorrect comparison
**Verify:** `pnpm vitest run src/utils/password.test.ts`

---

## Step 4: Add passwordHash field to Users collection

**File:** `src/collections/Users.ts`
**Change:** Add to `fields` array (after `refreshToken` field):
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
      hooks: {
        beforeChange: [
          async ({ data }) => {
            if (data.password) {
              return hashPassword(data.password)
            }
            return data.passwordHash
          },
        ],
      },
    },
    {
      name: 'password',
      type: 'text',
      required: false,
      hidden: true,
      access: {
        read: () => false,
        create: () => true,
        update: () => false,
      },
    },
```
**Why:** 
- `access.read: () => false` makes it write-only (never returned in API responses)
- `access.create: () => true` allows setting password on user creation
- `beforeChange` hook hashes password using bcrypt cost factor 12
- Separate `password` field for cleartext input (write-only), `passwordHash` stores the bcrypt hash
- `hidden: true` keeps it out of the admin UI
**Verify:** `pnpm vitest run src/collections/Users.test.ts`

---

## Step 5: Add unit tests for passwordHash field to Users.test.ts

**File:** `src/collections/Users.test.ts`
**Change:** Add new `describe` blocks for `passwordHash` field:
```typescript
import { hashPassword, verifyPassword } from '@/utils/password'

describe('Users fields - passwordHash', () => {
  it('should have a passwordHash field that is hidden and read-disabled', () => {
    const field = findField('passwordHash') as any
    expect(field).toBeDefined()
    expect(field.hidden).toBe(true)
    expect(field.access?.read()).toBe(false)
    expect(field.access?.create()).toBe(false)
    expect(field.access?.update()).toBe(false)
  })

  it('should have a password field for cleartext input that is write-only', () => {
    const field = findField('password') as any
    expect(field).toBeDefined()
    expect(field.hidden).toBe(true)
    expect(field.access?.read()).toBe(false)
    expect(field.access?.create()).toBe(true)
    expect(field.access?.update()).toBe(false)
  })

  it('should have a beforeChange hook on passwordHash that hashes the password', async () => {
    const field = findField('passwordHash') as any
    const hook = field.hooks.beforeChange[0]
    const hash = await hook({ data: { password: 'MySecret123!' } })
    expect(hash).not.toBe('MySecret123!')
    const valid = await verifyPassword('MySecret123!', hash)
    expect(valid).toBe(true)
  })

  it('should preserve passwordHash when password is not provided', async () => {
    const field = findField('passwordHash') as any
    const hook = field.hooks.beforeChange[0]
    const existing = await hashPassword('PreservedPassword123!')
    const result = await hook({ data: { passwordHash: existing } })
    expect(result).toBe(existing)
  })
})
```
**Why:** Validates the field exists with correct access settings and the beforeChange hook correctly hashes passwords
**Verify:** `pnpm vitest run src/collections/Users.test.ts`

---

## Step 6: Run full integration test suite

**Change:** Run `pnpm test:int` to ensure all tests pass
**Why:** Confirms no regressions from adding bcrypt dependency and new fields
**Verify:** `pnpm test:int` passes

---

## Questions

None — the task is clear and existing patterns provide sufficient guidance.
