Now I have a complete picture of the auth system. Let me create the implementation plan.

## Existing Patterns Found

- **JWT pattern**: `src/auth/jwt-service.ts` - already handles token creation/verification with blacklist; new `jwt-auth-store.ts` should mirror this pattern
- **Payload auth**: `src/auth/auth-service.ts` - already stores refresh tokens in Payload users collection via `refreshToken`/`tokenExpiresAt` fields
- **Middleware chain**: `src/middleware/auth-middleware.ts` - Express-style factory pattern returning middleware function
- **Migration pattern**: `src/migrations/20260405_000000_add_users_permissions_lastLogin.ts` - Payload migration with `up`/`down` functions using `sql` template tag
- **Role hierarchy**: `src/auth/_auth.ts` - `ROLE_HIERARCHY` with `checkRole` function already exists
- **Test pattern**: `*.test.ts` co-located with source using `vi.fn()` mocks

---

## Step 1: Create `src/auth/jwt-auth-store.ts` (replaces session-store)

**File:** `src/auth/jwt-auth-store.ts`
**Change:** New file for persistent JWT token storage with blacklist and generation tracking
**Why:** Existing `session-store.ts` is session-based; new store manages JWT tokens with same functionality (generation tracking, rotation, revocation)
**Verify:** `pnpm test:int src/auth/jwt-auth-store.test.ts`

```typescript
import crypto from 'crypto'

export type RbacRole = 'admin' | 'editor' | 'viewer'

export interface StoredToken {
  userId: string
  token: string
  refreshToken: string
  expiresAt: Date
  refreshExpiresAt: Date
  generation: number
  createdAt: Date
}

const MAX_TOKENS_PER_USER = 5
const ACCESS_TOKEN_EXPIRY_MS = 15 * 60 * 1000
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000

export class JwtAuthStore {
  private tokens = new Map<string, StoredToken>()
  private tokenIndex = new Map<string, string>() // token -> id
  private refreshTokenIndex = new Map<string, string>() // refreshToken -> id

  create(userId: string, token: string, refreshToken: string): StoredToken {
    this.enforceMaxTokens(userId)

    const stored: StoredToken = {
      userId,
      token,
      refreshToken,
      expiresAt: new Date(Date.now() + ACCESS_TOKEN_EXPIRY_MS),
      refreshExpiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
      generation: 0,
      createdAt: new Date(),
    }

    this.tokens.set(stored.token, stored)
    this.tokenIndex.set(token, stored.token)
    this.refreshTokenIndex.set(refreshToken, stored.token)
    return stored
  }

  private enforceMaxTokens(userId: string): void {
    const userTokens = Array.from(this.tokens.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

    while (userTokens.length >= MAX_TOKENS_PER_USER) {
      const oldest = userTokens.shift()!
      this.revoke(oldest.token)
    }
  }

  findByToken(token: string): StoredToken | undefined {
    const id = this.tokenIndex.get(token)
    if (!id) return undefined
    const stored = this.tokens.get(id)
    if (!stored) return undefined
    if (stored.expiresAt <= new Date()) return undefined
    return stored
  }

  findByRefreshToken(refreshToken: string): StoredToken | undefined {
    const id = this.refreshTokenIndex.get(refreshToken)
    if (!id) return undefined
    const stored = this.tokens.get(id)
    if (!stored) return undefined
    if (stored.refreshExpiresAt <= new Date()) return undefined
    return stored
  }

  refresh(token: string, newToken: string, newRefreshToken: string): StoredToken | undefined {
    const stored = this.tokens.get(token)
    if (!stored) return undefined

    this.tokenIndex.delete(stored.token)
    this.refreshTokenIndex.delete(stored.refreshToken)

    const updated: StoredToken = {
      ...stored,
      token: newToken,
      refreshToken: newRefreshToken,
      expiresAt: new Date(Date.now() + ACCESS_TOKEN_EXPIRY_MS),
      refreshExpiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
      generation: stored.generation + 1,
    }

    this.tokens.set(token, updated)
    this.tokenIndex.set(newToken, token)
    this.refreshTokenIndex.set(newRefreshToken, token)
    return updated
  }

  revoke(token: string): void {
    const stored = this.tokens.get(token)
    if (!stored) return
    this.tokenIndex.delete(stored.token)
    this.refreshTokenIndex.delete(stored.refreshToken)
    this.tokens.delete(token)
  }

  revokeAllForUser(userId: string): void {
    for (const stored of Array.from(this.tokens.values())) {
      if (stored.userId === userId) {
        this.revoke(stored.token)
      }
    }
  }

  getGeneration(token: string): number | undefined {
    const stored = this.tokens.get(token)
    return stored?.generation
  }

  cleanup(): void {
    const now = new Date()
    for (const stored of Array.from(this.tokens.values())) {
      if (stored.expiresAt <= now && stored.refreshExpiresAt <= now) {
        this.revoke(stored.token)
      }
    }
  }
}
```

