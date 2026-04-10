## Pattern Discovery Report

- **Domain model pattern**: `src/models/notification.ts` - TypeScript interface with `id`, `email`, `createdAt` fields — reused for User model structure
- **Password hashing reference**: `src/auth/auth-service.ts` uses PBKDF2 (25000 iterations, sha256, 512 bits) — qualifies as "bcrypt or equivalent"
- **Test colocation**: `src/utils/*.test.ts` pattern — vitest describe/it, co-located with source
- **bcrypt unavailable**: Not in `package.json`; using PBKDF2 with embedded salt (salt:hash format) as equivalent

---

## Plan

### Step 1: Create User model

**File:** `src/models/user.ts`
**Change:** Create TypeScript interface with `id`, `email`, `passwordHash`, `createdAt` fields

```typescript
export interface User {
  id: string
  email: string
  passwordHash: string
  createdAt: Date
}
```

**Why:** Domain model following existing pattern in `src/models/notification.ts`

**Verify:** `pnpm lint src/models/user.ts`

---

### Step 2: Create password utility with hash/verify functions

**File:** `src/utils/password.ts`
**Change:** Create `hashPassword` and `verifyPassword` using PBKDF2 (25000 iterations, sha256, 128-bit salt), embedding salt in output as `salt:hash` hex string

```typescript
import crypto from 'crypto'

const ITERATIONS = 25000
const KEY_LENGTH = 512
const DIGEST = 'sha256'
const SALT_LENGTH = 32

export async function hashPassword(plaintext: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex')
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(plaintext, salt, ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) {
        reject(err)
        return
      }
      resolve(`${salt}:${derivedKey.toString('hex')}`)
    })
  })
}

export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  const idx = hash.indexOf(':')
  if (idx === -1) return false
  const salt = hash.slice(0, idx)
  const storedKey = hash.slice(idx + 1)
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(plaintext, salt, ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) {
        reject(err)
        return
      }
      const derivedHex = derivedKey.toString('hex')
      resolve(crypto.timingSafeEqual(Buffer.from(derivedHex), Buffer.from(storedKey)))
    })
  })
}
```

**Why:** PBKDF2 with 25000 iterations matches `auth-service.ts` algorithm; embedded salt format (salt:hash) matches bcrypt pattern; timing-safe comparison prevents timing attacks

**Verify:** `pnpm lint src/utils/password.ts`

---

### Step 3: Create unit tests for password utility

**File:** `src/utils/password.test.ts`
**Change:** Test `hashPassword` and `verifyPassword` with edge cases

```typescript
import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from './password'

describe('password utility', () => {
  describe('hashPassword', () => {
    it('produces different output each time', async () => {
      const hash1 = await hashPassword('password123')
      const hash2 = await hashPassword('password123')
      expect(hash1).not.toBe(hash2)
    })

    it('contains salt:hash format', async () => {
      const hash = await hashPassword('password123')
      const idx = hash.indexOf(':')
      expect(idx).toBeGreaterThan(0)
      const salt = hash.slice(0, idx)
      expect(salt.length).toBe(64) // 32 bytes hex = 64 chars
    })
  })

  describe('verifyPassword', () => {
    it('returns true for correct password', async () => {
      const hash = await hashPassword('CorrectPass1!')
      const result = await verifyPassword('CorrectPass1!', hash)
      expect(result).toBe(true)
    })

    it('returns false for wrong password', async () => {
      const hash = await hashPassword('CorrectPass1!')
      const result = await verifyPassword('WrongPass1!', hash)
      expect(result).toBe(false)
    })

    it('handles empty string', async () => {
      const hash = await hashPassword('')
      expect(await verifyPassword('', hash)).toBe(true)
      expect(await verifyPassword('something', hash)).toBe(false)
    })

    it('handles very long password', async () => {
      const longPass = 'a'.repeat(1000)
      const hash = await hashPassword(longPass)
      expect(await verifyPassword(longPass, hash)).toBe(true)
    })

    it('handles special characters', async () => {
      const special = 'p@$$w0rd!#$%^&*()_+-=[]{}|;:\'",.<>?/`~'
      const hash = await hashPassword(special)
      expect(await verifyPassword(special, hash)).toBe(true)
    })

    it('returns false for malformed hash', async () => {
      expect(await verifyPassword('pass', 'no-colon-here')).toBe(false)
    })
  })
})
```

**Why:** Follows existing test patterns in codebase; covers all acceptance criteria edge cases

**Verify:** `pnpm test:int src/utils/password.test.ts`

---

### Step 4: Run full test suite

**Command:** `pnpm test:int`
**Why:** Verify no regressions

---

## Questions

None — all decisions derivable from task requirements and existing patterns.
