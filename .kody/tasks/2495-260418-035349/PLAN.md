# Plan: Add password hash field to User model

## Context

The `AuthService` (`src/auth/auth-service.ts`) already expects `hash` and `salt` fields on user documents (lines 96–106) to verify passwords using PBKDF2 (25000 iterations, sha256, 512 bits). However, the Payload `Users` collection (`src/collections/Users.ts`) does not define these fields — Payload's built-in `auth: true` manages its own internal hash, but that isn't exposed as a readable field. The `verifyPassword` call at line 108 always fails because `hash`/`salt` are `undefined`.

The task is to:
1. Add explicit `hash` and `salt` fields to `Users.ts`
2. Extract PBKDF2 hashing into a reusable `password-hash.ts` utility
3. Wire `AuthService` to use it
4. Add tests

---

## Step 1 — Add `hash` and `salt` fields to `src/collections/Users.ts`

Append two new field definitions to the `fields` array (after `permissions`):

```typescript
{
  name: 'hash',
  type: 'text',
  required: false,
  hidden: true,
  access: {
    read: () => false,
    create: () => false,
    update: () => false,
  },
},
{
  name: 'salt',
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

All three access levels (`read`, `create`, `update`) are locked to `false` so these fields are never accessible via the API — matching the pattern already used for `refreshToken`, `tokenExpiresAt`, and `lastTokenUsedAt`.

---

## Step 2 — Create `src/utils/password-hash.ts`

A new utility module exporting two functions:

```typescript
import crypto from 'crypto'

export const PBKDF2_ITERATIONS = 25000
export const PBKDF2_KEYLEN = 512      // bits → 64 bytes
export const PBKDF2_DIGEST = 'sha256'
export const SALT_BYTES = 32

/** Generate a cryptographically random salt (32 bytes, hex-encoded) */
export function generateSalt(): string {
  return crypto.randomBytes(SALT_BYTES).toString('hex')
}

/**
 * Hash a password with PBKDF2 — matches Payload's generatePasswordSaltHash algorithm.
 * 25000 iterations, sha256, 512 bits (64 bytes → hex string)
 */
export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST).toString('hex')
}

/**
 * Verify a password against a stored PBKDF2 hash.
 * Returns true if the password matches, false otherwise.
 */
export function verifyPasswordHash(password: string, hash: string, salt: string): boolean {
  const derived = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
  const stored = Buffer.from(hash, 'hex')
  if (derived.length !== stored.length) return false
  return crypto.timingSafeEqual(derived, stored)
}
```

> **Note**: Uses `pbkdf2Sync` (synchronous) for simplicity; since `AuthService` calls this in an async context, the existing async `verifyPassword` in `auth-service.ts` will be removed and replaced with the sync utility. The overall `login` method stays async.

---

## Step 3 — Update `src/auth/auth-service.ts`

1. Remove the inline `verifyPassword` function (lines 45–60)
2. Import `{ hashPassword, verifyPasswordHash, generateSalt }` from `password-hash.ts`
3. In `login`, replace the `verifyPassword` call with `verifyPasswordHash(password, hash, salt)` — this is a drop-in replacement since the function signature is compatible
4. Add an **`updatePassword(userId, password)`** method that generates a salt and stores the hash (needed for the registration flow to populate `hash`/`salt`):

```typescript
async updatePassword(userId: number | string, password: string): Promise<void> {
  const salt = generateSalt()
  const hash = hashPassword(password, salt)
  await this.payload.update({
    collection: 'users' as CollectionSlug,
    id: userId,
    data: { hash, salt } as any,
  })
}
```

---

## Step 4 — Add unit tests `src/utils/password-hash.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPasswordHash, generateSalt } from './password-hash'

