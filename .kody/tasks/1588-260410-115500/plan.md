Now I have a complete picture. Let me create the implementation plan.

## Existing Patterns Found

- `src/auth/auth-service.ts:62-149` - AuthService.login() using Payload SDK with PBKDF2 password verification (this is the pattern to use for login/migration)
- `src/auth/_auth.ts:17-21` - ROLE_HIERARCHY for RBAC role inheritance (admin>editor>viewer)
- `src/auth/_auth.ts:26-31` - extractBearerToken() helper
- `src/auth/_auth.ts:37-61` - checkRole() for role validation
- `src/migrations/20260405_000000_add_users_permissions_lastLogin.ts:3-8` - Payload DB migration pattern using sql`` tagged template
- `src/api/auth/login.ts:22-73` - Current login using userStore/sessionStore (to be migrated)
- `src/api/auth/register.ts:59-69` - Uses AuthService.login() after creating user via Payload

---

## Plan

### Step 1: Add passwordHistory field to Users collection

**File:** `src/collections/Users.ts`
**Change:** Add `passwordHistory` field (array of objects with `hash`, `salt`, `changedAt`) after the `refreshToken` field
**Why:** Stores last 5 password hashes to prevent password reuse
**Verify:** `pnpm test:int -- src/auth/auth-service.test.ts`

```typescript
// Add to Users fields array:
{
  name: 'passwordHistory',
  type: 'array',
  required: false,
  hidden: true,
  admin: { readOnly: true },
  access: { read: () => false, update: () => false },
  fields: [
    { name: 'hash', type: 'text', required: true },
    { name: 'salt', type: 'text', required: true },
    { name: 'changedAt', type: 'date', required: true },
  ],
  maxRows: 5,
},
```

---

### Step 2: Create migration script for password history and role assignment

**File:** `src/migrations/20260410_000000_add_password_history_and_role.ts`
**Change:** Create migration that:
- Adds `passwordHistory` column as JSONB
- Assigns 'viewer' role to users where role is null/undefined
**Why:** Payload migrations follow the sql`` pattern from existing migrations
**Verify:** `pnpm test:int -- src/migrations/`

```typescript
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN "passwordHistory" jsonb DEFAULT '[]'::jsonb;
    UPDATE "users" SET "passwordHistory" = '[]'::jsonb WHERE "passwordHistory" IS NULL;
    ALTER TABLE "users" ALTER COLUMN "passwordHistory" SET DEFAULT '[]'::jsonb;
    UPDATE "users" SET "role" = 'viewer' WHERE "role" IS NULL;
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" DROP COLUMN IF EXISTS "passwordHistory";
  `)
}
```

---

### Step 3: Add changePassword method to AuthService with password history check

**File:** `src/auth/auth-service.ts`
**Change:** Add `changePassword` method that:
1. Verifies current password
2. Checks new password against last 5 passwords in history
3. If valid, hashes new password and updates history (keeping last 5)
**Why:** Centralizes password change logic; follows existing AuthService pattern with Payload SDK
**Verify:** `pnpm test:int -- src/auth/auth-service.test.ts`

```typescript
async changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  if (!newPassword) {
    throw createError('New password is required', 400)
  }

  const users = await this.payload.find({
    collection: 'users' as CollectionSlug,
    where: { id: { equals: userId } },
    limit: 1,
  })
  const user = users.docs[0]
  if (!user) {
    throw createError('User not found', 404)
  }

  const hash = (user as any).hash as string | null
  const salt = (user as any).salt as string | null
  const passwordHistory = (user as any).passwordHistory as Array<{ hash: string; salt: string }> | null

  // Verify current password
  if (!hash || !salt) {
    throw createError('Invalid credentials', 401)
  }
  const currentValid = await verifyPassword(currentPassword, hash, salt)
  if (!currentValid) {
    throw createError('Current password is incorrect', 401)
  }

  // Check against password history (last 5)
  if (passwordHistory && passwordHistory.length > 0) {
    for (const entry of passwordHistory.slice(0, 5)) {
      const matches = await verifyPassword(newPassword, entry.hash, entry.salt)
      if (matches) {
        throw createError('Cannot reuse any of your last 5 passwords', 400)
      }
    }
  }

  // Generate new salt and hash for new password
  const newSalt = crypto.randomBytes(16).toString('hex')
  const newHash = await new Promise<string>((resolve, reject) => {
    crypto.pbkdf2(newPassword, newSalt, 25000, 512, 'sha256', (err, derivedKey) => {
      if (err) reject(err)
      else resolve(Buffer.from(derivedKey).toString('hex'))
    })
  })

  // Update password history - add current, keep last 5
  const updatedHistory = [
    { hash, salt, changedAt: new Date() },
    ...(passwordHistory || []),
  ].slice(0, 5)

  // Update user with new password and history
  await this.payload.update({
    collection: 'users' as CollectionSlug,
    id: userId,
    data: {
      hash: newHash,
      salt: newSalt,
      passwordHistory: updatedHistory,
    } as any,
  })
}
```

---

### Step 4: Migrate login.ts to use AuthService

**File:** `src/api/auth/login.ts`
**Change:** Replace the userStore/sessionStore/JwtService login implementation with a call to AuthService.login()
**Why:** Removes duplicate auth logic; follows the pattern already used by register.ts, logout.ts, refresh.ts
**Verify:** `pnpm test:int -- src/api/auth/login.test.ts`

```typescript
import type { AuthService } from '../../auth/auth-service'
import type { Payload } from 'payload'
import { getPayloadInstance } from '@/services/progress'