---

## Step 2: Create `src/auth/jwt-auth-store.test.ts`

**File:** `src/auth/jwt-auth-store.test.ts`
**Change:** New test file mirroring session-store tests but for JwtAuthStore
**Why:** TDD - tests before implementation
**Verify:** `pnpm test:int src/auth/jwt-auth-store.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { JwtAuthStore } from './jwt-auth-store'

describe('JwtAuthStore', () => {
  let store: JwtAuthStore

  beforeEach(() => {
    store = new JwtAuthStore()
  })

  describe('create', () => {
    it('should create a token entry with all fields', () => {
      const stored = store.create('user-1', 'token-1', 'refresh-1')
      expect(stored.userId).toBe('user-1')
      expect(stored.token).toBe('token-1')
      expect(stored.refreshToken).toBe('refresh-1')
      expect(stored.expiresAt).toBeDefined()
      expect(stored.refreshExpiresAt).toBeDefined()
      expect(stored.createdAt).toBeDefined()
      expect(stored.generation).toBe(0)
    })
  })

  describe('findByToken', () => {
    it('should find token entry by access token', () => {
      const stored = store.create('user-1', 'token-1', 'refresh-1')
      const found = store.findByToken('token-1')
      expect(found?.token).toBe(stored.token)
    })

    it('should return undefined for unknown token', () => {
      expect(store.findByToken('unknown')).toBeUndefined()
    })

    it('should return undefined for expired token', () => {
      const stored = store.create('user-1', 'token-1', 'refresh-1')
      store['tokens'].set(stored.token, { ...stored, expiresAt: new Date(Date.now() - 1000) })
      expect(store.findByToken('token-1')).toBeUndefined()
    })
  })

  describe('findByRefreshToken', () => {
    it('should find token entry by refresh token', () => {
      const stored = store.create('user-1', 'token-1', 'refresh-1')
      const found = store.findByRefreshToken('refresh-1')
      expect(found?.token).toBe(stored.token)
    })

    it('should return undefined for expired refresh token', () => {
      const stored = store.create('user-1', 'token-1', 'refresh-1')
      store['tokens'].set(stored.token, { ...stored, refreshExpiresAt: new Date(Date.now() - 1000) })
      expect(store.findByRefreshToken('refresh-1')).toBeUndefined()
    })
  })

  describe('refresh', () => {
    it('should rotate tokens and increment generation', () => {
      const stored = store.create('user-1', 'token-1', 'refresh-1')
      const updated = store.refresh('token-1', 'token-2', 'refresh-2')
      expect(updated?.token).toBe('token-2')
      expect(updated?.refreshToken).toBe('refresh-2')
      expect(updated?.generation).toBe(1)
      expect(store.findByToken('token-1')).toBeUndefined()
      expect(store.findByToken('token-2')).toBeDefined()
    })

    it('should return undefined for unknown token', () => {
      expect(store.refresh('unknown', 'token-2', 'refresh-2')).toBeUndefined()
    })
  })

  describe('generation', () => {
    it('should start at generation 0', () => {
      const stored = store.create('user-1', 'token-1', 'refresh-1')
      expect(stored.generation).toBe(0)
      expect(store.getGeneration('token-1')).toBe(0)
    })

    it('should increment generation on refresh', () => {
      const stored = store.create('user-1', 'token-1', 'refresh-1')
      const updated = store.refresh('token-1', 'token-2', 'refresh-2')
      expect(updated?.generation).toBe(1)
    })
  })

  describe('revoke', () => {
    it('should remove token entry', () => {
      const stored = store.create('user-1', 'token-1', 'refresh-1')
      store.revoke('token-1')
      expect(store.findByToken('token-1')).toBeUndefined()
    })
  })

  describe('revokeAllForUser', () => {
    it('should revoke all tokens for a user', () => {
      store.create('user-1', 'token-1', 'refresh-1')
      store.create('user-1', 'token-2', 'refresh-2')
      store.create('user-2', 'token-3', 'refresh-3')
      store.revokeAllForUser('user-1')
      expect(store.findByToken('token-1')).toBeUndefined()
      expect(store.findByToken('token-2')).toBeUndefined()
      expect(store.findByToken('token-3')).toBeDefined()
    })
  })

  describe('max tokens', () => {
    it('should evict oldest token when exceeding max 5', () => {
      for (let i = 0; i < 5; i++) {
        store.create('user-1', `token-${i}`, `refresh-${i}`)
      }
      store.create('user-1', 'token-5', 'refresh-5')
      expect(store.findByToken('token-0')).toBeUndefined()
      expect(store.findByToken('token-5')).toBeDefined()
    })
  })

  describe('cleanup', () => {
    it('should remove expired tokens', () => {
      const stored = store.create('user-1', 'token-1', 'refresh-1')
      store['tokens'].set(stored.token, {
        ...stored,
        expiresAt: new Date(Date.now() - 1000),
        refreshExpiresAt: new Date(Date.now() - 1000),
      })
      store.cleanup()
      expect(store['tokens'].has(stored.token)).toBe(false)
    })
  })
})
```

