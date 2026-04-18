import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { NextRequest } from 'next/server'

// ─── Shared test secret ───────────────────────────────────────────────────────

const TEST_SECRET = 'test-secret-key-for-withauth'

// Stub JWT_SECRET before any modules load so the JwtService singleton uses TEST_SECRET
vi.stubEnv('JWT_SECRET', TEST_SECRET)

// ─── Mock crypto (PBKDF2) before any auth module loads ──────────────────────────
// AuthService.verifyPassword uses crypto.pbkdf2 — mock it so login succeeds
vi.mock('crypto', () => ({
  default: {
    randomBytes: vi.fn(() => Buffer.from('testsalt123')),
    pbkdf2: vi.fn((_pwd, _salt, _iter, _len, _digest, cb) => {
      const fakeHash = Buffer.from('aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899', 'hex')
      cb(null, fakeHash)
    }),
    timingSafeEqual: vi.fn(() => true),
  },
}))

// ─── Shared mock Payload ─────────────────────────────────────────────────────

const mockPayload = {
  findByID: vi.fn(),
  find: vi.fn().mockResolvedValue({ docs: [] }), // default: no user found (safe default)
  update: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
}

// Mock services/progress so withAuth uses our mock Payload
vi.mock('../../src/services/progress', () => ({
  getPayloadInstance: vi.fn(() => mockPayload as any),
}))

// ─── Imports after mocks ─────────────────────────────────────────────────────

