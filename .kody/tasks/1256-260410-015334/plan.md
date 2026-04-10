Based on my exploration, I can see the existing implementation has HS256-based JWT, dual role systems (`UserRole` vs `RbacRole`), and session-store usage. Let me create the plan.

## Existing Patterns Found
- `src/auth/jwt-service.ts` - JwtService class with `sign`/`verify` methods, blacklist-based revocation, generation-based token rotation — **to be upgraded from HS256 to RS256**
- `src/auth/auth-service.ts` - AuthService with login/refresh/verifyAccessToken/logout using Payload SDK, PBKDF2 password verification — **to be extended with tokenVersion-based revocation**
- `src/auth/session-store.ts` - Session management with token indexing — **to be removed, replaced by tokenVersion-based invalidation**
- `src/middleware/role-guard.ts` - requireRole HOC using ROLE_HIERARCHY — **already exists, will be reused**
- `src/auth/_auth.ts` - ROLE_HIERARCHY map, checkRole function, extractBearerToken utility — **already exists**
- `src/api/auth/login.ts` - uses UserStore+SessionStore+JwtService directly — **to be updated to use AuthService**
- `src/api/auth/refresh.ts` / `logout.ts` - already use AuthService

---

## Plan

**Step 1: Update jwt-service.ts to use RS256 (asymmetric signing)**

**File:** `src/auth/jwt-service.ts`
**Change:** Replace HMAC-based signing with RSA key pair using Web Crypto API. Load keys from environment variables (`JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY`) or generate at runtime.
**Why:** RS256 is industry standard for JWT — private key signs, public key verifies. Allows services to verify tokens without sharing the signing key.
**Verify:** `pnpm test:int src/auth/jwt-service.test.ts`

```typescript
import crypto from 'crypto'

export type RbacRole = 'admin' | 'editor' | 'viewer'

export interface TokenPayload {
  userId: string
  email: string
  role: RbacRole
  sessionId: string
  generation: number
  iat: number
  exp: number
}

type TokenInput = Omit<TokenPayload, 'iat' | 'exp'>

function base64urlEncode(data: string): string {
  return Buffer.from(data).toString('base64url')
}

function base64urlDecode(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf-8')
}

export class JwtService {
  private privateKey: CryptoKey | null = null
  private publicKey: CryptoKey | null = null

  constructor(
    private privateKeyPem?: string,
    private publicKeyPem?: string
  ) {}

  private async getPrivateKey(): Promise<CryptoKey> {
    if (this.privateKey) return this.privateKey

    const pem = this.privateKeyPem ?? process.env.JWT_PRIVATE_KEY
    if (!pem) {
      throw new Error('JWT_PRIVATE_KEY environment variable is not set')
    }

    const decoder = new TextDecoder()
    this.privateKey = await crypto.subtle.importKey(
      'pkcs8',
      thisPemToDer(pem),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    )
    return this.privateKey
  }

  private async getPublicKey(): Promise<CryptoKey> {
    if (this.publicKey) return this.publicKey

    const pem = this.publicKeyPem ?? process.env.JWT_PUBLIC_KEY
    if (!pem) {
      throw new Error('JWT_PUBLIC_KEY environment variable is not set')
    }

    this.publicKey = await crypto.subtle.importKey(
      'spki',
      this.pemToDer(pem),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    )
    return this.publicKey
  }

  // Convert PEM to DER (strip header/footer and decode base64)
  private pemToDer(pem: string): ArrayBuffer {
    const lines = pem.split('\n')
    const base64 = lines.filter(l => !l.startsWith('-----')).join('')
    const binary = Buffer.from(base64, 'base64')
    return binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength)
  }

  async sign(payload: TokenInput, expiresInMs: number): Promise<string> {
    const now = Math.floor(Date.now() / 1000)
    const fullPayload: TokenPayload = {
      ...payload,
      iat: now,
      exp: now + Math.floor(expiresInMs / 1000),
    }

    const header = base64urlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
    const body = base64urlEncode(JSON.stringify(fullPayload))
    const signingInput = `${header}.${body}`

    const key = await this.getPrivateKey()
    const encoder = new TextEncoder()
    const sigBuffer = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      key,
      encoder.encode(signingInput)
    )
    const sig = Buffer.from(sigBuffer).toString('base64url')

    return `${signingInput}.${sig}`
  }

  async verify(token: string): Promise<TokenPayload> {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid token format')
    }

    const [header, body, sig] = parts
    const signingInput = `${header}.${body}`

    const key = await this.getPublicKey()
    const encoder = new TextEncoder()
    const sigBuffer = Buffer.from(sig, 'base64url')

    const valid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      key,
      sigBuffer,
      encoder.encode(signingInput)
    )

    if (!valid) {
      throw new Error('Invalid token signature')
    }

    const payload: TokenPayload = JSON.parse(base64urlDecode(body))
    const now = Math.floor(Date.now() / 1000)

    if (payload.exp < now) {
      throw new Error('Token expired')
    }

    return payload
  }

  async signAccessToken(payload: TokenInput): Promise<string> {
    return this.sign({ ...payload, generation: payload.generation ?? 0 }, 15 * 60 * 1000)
  }

  async signRefreshToken(payload: TokenInput): Promise<string> {
    return this.sign({ ...payload, generation: payload.generation ?? 0 }, 7 * 24 * 60 * 60 * 1000)
  }
}
```

**Step 2: Update jwt-service.test.ts for RS256**