---

## Step 3: Update `src/auth/user-store.ts` to use `RbacRole`

**File:** `src/auth/user-store.ts`
**Change:** Replace `UserRole` type and update seed users to use `RbacRole` ('admin'|'editor'|'viewer')
**Why:** Align user-store.ts with auth-service.ts RbacRole; remove role divergence
**Verify:** `pnpm test:int src/auth/user-store.test.ts`

Change:
- Import `RbacRole` from `jwt-service` or define it locally
- Replace `UserRole = 'admin' | 'user' | 'guest' | 'student' | 'instructor'` with `RbacRole = 'admin' | 'editor' | 'viewer'`
- Update seed users: 'instructor' → 'editor', 'student' → 'viewer', 'user' → 'viewer', 'guest' → 'viewer'
- Update `CreateUserInput` to use `RbacRole`

---

## Step 4: Update `src/auth/index.ts` to export `JwtAuthStore` and remove `SessionStore`

**File:** `src/auth/index.ts`
**Change:** Replace `sessionStore` export with `jwtAuthStore`
**Why:** Module-level singleton for new JWT auth store
**Verify:** `pnpm build`

Change:
```typescript
import { UserStore } from './user-store'
import { JwtAuthStore } from './jwt-auth-store'
import { JwtService } from './jwt-service'

export const userStore = new UserStore()
export const jwtAuthStore = new JwtAuthStore()
export const jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')

export type { User } from './user-store'
export type { RbacRole } from './jwt-service'
export type { TokenPayload } from './jwt-service'
// Remove: export type { Session } from './session-store'
```

---

## Step 5: Update `src/middleware/auth-middleware.ts` to use JWT exclusively

**File:** `src/middleware/auth-middleware.ts`
**Change:** Remove `sessionStore` dependency; use `jwtService.verify` only
**Why:** Per approved answer - simplify to JWT-only, remove session validation
**Verify:** `pnpm test:int src/middleware/auth-middleware.test.ts`

Changes:
- Remove `SessionStore` import
- Remove `sessionStore.findByToken()` call
- Keep `jwtService.verify()` as sole validation
- Remove `session` from `AuthContext` return type

---

## Step 6: Add database migration for roles column

**File:** `src/migrations/20260410_add_roles_column.ts`
**Change:** Add `roles` text[] column and `permissions` jsonb column to users table
**Why:** New RBAC system requires roles and permissions storage
**Verify:** `pnpm test:int` (if migration tests exist)

```typescript
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN "roles" text[] DEFAULT ARRAY['viewer'];
    ALTER TABLE "users" ADD COLUMN "permissions" jsonb DEFAULT '{}';
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" DROP COLUMN IF EXISTS "roles";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "permissions";
  `)
}
```

---

## Step 7: Update `src/collections/Users.ts` to add roles/permissions fields

**File:** `src/collections/Users.ts`
**Change:** Add `roles` and `permissions` fields alongside existing `role` field
**Why:** Payload collection needs to store RBAC data
**Verify:** `pnpm build`

Add after existing `permissions` field:
```typescript
{
  name: 'roles',
  type: 'text',
  hasMany: true,
  options: ['admin', 'editor', 'viewer'],
  defaultValue: ['viewer'],
  required: true,
},
{
  name: 'permissions',
  type: 'json',
  defaultValue: {},
},
```

---

## Step 8: Delete `src/auth/session-store.ts` and `src/auth/session-store.test.ts`

**File:** `src/auth/session-store.ts`, `src/auth/session-store.test.ts`
**Change:** Remove these files entirely
**Why:** Replaced by `jwt-auth-store.ts`
**Verify:** `git status` and `pnpm build`

---

## Step 9: Run tests to verify all changes work

**Verify:** `pnpm test:int` passes with all auth-related tests

---

## Summary

| Step | File | Action |
|------|------|--------|
| 1 | `src/auth/jwt-auth-store.ts` | Create new JWT token store |
| 2 | `src/auth/jwt-auth-store.test.ts` | Create tests for new store |
| 3 | `src/auth/user-store.ts` | Update to use RbacRole |
| 4 | `src/auth/index.ts` | Export new jwtAuthStore |
| 5 | `src/middleware/auth-middleware.ts` | Remove sessionStore, JWT-only |
| 6 | `src/migrations/20260410_add_roles_column.ts` | Add roles/permissions columns |
| 7 | `src/collections/Users.ts` | Add roles/permissions fields |
| 8 | `src/auth/session-store.ts` | Delete |
| 9 | `src/auth/session-store.test.ts` | Delete |
