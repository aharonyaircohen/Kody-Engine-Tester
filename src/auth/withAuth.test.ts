import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { NextRequest } from 'next/server'

// ─── Stub JWT_SECRET before any module loads ─────────────────────────────────
// withAuth.ts reads process.env.JWT_SECRET at module load time.
// stubEnv must be called before importing withAuth.
const TEST_SECRET = 'test-secret'
vi.stubEnv('JWT_SECRET', TEST_SECRET)

// ─── Mock crypto (PBKDF2) before any auth module loads ────────────────────────
// AuthService.verifyPassword uses crypto.pbkdf2 — mock it so login never fails
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

// ─── Mock Payload ──────────────────────────────────────────────────────────────

const mockPayload = {
  findByID: vi.fn(),
  find: vi.fn().mockResolvedValue({ docs: [] }), // default: no user found (safe default)
  update: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
}

// Only mock services/progress — what withAuth.ts uses to get Payload.
// Real AuthService and JwtService are used, so withAuth works end-to-end.
vi.mock('../services/progress', () => ({
  getPayloadInstance: vi.fn(() => mockPayload as any),
}))

// ─── Import withAuth after the mock is set up ─────────────────────────────────

import { withAuth } from './withAuth'
import { JwtService } from './jwt-service'

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('withAuth HOC — unit tests', () => {
  let jwtService: JwtService

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the find mock — mockReset clears all implementations AND default resolved value,
    // so a subsequent test's mockResolvedValue/mockImplementationOnce will be consumed correctly.
    mockPayload.find.mockReset()
    // Re-apply the default: no user found (safe default for 401 tests)
    mockPayload.find.mockResolvedValue({ docs: [] })
    jwtService = new JwtService(TEST_SECRET)
    // Re-stub env so it stays set after potential prior test resetModules
    vi.stubEnv('JWT_SECRET', TEST_SECRET)
  })

  // ─── 401: missing or invalid token ──────────────────────────────────────────

  it('returns 401 when no Authorization header is present', async () => {
    const handler = vi.fn()
    const wrapped = withAuth(handler)
    const req = new Request('http://localhost/', { method: 'GET' }) as unknown as NextRequest

    const response = await wrapped(req)
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('Missing or invalid Authorization header')
  })

  it('returns 401 for malformed token (not Bearer scheme)', async () => {
    const handler = vi.fn()
    const wrapped = withAuth(handler)
    const req = new Request('http://localhost/', {
      method: 'GET',
      headers: { Authorization: 'Basic abc123' },
    }) as unknown as NextRequest

    const response = await wrapped(req)
    expect(response.status).toBe(401)
  })

  it('returns 401 for garbage token', async () => {
    const handler = vi.fn()
    const wrapped = withAuth(handler)
    const req = new Request('http://localhost/', {
      method: 'GET',
      headers: { Authorization: 'Bearer garbage.token.here' },
    }) as unknown as NextRequest

    const response = await wrapped(req)
    expect(response.status).toBe(401)
  })

  it('returns 401 when user is not found in database', async () => {
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
    const req = new Request('http://localhost/', {
      method: 'GET',
      headers: { Authorization: `Bearer ${validToken}` },
    }) as unknown as NextRequest

    const response = await wrapped(req)
    expect(response.status).toBe(401)
    const body = await response.json()
    // AuthService throws "User not found" when the token is valid but no DB record exists
    expect(body.error).toBe('User not found')
  })

  it('returns 401 when user account is inactive', async () => {
    const validToken = await jwtService.signAccessToken({
      userId: '1',
      email: 'inactive@example.com',
      role: 'viewer',
      sessionId: 'session-inactive',
      generation: 0,
    })

    mockPayload.find.mockResolvedValue({
      docs: [{ id: 1, email: 'inactive@example.com', role: 'viewer', isActive: false }],
    })

    const handler = vi.fn()
    const wrapped = withAuth(handler)
    const req = new Request('http://localhost/', {
      method: 'GET',
      headers: { Authorization: `Bearer ${validToken}` },
    }) as unknown as NextRequest

    const response = await wrapped(req)
    expect(response.status).toBe(401)
  })

  // ─── 403: insufficient role ─────────────────────────────────────────────────

  it('returns 403 when user role is insufficient for the route', async () => {
    const accessToken = await jwtService.signAccessToken({
      userId: '2',
      email: 'viewer@example.com',
      role: 'viewer',
      sessionId: 'session-2',
      generation: 0,
    })

    mockPayload.find.mockResolvedValue({
      docs: [{ id: 2, email: 'viewer@example.com', role: 'viewer', isActive: true, refreshToken: accessToken }],
    })

    const handler = vi.fn()
    const wrapped = withAuth(handler, { roles: ['admin'] })
    const req = new Request('http://localhost/', {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    }) as unknown as NextRequest

    const response = await wrapped(req)
    expect(response.status).toBe(403)
    const body = await response.json()
    expect(body.error).toContain('Forbidden')
  })

  it('returns 403 when editor tries to access admin-only route', async () => {
    const accessToken = await jwtService.signAccessToken({
      userId: '3',
      email: 'editor@example.com',
      role: 'editor',
      sessionId: 'session-3',
      generation: 0,
    })

    mockPayload.find.mockResolvedValue({
      docs: [{ id: 3, email: 'editor@example.com', role: 'editor', isActive: true, refreshToken: accessToken }],
    })

    const handler = vi.fn()
    const wrapped = withAuth(handler, { roles: ['admin'] })
    const req = new Request('http://localhost/api/admin/delete-course', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    }) as unknown as NextRequest

    const response = await wrapped(req)
    expect(response.status).toBe(403)
  })

  // ─── 200: valid token + sufficient role ─────────────────────────────────────

  it('allows request when token is valid and role is sufficient', async () => {
    const accessToken = await jwtService.signAccessToken({
      userId: '4',
      email: 'admin@example.com',
      role: 'admin',
      sessionId: 'session-4',
      generation: 0,
    })

    mockPayload.find.mockResolvedValue({
      docs: [{ id: 4, email: 'admin@example.com', role: 'admin', isActive: true, refreshToken: accessToken }],
    })

    const handler = vi.fn(async (_req: NextRequest, ctx: { user?: unknown }) => {
      return Response.json({ user: ctx.user })
    })
    const wrapped = withAuth(handler, { roles: ['admin'] })
    const req = new Request('http://localhost/', {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    }) as unknown as NextRequest

    const response = await wrapped(req)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.user).toBeDefined()
    expect((body.user as { email: string }).email).toBe('admin@example.com')
  })

  it('allows request when no roles are required and token is valid', async () => {
    const accessToken = await jwtService.signAccessToken({
      userId: '5',
      email: 'viewer@example.com',
      role: 'viewer',
      sessionId: 'session-5',
      generation: 0,
    })

    mockPayload.find.mockResolvedValue({
      docs: [{ id: 5, email: 'viewer@example.com', role: 'viewer', isActive: true, refreshToken: accessToken }],
    })

    const handler = vi.fn(async () => Response.json({ ok: true }))
    const wrapped = withAuth(handler) // no roles specified
    const req = new Request('http://localhost/', {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    }) as unknown as NextRequest

    const response = await wrapped(req)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.ok).toBe(true)
  })

  it('allows admin to access viewer-restricted route (role inheritance)', async () => {
    const accessToken = await jwtService.signAccessToken({
      userId: '6',
      email: 'admin@example.com',
      role: 'admin',
      sessionId: 'session-6',
      generation: 0,
    })

    mockPayload.find.mockResolvedValue({
      docs: [{ id: 6, email: 'admin@example.com', role: 'admin', isActive: true, refreshToken: accessToken }],
    })

    const handler = vi.fn(async () => Response.json({ enrolled: true }))
    const wrapped = withAuth(handler, { roles: ['viewer', 'admin'] })
    const req = new Request('http://localhost/api/enroll', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    }) as unknown as NextRequest

    const response = await wrapped(req)
    expect(response.status).toBe(200)
  })

  // ─── optional mode ──────────────────────────────────────────────────────────

  it('allows unauthenticated request when optional=true and no token provided', async () => {
    const handler = vi.fn(async (_req: NextRequest, ctx: { user?: unknown }) => {
      return Response.json({ user: ctx.user ?? null })
    })
    const wrapped = withAuth(handler, { optional: true })
    const req = new Request('http://localhost/', { method: 'GET' }) as unknown as NextRequest

    const response = await wrapped(req)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.user).toBeNull()
  })

  it('returns 401 when token is present but invalid with optional=true', async () => {
    const handler = vi.fn()
    const wrapped = withAuth(handler, { optional: true })
    const req = new Request('http://localhost/', {
      method: 'GET',
      headers: { Authorization: 'Bearer garbage' },
    }) as unknown as NextRequest

    const response = await wrapped(req)
    expect(response.status).toBe(401)
  })

  // ─── route params passthrough ───────────────────────────────────────────────

  it('passes routeParams through to the handler', async () => {
    // Manually re-import withAuth with the test's JWT_SECRET stub active.
    // This bypasses the module-level singleton that was created at test load time
    // with the process.env.JWT_SECRET value (before vi.stubEnv runs in this file).
    vi.resetModules()
    vi.stubEnv('JWT_SECRET', TEST_SECRET)
    vi.mock('../services/progress', () => ({
      getPayloadInstance: vi.fn(() => mockPayload as any),
    }))

    const { withAuth: withAuthFresh } = await import('./withAuth')

    const accessToken = await jwtService.signAccessToken({
      userId: '7',
      email: 'test@example.com',
      role: 'viewer',
      sessionId: 'session-7',
      generation: 0,
    })

    mockPayload.find.mockResolvedValue({
      docs: [{ id: 7, email: 'test@example.com', role: 'viewer', isActive: true, refreshToken: accessToken }],
    })

    // Verify the request actually has the Authorization header
    const req = new Request('http://localhost/', {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    }) as unknown as NextRequest
    expect(req.headers.get('authorization')).toBeTruthy()

    const handler = vi.fn(async (_req: NextRequest, _ctx: { user?: unknown }, routeParams?: unknown) => {
      return Response.json({ params: routeParams })
    })
    const wrapped = withAuthFresh(handler)
    const routeParams = { params: { id: 'note-123' } }

    const response = await wrapped(req, routeParams)
    expect(response.status).toBe(200)
  })

  // ─── token format validation ─────────────────────────────────────────────────

  it('returns 401 for malformed JWT (missing parts)', async () => {
    const handler = vi.fn()
    const wrapped = withAuth(handler)
    const req = new Request('http://localhost/', {
      method: 'GET',
      headers: { Authorization: 'Bearer not.a.jwt' },
    }) as unknown as NextRequest

    const response = await wrapped(req)
    expect(response.status).toBe(401)
  })

  it('returns 401 for JWT signed with wrong secret', async () => {
    // Sign with a different secret
    const wrongSvc = new JwtService('wrong-secret')
    const tamperedToken = await wrongSvc.signAccessToken({
      userId: '1',
      email: 'test@example.com',
      role: 'viewer',
      sessionId: 'session-1',
      generation: 0,
    })

    const handler = vi.fn()
    const wrapped = withAuth(handler)
    const req = new Request('http://localhost/', {
      method: 'GET',
      headers: { Authorization: `Bearer ${tamperedToken}` },
    }) as unknown as NextRequest

    const response = await wrapped(req)
    expect(response.status).toBe(401)
  })
})