import { JwtService } from '../../src/auth/jwt-service'
import { AuthService } from '../../src/auth/auth-service'
import { withAuth } from '../../src/auth/withAuth'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeMockUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    email: 'test@example.com',
    role: 'viewer' as const,
    isActive: true,
    hash: 'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899',
    salt: 'testsalt123',
    refreshToken: null as string | null,
    tokenExpiresAt: null as string | null,
    firstName: 'Test',
    lastName: 'User',
    ...overrides,
  }
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('withAuth HOC — protected route access control', () => {
  let jwtService: JwtService

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the mock implementation so the singleton's cached AuthService picks up fresh setups
    mockPayload.find.mockReset()
    jwtService = new JwtService(TEST_SECRET)
  })

  // ─── 401: missing or invalid token ──────────────────────────────────────────

  describe('401 — missing or invalid token', () => {
    it('returns 401 when no Authorization header is present', async () => {
      const handler = vi.fn(async (_req: NextRequest, ctx: { user?: unknown }) => {
        return Response.json({ ok: true, user: ctx.user })
      })

      const wrapped = withAuth(handler)
      const req = new Request('http://localhost/api/notes', { method: 'POST' }) as unknown as NextRequest

      const response = await wrapped(req)
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Missing or invalid Authorization header')
    })

    it('returns 401 for malformed Authorization header (not Bearer)', async () => {
      const handler = vi.fn()
      const wrapped = withAuth(handler)
      const req = new Request('http://localhost/api/notes', {
        method: 'POST',
        headers: { Authorization: 'Basic abc123' },
      }) as unknown as NextRequest

      const response = await wrapped(req)
      expect(response.status).toBe(401)
    })

    it('returns 401 for garbage token', async () => {
      const handler = vi.fn()
      const wrapped = withAuth(handler)
      const req = new Request('http://localhost/api/notes', {
        method: 'POST',
        headers: { Authorization: 'Bearer garbage-token' },
      }) as unknown as NextRequest

      const response = await wrapped(req)
      expect(response.status).toBe(401)
    })

    it('returns 401 for expired access token', async () => {
      // Create an already-expired token
      const expiredToken = await jwtService.sign(
        {
          userId: '1',
          email: 'test@example.com',
          role: 'viewer' as const,
          sessionId: 'session-1',
          generation: 0,
        },
        -1000 // Already expired
      )

      const handler = vi.fn()
      const wrapped = withAuth(handler)
      const req = new Request('http://localhost/api/notes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${expiredToken}` },
      }) as unknown as NextRequest

      const response = await wrapped(req)
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Token expired')
    })

    it('returns 401 when user is not found in database', async () => {
      // Valid JWT format but user doesn't exist in Payload
      const validToken = await jwtService.signAccessToken({
        userId: '999',
        email: 'ghost@example.com',
        role: 'viewer',
        sessionId: 'session-ghost',
        generation: 0,
      })

      mockPayload.find.mockResolvedValue({ docs: [] }) // user not found

      const handler = vi.fn()
      const wrapped = withAuth(handler)
      const req = new Request('http://localhost/api/notes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${validToken}` },
      }) as unknown as NextRequest

      const response = await wrapped(req)
      expect(response.status).toBe(401)
      const body = await response.json()
      // AuthService throws "User not found" when token is valid but no DB record exists
      expect(body.error).toBe('User not found')
    })
  })

  // ─── 403: insufficient role ─────────────────────────────────────────────────

  describe('403 — insufficient role', () => {
    it('returns 403 when viewer accesses admin-only route', async () => {
      const viewerUser = makeMockUser({ id: 2, role: 'viewer' })
      const accessToken = await jwtService.signAccessToken({
        userId: '2',
        email: 'viewer@example.com',
        role: 'viewer',
        sessionId: 'session-2',
        generation: 0,
      })

      mockPayload.find.mockResolvedValue({
        docs: [{ ...viewerUser, refreshToken: accessToken }],
      })

      const handler = vi.fn(async (_req: NextRequest, ctx: { user?: unknown }) => {
        return Response.json({ success: true, user: ctx.user })
      })

      // Admin-only route
      const wrapped = withAuth(handler, { roles: ['admin'] })
      const req = new Request('http://localhost/api/dashboard/admin-stats', {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      }) as unknown as NextRequest

      const response = await wrapped(req)
      expect(response.status).toBe(403)
      const body = await response.json()
      expect(body.error).toContain('Forbidden')
    })

    it('returns 403 when viewer tries to create notes (admin/editor required)', async () => {
      const viewerUser = makeMockUser({ id: 3, role: 'viewer' })
      const accessToken = await jwtService.signAccessToken({
        userId: '3',
        email: 'viewer@example.com',
        role: 'viewer',
        sessionId: 'session-3',
        generation: 0,
      })

      mockPayload.find.mockResolvedValue({ docs: [{ ...viewerUser, refreshToken: accessToken }] })

      const handler = vi.fn()
      const wrapped = withAuth(handler, { roles: ['admin', 'editor'] })
      const req = new Request('http://localhost/api/notes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      }) as unknown as NextRequest

      const response = await wrapped(req)
      expect(response.status).toBe(403)
    })

    it('returns 403 when editor tries to delete notes (admin only)', async () => {
      const editorUser = makeMockUser({ id: 4, role: 'editor' })
      const accessToken = await jwtService.signAccessToken({
        userId: '4',
        email: 'editor@example.com',
        role: 'editor',
        sessionId: 'session-4',
        generation: 0,
      })

      mockPayload.find.mockResolvedValue({ docs: [{ ...editorUser, refreshToken: accessToken }] })

      const handler = vi.fn()
      const wrapped = withAuth(handler, { roles: ['admin'] })
      const req = new Request('http://localhost/api/notes/123', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      }) as unknown as NextRequest

      const response = await wrapped(req)
      expect(response.status).toBe(403)
    })
  })

  // ─── 200: valid token + sufficient role ─────────────────────────────────────

  describe('200 — valid token with sufficient role', () => {
    it('allows admin to access admin-only route', async () => {
      const adminUser = makeMockUser({ id: 5, role: 'admin' })
      const accessToken = await jwtService.signAccessToken({
        userId: '5',
        email: 'admin@example.com',
        role: 'admin',
        sessionId: 'session-5',
        generation: 0,
      })

      mockPayload.find.mockResolvedValue({ docs: [{ ...adminUser, refreshToken: accessToken }] })

      const handler = vi.fn(async (_req: NextRequest, ctx: { user?: unknown }) => {
        return Response.json({ userId: (ctx.user as { id: unknown })?.id })
      })

      const wrapped = withAuth(handler, { roles: ['admin'] })
      const req = new Request('http://localhost/api/dashboard/admin-stats', {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      }) as unknown as NextRequest

      const response = await wrapped(req)
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.userId).toBe(5)
    })

    it('allows editor to create notes (admin/editor allowed)', async () => {
      const editorUser = makeMockUser({ id: 6, role: 'editor' })
      const accessToken = await jwtService.signAccessToken({
        userId: '6',
        email: 'editor@example.com',
        role: 'editor',
        sessionId: 'session-6',
        generation: 0,
      })

      mockPayload.find.mockResolvedValue({ docs: [{ ...editorUser, refreshToken: accessToken }] })

      const handler = vi.fn(async (_req: NextRequest, ctx: { user?: unknown }) => {
        return Response.json({ created: true, user: ctx.user })
      })

      const wrapped = withAuth(handler, { roles: ['admin', 'editor'] })
      const req = new Request('http://localhost/api/notes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      }) as unknown as NextRequest

      const response = await wrapped(req)
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.created).toBe(true)
    })

    it('allows viewer to enroll (viewer/admin allowed)', async () => {
      const viewerUser = makeMockUser({ id: 7, role: 'viewer' })
      const accessToken = await jwtService.signAccessToken({
        userId: '7',
        email: 'viewer@example.com',
        role: 'viewer',
        sessionId: 'session-7',
        generation: 0,
      })

      mockPayload.find.mockResolvedValue({ docs: [{ ...viewerUser, refreshToken: accessToken }] })

      const handler = vi.fn(async () => Response.json({ enrolled: true }))
      const wrapped = withAuth(handler, { roles: ['viewer', 'admin'] })
      const req = new Request('http://localhost/api/enroll', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      }) as unknown as NextRequest

      const response = await wrapped(req)
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.enrolled).toBe(true)
    })

    it('allows admin to enroll (role inheritance — admin >= viewer)', async () => {
      const adminUser = makeMockUser({ id: 8, role: 'admin' })
      const accessToken = await jwtService.signAccessToken({
        userId: '8',
        email: 'admin@example.com',
        role: 'admin',
        sessionId: 'session-8',
        generation: 0,
      })

      mockPayload.find.mockResolvedValue({ docs: [{ ...adminUser, refreshToken: accessToken }] })

      const handler = vi.fn(async () => Response.json({ enrolled: true }))
      const wrapped = withAuth(handler, { roles: ['viewer', 'admin'] })
      const req = new Request('http://localhost/api/enroll', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      }) as unknown as NextRequest

      const response = await wrapped(req)
      expect(response.status).toBe(200)
    })

    it('allows access when no role restrictions are set (any authenticated user)', async () => {
      const viewerUser = makeMockUser({ id: 9, role: 'viewer' })
      const accessToken = await jwtService.signAccessToken({
        userId: '9',
        email: 'viewer@example.com',
        role: 'viewer',
        sessionId: 'session-9',
        generation: 0,
      })

      mockPayload.find.mockResolvedValue({ docs: [{ ...viewerUser, refreshToken: accessToken }] })

      const handler = vi.fn(async () => Response.json({ ok: true }))
      const wrapped = withAuth(handler) // no roles specified
      const req = new Request('http://localhost/api/notes', {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      }) as unknown as NextRequest

      const response = await wrapped(req)
      expect(response.status).toBe(200)
    })
  })

  // ─── optional mode ──────────────────────────────────────────────────────────

  describe('optional — token not required', () => {
    it('allows request without token when optional=true', async () => {
      const handler = vi.fn(async (_req: NextRequest, ctx: { user?: unknown }) => {
        return Response.json({ user: ctx.user ?? null })
      })

      const wrapped = withAuth(handler, { optional: true })
      const req = new Request('http://localhost/api/notes', { method: 'GET' }) as unknown as NextRequest

      const response = await wrapped(req)
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.user).toBeNull()
    })

    it('still validates token if present when optional=true', async () => {
      const handler = vi.fn()
      const wrapped = withAuth(handler, { optional: true })
      const req = new Request('http://localhost/api/notes', {
        method: 'GET',
        headers: { Authorization: 'Bearer garbage' },
      }) as unknown as NextRequest

      const response = await wrapped(req)
      expect(response.status).toBe(401)
    })
  })

  // ─── Full auth flow ─────────────────────────────────────────────────────────

  describe('full auth flow — login → protected route → refresh → logout', () => {
    it('complete flow works end-to-end', async () => {
      // ── Step 1: Login ────────────────────────────────────────────────────────
      const userInDb = {
        id: 99,
        email: 'newuser@example.com',
        role: 'viewer' as const,
        isActive: true,
        hash: 'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899',
        salt: 'testsalt123',
        refreshToken: null as string | null,
        tokenExpiresAt: null as string | null,
      }

      // First call: user lookup during login
      mockPayload.find.mockResolvedValueOnce({ docs: [userInDb] })
      mockPayload.update.mockImplementation(async ({ data }: { data: { refreshToken: string } }) => ({
        ...userInDb,
        ...data,
      }))

      const authService = new AuthService(mockPayload as any, jwtService)

      const loginResult = await authService.login('newuser@example.com', 'Password1!', '127.0.0.1', 'TestAgent')

      expect(loginResult.accessToken).toBeDefined()
      expect(loginResult.refreshToken).toBeDefined()
      expect(loginResult.user.role).toBe('viewer')
      expect(loginResult.user.email).toBe('newuser@example.com')

      // Verify update was called to store refresh token
      expect(mockPayload.update).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'users',
          id: 99,
          data: expect.objectContaining({ refreshToken: expect.any(String) }),
        })
      )

      // ── Step 2: Access protected route with valid token ─────────────────────
      mockPayload.find.mockResolvedValueOnce({
        docs: [{ ...userInDb, refreshToken: loginResult.refreshToken }],
      })

      const handler = vi.fn(async (_req: NextRequest, ctx: { user?: unknown }) => {
        return Response.json({ accessed: true, userId: (ctx.user as { id: unknown })?.id })
      })

      const wrapped = withAuth(handler, { roles: ['viewer', 'admin'] })
      const req = new Request('http://localhost/api/enroll', {
        method: 'POST',
        headers: { Authorization: `Bearer ${loginResult.accessToken}` },
      }) as unknown as NextRequest

      const accessResponse = await wrapped(req)
      expect(accessResponse.status).toBe(200)
      const accessBody = await accessResponse.json()
      expect(accessBody.accessed).toBe(true)

      // ── Step 3: Refresh token ─────────────────────────────────────────────
      const freshUser = {
        ...userInDb,
        refreshToken: loginResult.refreshToken,
        tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }

      mockPayload.find.mockResolvedValueOnce({ docs: [freshUser] })
      mockPayload.update.mockImplementation(async ({ data }: { data: { refreshToken: string } }) => ({
        ...freshUser,
        ...data,
      }))

      const refreshResult = await authService.refresh(loginResult.refreshToken)
      expect(refreshResult.accessToken).toBeDefined()
      expect(refreshResult.refreshToken).toBeDefined()
      expect(refreshResult.refreshToken).not.toBe(loginResult.refreshToken) // rotated

      // ── Step 4: Logout invalidates session ─────────────────────────────────
      await authService.logout(99)

      expect(mockPayload.update).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'users',
          id: 99,
          data: { refreshToken: null },
        })
      )

      // ── Step 5: Attempt to use old refresh token after logout ───────────────
      mockPayload.find.mockResolvedValueOnce({
        docs: [{ ...freshUser, refreshToken: null }],
      })

      await expect(authService.refresh(loginResult.refreshToken)).rejects.toThrow('Invalid refresh token')
    })
  })
})
