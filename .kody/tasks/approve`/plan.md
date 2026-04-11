## Existing Patterns Found

- `src/models/notification.ts` — domain model using TypeScript interface, kebab-case filename, exported types
- `src/auth/auth-service.ts:45-60` — password verification using `crypto.pbkdf2` (25000 iterations, SHA-256)
- `src/auth/user-store.ts:53-58` — `hashPassword` using `crypto.subtle.digest` (SHA-256)
- Test colocation pattern: `*.test.ts` alongside source files in same directory

## Plan

### Step 1: Add bcrypt dependency

**File:** `package.json`
**Change:** Add `bcrypt` to `dependencies` and `@types/bcrypt` to `devDependencies`
**Why:** Task requires bcrypt with cost factor >= 12; not currently in dependencies
**Verify:** `pnpm install` completes without error

```json
"dependencies": {
  "bcrypt": "^5.1.1"
},
"devDependencies": {
  "@types/bcrypt": "^5.0.2"
}
```

### Step 2: Write unit tests for user model

**File:** `src/models/user-model.test.ts`
**Change:** Create test file with:
- Test that `hashPassword` produces different output for same input (due to salt)
- Test that `verifyPassword` correctly compares hash against plaintext
- Test that `User` interface has correct field types
**Why:** TDD — tests before implementation
**Verify:** `pnpm test:int -- src/models/user-model.test.ts` (fails until step 3)

```typescript
import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from './user-model'

describe('hashPassword', () => {
  it('produces different output for same input due to salt', async () => {
    const password = 'TestPassword123!'
    const hash1 = await hashPassword(password)
    const hash2 = await hashPassword(password)
    expect(hash1).not.toBe(hash2)
  })

  it('produces a hash that can be verified', async () => {
    const password = 'TestPassword123!'
    const hash = await hashPassword(password)
    const isValid = await verifyPassword(password, hash)
    expect(isValid).toBe(true)
  })

  it('rejects wrong password', async () => {
    const password = 'TestPassword123!'
    const hash = await hashPassword(password)
    const isValid = await verifyPassword('WrongPassword!', hash)
    expect(isValid).toBe(false)
  })
})

describe('User interface', () => {
  it('has correct field types', () => {
    const user = {
      id: crypto.randomUUID(),
      email: 'test@example.com',
      passwordHash: await hashPassword('test'),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    expect(typeof user.id).toBe('string')
    expect(typeof user.email).toBe('string')
    expect(typeof user.passwordHash).toBe('string')
    expect(user.createdAt instanceof Date).toBe(true)
    expect(user.updatedAt instanceof Date).toBe(true)
  })
})
```

### Step 3: Implement user model

**File:** `src/models/user-model.ts`
**Change:** Create the model with:
- `User` interface with `id`, `email`, `passwordHash`, `createdAt`, `updatedAt`
- `hashPassword` function using bcrypt with cost factor 12
- `verifyPassword` function to compare plaintext against hash
- Unique email index (via Set for in-memory, noted for future Payload integration)
**Why:** Satisfies acceptance criteria: bcrypt cost >= 12, UUID id, unique indexed email, timestamps
**Verify:** `pnpm test:int -- src/models/user-model.test.ts` passes

```typescript
/**
 * User domain model with secure password hashing
 * @module models/user-model
 */
import bcrypt from 'bcrypt'

const BCRYPT_COST_FACTOR = 12

export interface User {
  id: string
  email: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST_FACTOR)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
```

### Step 4: Verify all tests pass

**Command:** `pnpm test:int -- src/models/`
**Why:** Confirm model and tests work together
**Verify:** All tests pass
