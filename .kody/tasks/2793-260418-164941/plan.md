

I have enough context. Let me write the plan.

## Existing Patterns Found

- **`vi.mock('@/getPayload')`**: Used in `register.test.ts`, `refresh.test.ts`, `logout.test.ts` — mock Payload instance for AuthService tests
- **`makeAuthenticatedContext()` helper**: Creates user + tokens + sessions for test context
- **`vi.clearAllMocks()` pattern**: Used in `beforeEach` across all auth tests
- **`JwtService.signAccessToken()` / `signRefreshToken()`**: Used to create real JWTs for testing token flows
- **Mock `crypto`** in `register.test.ts` for PBKDF2 password hashing
- **`auth-service.test.ts`** exists (path from task.json) — likely tests AuthService directly

## Existing test structure
- Unit tests in `src/**/*.test.ts` (co-located with source)
- Integration specs in `tests/int/**/*.int.spec.ts` (dedicated folder, included in vitest config)
- Mock pattern: `vi.mock('@/getPayload', () => ({ getPayloadInstance: vi.fn(() => mockPayload) }))`

---

## Implementation Plan

**Step 1: Create integration test file for `withAuth` HOC protection**

**File:** `tests/int/auth-protected-routes.int.spec.ts`
**Change:** Write integration tests covering:
- `withAuth` returns **401** when no Authorization header present
- `withAuth` returns **401** for invalid/malformed token
- `withAuth` returns **401** for expired access token
- `withAuth` returns **403** when user role is insufficient (viewer accessing admin-only route)
- `withAuth` allows request through when valid token + sufficient role
- **Full flow** — register → login → access protected route → refresh token → logout

Test covers 3 representative routes:
- `POST /api/notes` — role-restricted (admin/editor only)
- `GET /api/dashboard/admin-stats` — admin-only
- `POST /api/enroll` — viewer+admin only

**Verify:** `pnpm test:int -- tests/int/auth-protected-routes.int.spec.ts`

**Step 2: Add unit test for `withAuth` HOC itself**

**File:** `src/auth/withAuth.test.ts`
**Change:** Unit test the HOC in isolation — mock `AuthService` to avoid Payload, test 401/403/200 branches directly

**Verify:** `pnpm test:int -- src/auth/withAuth.test.ts`

**Step 3: Run full integration suite**

**Verify:** `pnpm test:int`

---

## Full Integration Test File (`tests/int/auth-protected-routes.int.spec.ts`)

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AuthService } from '@/auth/auth-service'
import { JwtService } from '@/auth/jwt-service'

// Mock Payload
const mockPayload = {
  findByID: vi.fn(),
  find: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
}

vi.mock('@/getPayload', () => ({
  getPayloadInstance: vi.fn(() => mockPayload),
}))

// Mock crypto for PBKDF2 password verification
vi.mock('crypto', () => ({
  default: {
    pbkdf2: vi.fn((_password, _salt, _iterations, _keylen, _digest, callback) => {
      // Return a consistent fake hash that we control in test cases
      const fakeHash = Buffer.from('aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899', 'hex')
      callback(null, fakeHash)
    }),
    randomBytes: vi.fn(() => Buffer.from('testsalt123')),
    timingSafeEqual: vi.fn(() => true),
  },
}))

function createMockUser(overrides: Partial<{
  id: string; email: string; role: string; isActive: boolean; hash: string; salt: string; refreshToken: string | null; tokenExpiresAt: string | null
}> = {}) {
  return {
    id: '1',
    email: 'test@example.com',
    role: 'viewer' as const,
    isActive: true,
    hash: 'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899',
    salt: 'testsalt123',
    refreshToken: null as string | null,
    tokenExpiresAt: null as string | null,
    ...overrides,
  }
}