function createError(message: string, status: number): AuthError & Error {
  const err = new Error(message) as Error & AuthError
  err.status = status
  return err
}

export interface LoginResult {
  accessToken: string
  refreshToken: string
  user: { id: string; email: string; role: string }
}

export async function login(
  email: string,
  password: string,
  ipAddress: string,
  userAgent: string,
  authService: AuthService
): Promise<LoginResult> {
  if (!email || !password) {
    throw createError('Email and password are required', 400)
  }
  return authService.login(email, password, ipAddress, userAgent)
}
```

---

### Step 5: Update login test to use AuthService

**File:** `src/api/auth/login.test.ts`
**Change:** Rewrite tests to mock AuthService instead of userStore/sessionStore
**Why:** TDD - tests drive the implementation; must match new login.ts signature
**Verify:** `pnpm test:int -- src/api/auth/login.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { login } from './login'
import { AuthService } from '../../auth/auth-service'
import { JwtService } from '../../auth/jwt-service'

vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(() => mockPayload),
}))

const mockPayload = { find: vi.fn(), update: vi.fn() }
const mockJwtService = new JwtService('test-secret')
const mockAuthService = new AuthService(mockPayload as any, mockJwtService)

describe('login', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should return tokens and user on successful login', async () => {
    vi.spyOn(mockAuthService, 'login').mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: '1', email: 'admin@example.com', role: 'admin' },
    })
    const result = await login('admin@example.com', 'AdminPass1!', '127.0.0.1', 'TestAgent', mockAuthService)
    expect(result.accessToken).toBe('access-token')
    expect(result.user.email).toBe('admin@example.com')
  })

  // ... other tests updated to use mockAuthService.login rejection patterns
})
```

---

### Step 6: Migrate auth-middleware.ts to use AuthService

**File:** `src/middleware/auth-middleware.ts`
**Change:** Replace userStore/sessionStore with AuthService.verifyAccessToken() for middleware auth validation
**Why:** Removes session-based validation; auth-middleware becomes a thin wrapper around JWT verification via AuthService
**Verify:** `pnpm test:int -- src/middleware/auth-middleware.test.ts`

```typescript
import type { AuthenticatedUser } from '../auth/auth-service'
import { JwtService } from '../auth/jwt-service'
import { AuthService } from '../auth/auth-service'
import { getPayloadInstance } from '@/services/progress'

export interface AuthContext {
  user?: AuthenticatedUser
  error?: string
  status?: number
}

interface RequestContext {
  authorization?: string
  ip?: string
}

export function createAuthMiddleware(jwtService: JwtService) {
  const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
  const RATE_LIMIT_MAX = 100
  const RATE_LIMIT_WINDOW_MS = 60 * 1000

  return async function authMiddleware(req: RequestContext): Promise<AuthContext> {
    const ip = req.ip ?? 'unknown'
    const now = Date.now()

    // Rate limiting
    let entry = rateLimitMap.get(ip)
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS }
      rateLimitMap.set(ip, entry)
    }
    entry.count++
    if (entry.count > RATE_LIMIT_MAX) {
      return { error: 'Too many requests', status: 429 }
    }

    const authHeader = req.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Missing or invalid Authorization header', status: 401 }
    }

    const token = authHeader.slice(7)

    try {
      const payload = getPayloadInstance()
      const authService = new AuthService(payload as any, jwtService)
      const result = await authService.verifyAccessToken(token)
      if (result.user) {
        return { user: result.user }
      }
      return { error: 'User not found', status: 404 }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid token'
      return { error: message, status: 401 }
    }
  }
}
```

---

### Step 7: Update auth-middleware tests

**File:** `src/middleware/auth-middleware.test.ts`
**Change:** Rewrite tests to use AuthService instead of userStore/sessionStore
**Why:** TDD - tests must pass with new implementation
**Verify:** `pnpm test:int -- src/middleware/auth-middleware.test.ts`

---

### Step 8: Run full test suite

**Verify:** `pnpm test:int`
**Why:** Confirms all auth-related tests pass after migration