describe('password-hash', () => {
  it('generateSalt returns a hex string of the correct length', () => {
    const salt = generateSalt()
    expect(typeof salt).toBe('string')
    expect(salt.length).toBe(64) // 32 bytes → 64 hex chars
  })

  it('generateSalt returns different values each call', () => {
    const a = generateSalt()
    const b = generateSalt()
    expect(a).not.toBe(b)
  })

  it('hashPassword returns a 128-char hex string', () => {
    const hash = hashPassword('MyPassword123!', 'testsalt')
    expect(typeof hash).toBe('string')
    expect(hash.length).toBe(128) // 64 bytes → 128 hex chars
  })

  it('same password + salt produces same hash', () => {
    const hash1 = hashPassword('MyPassword123!', 'testsalt')
    const hash2 = hashPassword('MyPassword123!', 'testsalt')
    expect(hash1).toBe(hash2)
  })

  it('different salts produce different hashes', () => {
    const hash1 = hashPassword('MyPassword123!', 'salt1')
    const hash2 = hashPassword('MyPassword123!', 'salt2')
    expect(hash1).not.toBe(hash2)
  })

  it('verifyPasswordHash returns true for correct password', () => {
    const salt = generateSalt()
    const hash = hashPassword('MyPassword123!', salt)
    expect(verifyPasswordHash('MyPassword123!', hash, salt)).toBe(true)
  })

  it('verifyPasswordHash returns false for wrong password', () => {
    const salt = generateSalt()
    const hash = hashPassword('MyPassword123!', salt)
    expect(verifyPasswordHash('WrongPassword', hash, salt)).toBe(false)
  })
})
```

---

## Step 5 — Update `src/collections/Users.test.ts`

Add a new `describe` block after the existing field tests to verify the new `hash` and `salt` fields:

```typescript
describe('Users fields - hash', () => {
  it('should have a hash text field', () => {
    const field = findField('hash') as any
    expect(field).toBeDefined()
    expect(field.type).toBe('text')
  })

  it('should have hash access read: false', () => {
    const field = findField('hash') as any
    expect(field.access?.read({ req: makeMockReq({ user: { id: 'u1', collection: 'users', role: 'admin' } }) })).toBe(false)
  })

  it('should have hash access create: false', () => {
    const field = findField('hash') as any
    expect(field.access?.create({ req: makeMockReq({ user: { id: 'u1', collection: 'users', role: 'admin' } }) })).toBe(false)
  })
})

describe('Users fields - salt', () => {
  it('should have a salt text field', () => {
    const field = findField('salt') as any
    expect(field).toBeDefined()
    expect(field.type).toBe('text')
  })

  it('should have salt access read: false', () => {
    const field = findField('salt') as any
    expect(field.access?.read({ req: makeMockReq({ user: { id: 'u1', collection: 'users', role: 'admin' } }) })).toBe(false)
  })
})
```

---

## Step 6 — Run tests to verify

```bash
pnpm test:int 2>&1
```

Expected outcomes:
- All new `password-hash.test.ts` tests pass
- All `Users.test.ts` tests pass (including new hash/salt tests)
- All `auth-service.test.ts` tests pass (mock user already includes `hash`/`salt`)

```bash
pnpm tsc --noEmit
```

Expected: zero type errors.

---

## Files Modified

| File | Change |
|---|---|
| `src/collections/Users.ts` | Add `hash` and `salt` fields with locked access |
| `src/utils/password-hash.ts` | **New** — PBKDF2 hash/verify/generateSalt utilities |
| `src/utils/password-hash.test.ts` | **New** — unit tests for the utility |
| `src/auth/auth-service.ts` | Remove inline `verifyPassword`, import from utility, add `updatePassword` |
| `src/collections/Users.test.ts` | Add tests for new `hash`/`salt` fields |

## Files Intentionally Unchanged

- `src/auth/user-store.ts` — legacy in-memory store (separate concern)
- `src/auth/_auth.ts` — RBAC already correct (`admin|editor|viewer`)
- `src/auth/auth-service.test.ts` — mock already provides `hash`/`salt`; no changes needed
