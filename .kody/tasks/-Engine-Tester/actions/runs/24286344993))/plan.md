## Existing Patterns Found

- `src/models/notification.ts`: TypeScript interface-only domain model with JSDoc module annotation
- `src/auth/user-store.ts:53-58`: Async password hashing pattern using crypto.subtle
- `src/utils/result.ts`: `Result<T, E>` discriminated union + `ok()`/`err()` factory functions
- `src/auth/auth-service.ts:45-60`: PBKDF2 password verification (existing Payload-compatible algorithm)
- Test colocation: `*.test.ts` alongside source files in same directory

---

## Plan

### Step 1: Install bcrypt dependency

**File:** `package.json`
**Change:** Add `"bcrypt": "^5.1.1"` to dependencies
**Why:** Task explicitly requires bcrypt with cost factor >= 12; no existing bcrypt usage in codebase
**Verify:** `pnpm install` completes without error

---

### Step 2: Create User model with bcrypt hashing utilities

**File:** `src/models/user-model.ts`
**Change:** Create new file with:
- `User` interface: id (string UUID), email (unique), passwordHash, createdAt (Date), updatedAt (Date)
- `CreateUserInput` type for creating users
- `PasswordHashingError` custom error class
- `hashPassword(plaintext: string): Promise<PasswordHash>` — bcrypt hash with cost factor 12, returns `{ hash, salt }`
- `verifyPassword(plaintext: string, hash: PasswordHash): Promise<boolean>` — bcrypt compare
- `BCRYPT_COST_FACTOR = 12` constant

```typescript
import bcrypt from 'bcrypt'

export interface User {
  id: string
  email: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserInput {
  email: string
  password: string
}

export interface PasswordHash {
  hash: string
  salt: string
}

export class PasswordHashingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PasswordHashingError'
  }
}

export const BCRYPT_COST_FACTOR = 12

export async function hashPassword(plaintext: string): Promise<PasswordHash> {
  const salt = await bcrypt.genSalt(BCRYPT_COST_FACTOR)
  const hash = await bcrypt.hash(plaintext, salt)
  return { hash, salt }
}

export async function verifyPassword(plaintext: string, passwordHash: PasswordHash): Promise<boolean> {
  return bcrypt.compare(plaintext, passwordHash.hash)
}
```

**Why:** Follows notification.ts pattern for TypeScript interface domain model; bcrypt.genSalt generates salt containing cost factor; verifyPassword uses bcrypt.compare
**Verify:** `pnpm lint src/models/user-model.ts` passes

---

### Step 3: Write unit tests for User model and hashing

**File:** `src/models/user-model.test.ts`
**Change:** Create test file with:
- `hashPassword` produces different outputs for same input (different salts)
- `verifyPassword` returns true for correct plaintext, false for incorrect
- `User` interface fields are correctly typed
- Model fields match acceptance criteria

```typescript
import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword, BCRYPT_COST_FACTOR } from './user-model'

describe('user-model', () => {
  describe('hashPassword', () => {
    it('produces different hash for same input due to salt', async () => {
      const password = 'TestPassword123!'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)
      expect(hash1.hash).not.toBe(hash2.hash)
      expect(hash1.salt).not.toBe(hash2.salt)
    })

    it('returns object with hash and salt properties', async () => {
      const result = await hashPassword('anypassword')
      expect(result).toHaveProperty('hash')
      expect(result).toHaveProperty('salt')
      expect(typeof result.hash).toBe('string')
      expect(typeof result.salt).toBe('string')
    })
  })

  describe('verifyPassword', () => {
    it('returns true for correct plaintext', async () => {
      const password = 'CorrectPassword123!'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)
      expect(isValid).toBe(true)
    })

    it('returns false for incorrect plaintext', async () => {
      const password = 'CorrectPassword123!'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword('WrongPassword123!', hash)
      expect(isValid).toBe(false)
    })
  })

  describe('BCRYPT_COST_FACTOR', () => {
    it('is at least 12', () => {
      expect(BCRYPT_COST_FACTOR).toBeGreaterThanOrEqual(12)
    })
  })
})
```

**Why:** TDD — tests verify hashing behavior before integration; different salt test ensures security property
**Verify:** `pnpm test:int src/models/user-model.test.ts` passes

---

### Step 4: Verify implementation

**File:** `src/models/user-model.ts`
**Change:** Verify all exports and types are correctly defined
**Why:** Ensure model matches acceptance criteria
**Verify:** `pnpm test:int src/models/user-model.test.ts` passes && `pnpm lint src/models/user-model.ts` passes

---

## Questions

None — all requirements are clear from task.json. bcrypt is explicitly required, placement in `src/models/` follows existing `notification.ts` pattern, and fields are fully specified.