**File:** `src/auth/jwt-service.test.ts`
**Change:** Update tests to work with RS256 key pairs. Add test fixtures for key pair generation.
**Why:** Tests must pass after RS256 migration.
**Verify:** `pnpm test:int src/auth/jwt-service.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { JwtService } from './jwt-service'

// Generate test key pair once
const TEST_KEYS = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
})

describe('JwtService', () => {
  let service: JwtService

  beforeEach(() => {
    service = new JwtService(TEST_KEYS.privateKey, TEST_KEYS.publicKey)
  })

  const basePayload = {
    userId: 'user-1',
    email: 'test@example.com',
    role: 'admin' as const,
    sessionId: 'session-1',
    generation: 0,
  }

  describe('signAccessToken / verify', () => {
    it('should sign and verify an access token', async () => {
      const token = await service.signAccessToken(basePayload)
      const payload = await service.verify(token)
      expect(payload.userId).toBe('user-1')
      expect(payload.email).toBe('test@example.com')
      expect(payload.role).toBe('admin')
      expect(payload.sessionId).toBe('session-1')
      expect(payload.iat).toBeDefined()
      expect(payload.exp).toBeDefined()
    })

    it('should reject a token signed with different key', async () => {
      const otherService = new JwtService(...generateKeyPair())
      const token = await otherService.signAccessToken(basePayload)
      await expect(service.verify(token)).rejects.toThrow('Invalid token signature')
    })
  })
  // ... rest of tests updated for RS256
})
```

**Step 3: Update user-store.ts to align roles and add tokenVersion**

**File:** `src/auth/user-store.ts`
**Change:** Replace `UserRole` with `RbacRole` (`'admin' | 'editor' | 'viewer'`), add `tokenVersion: number` field, remove session-related fields.
**Why:** Unified role system across the auth layer. tokenVersion enables revocation without blacklist.
**Verify:** `pnpm test:int src/auth/user-store.test.ts`

**Step 4: Create src/auth/refresh-token.ts**

**File:** `src/auth/refresh-token.ts`
**Change:** New module with `refreshToken(input)` function using tokenVersion-based invalidation.
**Why:** Token refresh logic extracted from auth-service.ts per task requirement.
**Verify:** `pnpm test:int src/auth/auth-service.test.ts`

**Step 5: Create src/auth/revoke-token.ts**

**File:** `src/auth/revoke-token.ts`
**Change:** New module with `revokeToken(userId, tokenVersion)` — increments tokenVersion in user record, invalidating all existing tokens.
**Why:** Version-based revocation replaces blacklist approach per architectural decision.
**Verify:** `pnpm test:int src/auth/auth-service.test.ts`

**Step 6: Update src/auth/auth-service.ts to use tokenVersion-based revocation**

**File:** `src/auth/auth-service.ts`
**Change:** Remove blacklist usage from JwtService calls. Add `tokenVersion` checks in refresh/verify. Update `logout` to increment tokenVersion.
**Why:** Complete migration to version-based invalidation.
**Verify:** `pnpm test:int src/auth/auth-service.test.ts`

**Step 7: Update src/api/auth/login.ts to use AuthService directly**

**File:** `src/api/auth/login.ts`
**Change:** Replace direct UserStore+SessionStore+JwtService usage with AuthService.login(). Remove session-store dependency.
**Why:** Single auth flow entry point.
**Verify:** `pnpm test:int src/api/auth/login.test.ts`

**Step 8: Update src/middleware/role-guard.ts to handle new token structure**

**File:** `src/middleware/role-guard.ts`
**Change:** Update to work with updated TokenPayload from jwt-service.ts (no blacklist field).
**Why:** Ensure RBAC middleware works with new token structure.
**Verify:** `pnpm test:int src/middleware/role-guard.test.ts`

**Step 9: Update src/auth/index.ts**

**File:** `src/auth/index.ts`
**Change:** Remove sessionStore export, update exports to match new structure.
**Why:** SessionStore removed; maintain public API surface.
**Verify:** `pnpm build`

**Step 10: Update all auth API route handlers**

**Files:** `src/api/auth/profile.ts`, `src/api/auth/register.ts`
**Change:** Add role checks using `withAuth(handler, { roles: ['admin'] })` pattern.
**Why:** All protected routes need RBAC enforcement per task requirement.
**Verify:** `pnpm test:int`

**Step 11: Update tests for all modified modules**

**Files:** `src/auth/auth-service.test.ts`, `src/auth/user-store.test.ts`, `src/middleware/role-guard.test.ts`, `src/api/auth/login.test.ts`, `src/api/auth/logout.test.ts`, `src/api/auth/refresh.test.ts`
**Change:** Update mocks, add test cases for tokenVersion revocation, RS256 key handling.
**Why:** Comprehensive test coverage for new functionality.
**Verify:** `pnpm test:int`

---

## Questions

- **RS256 key management**: Recommend loading from PEM files (`JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` env vars) rather than runtime generation, since runtime generation is expensive and keys must persist across restarts. Do you agree?
- **Token revocation approach**: Recommend **version-based invalidation** (tokenVersion field) over blacklist — blacklist requires storage and cleanup; tokenVersion is simpler and scales better. The SessionStore blacklist can be removed entirely. Confirm?
- **SessionStore removal**: The task says "Remove all session-store.ts usage". Should `session-store.ts` be deleted entirely, or kept (but unused) for reference during migration?