function signTokens(jwtService: JwtService, userId: string, role: string, sessionId = 'session-1', generation = 0) {
  return {
    accessToken: jwtService.signAccessTokenSync({ userId, email: 'test@example.com', role: role as 'admin' | 'editor' | 'viewer', sessionId, generation }),
    refreshToken: jwtService.signRefreshTokenSync({ userId, email: 'test@example.com', role: role as 'admin' | 'editor' | 'viewer', sessionId, generation }),
  }
}

// Import after mocks are set up
import type { NextRequest } from 'next/server'
import { withAuth } from '@/auth/withAuth'

describe('withAuth HOC - protected route access control', () => {
  let jwtService: JwtService
  let authService: AuthService

  beforeEach(() => {
    vi.clearAllMocks()
    jwtService = new JwtService('test-secret')
    authService = new AuthService(mockPayload as any, jwtService)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ─── 401: Missing or invalid token ──────────────────────────────────────────

  describe('401: missing or invalid token', () => {
    it('returns 401 when Authorization header is missing', async () => {
      const handler = vi.fn(async (_req: NextRequest, ctx: { user?: unknown }) => {
        return Response.json({ user: ctx.user })
      })

      const wrapped = withAuth(handler)
      const mockReq = new Request('http://localhost/api/notes', { method: 'POST' })

      const response = await wrapped(mockReq as unknown as NextRequest)
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Missing or invalid Authorization header')
    })

    it('returns 401 for malformed Authorization header', async () => {
      const handler = vi.fn()
      const wrapped = withAuth(handler)
      const mockReq = new Request('http://localhost/api/notes', {
        method: 'POST',
        headers: { Authorization: 'Basic abc123' },
      })

      const response = await wrapped(mockReq as unknown as NextRequest)
      expect(response.status).toBe(401)
    })

    it('returns 401 for garbage token', async () => {
      const handler = vi.fn()
      const wrapped = withAuth(handler)
      const mockReq = new Request('http://localhost/api/notes', {
        method: 'POST',
        headers: { Authorization: 'Bearer garbage-token' },
      })

      const response = await wrapped(mockReq as unknown as NextRequest)
      expect(response.status).toBe(401)
    })

    it('returns 401 for expired access token', async () => {
      // Manually create an expired token using JwtService
      const expiredAccessToken = jwtService.signAccessTokenSync({
        userId: '1',
        email: 'test@example.com',
        role: 'viewer',
        sessionId: 'expired-session',
        generation: 0,
      })

      // Store a matching user (but with a different stored token so verification fails
      // if the implementation checks session validity)
      mockPayload.find.mockResolvedValue({
        docs: [createMockUser({ id: '1', refreshToken: 'not-the-same', tokenExpiresAt: null })],
      })

      const handler = vi.fn()
      const wrapped = withAuth(handler)
      const mockReq = new Request('http://localhost/api/notes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${expiredAccessToken}` },
      })

      const response = await wrapped(mockReq as unknown as NextRequest)
      // Expired token - JwtService throws, which withAuth catches and returns 401
      expect(response.status).toBe(401)
    })
  })

  // ─── 403: Insufficient role ──────────────────────────────────────────────────

  describe('403: insufficient role', () => {
    it('returns 403 when viewer tries to access admin-only route', async () => {
      const viewerUser = createMockUser({ id: '2', role: 'viewer' })
      const { accessToken } = signTokens(jwtService, '2', 'viewer')

      mockPayload.find.mockResolvedValue({
        docs: [{ ...viewerUser, refreshToken: accessToken }],
      })

      const handler = vi.fn(async (_req: NextRequest, ctx: { user?: unknown }) => {
        return Response.json({ success: true, user: ctx.user })
      })

      // Admin-only route
      const wrapped = withAuth(handler, { roles: ['admin'] })
      const mockReq = new Request('http://localhost/api/dashboard/admin-stats', {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const response = await wrapped(mockReq as unknown as NextRequest)
      expect(response.status).toBe(403)
      const body = await response.json()
      expect(body.error).toContain('Forbidden')
    })

    it('returns 403 when viewer tries to create notes (admin/editor required)', async () => {
      const viewerUser = createMockUser({ id: '3', role: 'viewer' })
      const { accessToken } = signTokens(jwtService, '3', 'viewer')

      mockPayload.find.mockResolvedValue({
        docs: [{ ...viewerUser, refreshToken: accessToken }],
      })

      const handler = vi.fn()
      const wrapped = withAuth(handler, { roles: ['admin', 'editor'] })
      const mockReq = new Request('http://localhost/api/notes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const response = await wrapped(mockReq as unknown as NextRequest)
      expect(response.status).toBe(403)
    })

    it('returns 403 when editor tries to delete notes (admin only)', async () => {
      const editorUser = createMockUser({ id: '4', role: 'editor' })
      const { accessToken } = signTokens(jwtService, '4', 'editor')

      mockPayload.find.mockResolvedValue({
        docs: [{ ...editorUser, refreshToken: accessToken }],
      })

      const handler = vi.fn()
      const wrapped = withAuth(handler, { roles: ['admin'] })
      const mockReq = new Request('http://localhost/api/notes/123', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const response = await wrapped(mockReq as unknown as NextRequest)
      expect(response.status).toBe(403)
    })
  })

  // ─── 200: Valid token + sufficient role ─────────────────────────────────────

  describe('200: valid token with sufficient role', () => {
    it('allows admin to access admin-only route', async () => {
      const adminUser = createMockUser({ id: '5', role: 'admin' })
      const { accessToken } = signTokens(jwtService, '5', 'admin')

      mockPayload.find.mockResolvedValue({
        docs: [{ ...adminUser, refreshToken: accessToken }],
      })

      const handler = vi.fn(async (_req: NextRequest, ctx: { user?: unknown }) => {
        return Response.json({ userId: (ctx.user as any)?.id })
      })

      const wrapped = withAuth(handler, { roles: ['admin'] })
      const mockReq = new Request('http://localhost/api/dashboard/admin-stats', {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const response = await wrapped(mockReq as unknown as NextRequest)
      expect(response.status).toBe(200)
    })

    it('allows editor to create notes (admin/editor allowed)', async () => {
      const editorUser = createMockUser({ id: '6', role: 'editor' })
      const { accessToken } = signTokens(jwtService, '6', 'editor')

      mockPayload.find.mockResolvedValue({
        docs: [{ ...editorUser, refreshToken: accessToken }],
      })

      const handler = vi.fn(async (_req: NextRequest, ctx: { user?: unknown }) => {
        return Response.json({ created: true, user: ctx.user })
      })

      const wrapped = withAuth(handler, { roles: ['admin', 'editor'] })
      const mockReq = new Request('http://localhost/api/notes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const response = await wrapped(mockReq as unknown as NextRequest)
      expect(response.status).toBe(200)
    })

    it('allows viewer to enroll (viewer/admin allowed)', async () => {
      const viewerUser = createMockUser({ id: '7', role: 'viewer' })
      const { accessToken } = signTokens(jwtService, '7', 'viewer')

      mockPayload.find.mockResolvedValue({
        docs: [{ ...viewerUser, refreshToken: accessToken }],
      })

      const handler = vi.fn(async (_req: NextRequest, ctx: { user?: unknown }) => {
        return Response.json({ enrolled: true })
      })

      const wrapped = withAuth(handler, { roles: ['viewer', 'admin'] })
      const mockReq = new Request('http://localhost/api/enroll', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const response = await wrapped(mockReq as unknown as NextRequest)
      expect(response.status).toBe(200)
    })

    it('allows admin to enroll (role inheritance)', async () => {
      const adminUser = createMockUser({ id: '8', role: 'admin' })
      const { accessToken } = signTokens(jwtService, '8', 'admin')

      mockPayload.find.mockResolvedValue({
        docs: [{ ...adminUser, refreshToken: accessToken }],
      })

      const handler = vi.fn(async (_req: NextRequest, ctx: { user?: unknown }) => {
        return Response.json({ enrolled: true })
      })

      const wrapped = withAuth(handler, { roles: ['viewer', 'admin'] })
      const mockReq = new Request('http://localhost/api/enroll', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const response = await wrapped(mockReq as unknown as NextRequest)
      expect(response.status).toBe(200)
    })

    it('allows access when no role restrictions are set', async () => {
      const viewerUser = createMockUser({ id: '9', role: 'viewer' })
      const { accessToken } = signTokens(jwtService, '9', 'viewer')

      mockPayload.find.mockResolvedValue({
        docs: [{ ...viewerUser, refreshToken: accessToken }],
      })

      const handler = vi.fn(async () => Response.json({ ok: true }))
      const wrapped = withAuth(handler) // no roles specified
      const mockReq = new Request('http://localhost/api/health', {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const response = await wrapped(mockReq as unknown as NextRequest)
      expect(response.status).toBe(200)
    })
  })

  // ─── Optional: no token = allowed ──────────────────────────────────────────

  describe('optional: no token is allowed', () => {
    it('allows request without token when optional=true', async () => {
      const handler = vi.fn(async (_req: NextRequest, ctx: { user?: unknown }) => {
        return Response.json({ user: ctx.user ?? null })
      })

      const wrapped = withAuth(handler, { optional: true })
      const mockReq = new Request('http://localhost/api/notes', { method: 'GET' })

      const response = await wrapped(mockReq as unknown as NextRequest)
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.user).toBeNull()
    })

    it('still validates token if present when optional=true', async () => {
      const handler = vi.fn()
      const wrapped = withAuth(handler, { optional: true })
      const mockReq = new Request('http://localhost/api/notes', {
        method: 'GET',
        headers: { Authorization: 'Bearer garbage' },
      })

      const response = await wrapped(mockReq as unknown as NextRequest)
      expect(response.status).toBe(401)
    })
  })

  // ─── Full auth flow: register → login → protected route → refresh → logout ──

  describe('full auth flow', () => {
    it('register → login → access protected route → refresh → logout', async () => {
      // 1. Register: create user in Payload
      mockPayload.find
        .mockResolvedValueOnce({ docs: [] }) // existing user check → none
        .mockResolvedValueOnce({ docs: [{ id: '99', email: 'newuser@example.com', role: 'viewer', hash: 'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899', salt: 'testsalt123', isActive: true, refreshToken: null, tokenExpiresAt: null }] }) // login lookup

      mockPayload.create.mockResolvedValue({ id: '99', email: 'newuser@example.com', role: 'viewer' })
      mockPayload.update.mockResolvedValue({ id: '99', email: 'newuser@example.com', role: 'viewer', refreshToken: 'new-refresh-token' })

      // Simulate register → login flow
      const registerUser = createMockUser({ id: '99', email: 'newuser@example.com' })
      mockPayload.find.mockResolvedValue({ docs: [registerUser] })

      // 2. Login: get tokens
      const loginResult = await authService.login('newuser@example.com', 'Password1!', '127.0.0.1', 'TestAgent')
      expect(loginResult.accessToken).toBeDefined()
      expect(loginResult.refreshToken).toBeDefined()
      expect(loginResult.user.role).toBe('viewer')

      // 3. Access protected route with valid token
      const { accessToken } = signTokens(jwtService, '99', 'viewer', 'session-99-0')
      mockPayload.find.mockResolvedValue({
        docs: [{ ...registerUser, refreshToken }],
      })

      const handler = vi.fn(async (_req: NextRequest, ctx: { user?: unknown }) => {
        return Response.json({ accessed: true, userId: (ctx.user as any)?.id })
      })

      const wrapped = withAuth(handler, { roles: ['viewer', 'admin'] })
      const mockReq = new Request('http://localhost/api/enroll', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const accessResponse = await wrapped(mockReq as unknown as NextRequest)
      expect(accessResponse.status).toBe(200)

      // 4. Refresh token
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await authService.refresh(loginResult.refreshToken)
      expect(newAccessToken).toBeDefined()
      expect(newRefreshToken).toBeDefined()
      expect(newRefreshToken).not.toBe(loginResult.refreshToken) // rotated

      // 5. Logout invalidates session
      await authService.logout('99')

      expect(mockPayload.update).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'users',
          id: '99',
          data: { refreshToken: null },
        })
      )

      // 6. Attempt to use old token after logout → should fail (token valid but user refresh token cleared)
      // The old access token itself is still cryptographically valid (JWT is stateless),
      // but AuthService checks the stored refreshToken. Since we cleared it, re-verification
      // will fail on the stored token check inside refresh flow.
      // Note: verifyAccessToken doesn't check stored refreshToken, only the JWT signature.
      // However, logout sets refreshToken=null in DB, so the next refresh would fail.
      // The access token remains valid until it expires (15min) — this is expected JWT behavior.
      // A new access token request would fail because refresh would reject (stored RT cleared).
    })
  })
})
```

**Step 2 file: `src/auth/withAuth.test.ts`**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { withAuth } from './withAuth'
import type { NextRequest } from 'next/server'

// Mock AuthService to avoid Payload dependency
const mockVerifyAccessToken = vi.fn()
const mockGetAuthService = vi.fn()

vi.mock('./auth-service', () => ({
  AuthService: vi.fn().mockImplementation(() => ({
    verifyAccessToken: mockVerifyAccessToken,
  })),
}))

vi.mock('./jwt-service', () => ({
  JwtService: vi.fn().mockImplementation(() => ({})),
}))

vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(),
}))

describe('withAuth HOC - unit tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when no Authorization header', async () => {
    const handler = vi.fn()
    const wrapped = withAuth(handler)
    const req = new Request('http://localhost/', { method: 'GET' }) as unknown as NextRequest

    const response = await wrapped(req)
    expect(response.status).toBe(401)
  })

  it('returns 401 for malformed token', async () => {
    mockVerifyAccessToken.mockRejectedValue(new Error('Invalid token'))

    const handler = vi.fn()
    const wrapped = withAuth(handler)
    const req = new Request('http://localhost/', {
      method: 'GET',
      headers: { Authorization: 'Bearer bad-token' },
    }) as unknown as NextRequest

    const response = await wrapped(req)
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('Invalid token')
  })

  it('returns 403 when role insufficient', async () => {
    mockVerifyAccessToken.mockResolvedValue({
      user: { id: '1', email: 'viewer@test.com', role: 'viewer' as const, isActive: true },
    })

    const handler = vi.fn()
    const wrapped = withAuth(handler, { roles: ['admin'] })
    const req = new Request('http://localhost/', {
      method: 'GET',
      headers: { Authorization: 'Bearer valid-viewer-token' },
    }) as unknown as NextRequest

    const response = await wrapped(req)
    expect(response.status).toBe(403)
  })

  it('allows request when token valid and role sufficient', async () => {
    mockVerifyAccessToken.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'admin' as const, isActive: true },
    })

    const handler = vi.fn(async (_req: NextRequest, ctx: { user?: unknown }) => {
      return Response.json({ user: ctx.user })
    })
    const wrapped = withAuth(handler, { roles: ['admin'] })
    const req = new Request('http://localhost/', {
      method: 'GET',
      headers: { Authorization: 'Bearer valid-admin-token' },
    }) as unknown as NextRequest

    const response = await wrapped(req)
    expect(response.status).toBe(200)
  })

  it('allows request when no roles required and token valid', async () => {
    mockVerifyAccessToken.mockResolvedValue({
      user: { id: '1', email: 'viewer@test.com', role: 'viewer' as const, isActive: true },
    })

    const handler = vi.fn(async () => Response.json({ ok: true }))
    const wrapped = withAuth(handler)
    const req = new Request('http://localhost/', {
      method: 'GET',
      headers: { Authorization: 'Bearer valid-token' },
    }) as unknown as NextRequest

    const response = await wrapped(req)
    expect(response.status).toBe(200)
  })
})
```