import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'
import type { AuthService } from '@/auth/auth-service'

// Build a mock AuthService instance
function buildMockAuthService(
  loginImpl: (email: string, password: string) => Promise<unknown>
): AuthService {
  return {
    login: loginImpl as AuthService['login'],
    refresh: vi.fn(),
    verifyAccessToken: vi.fn(),
    logout: vi.fn(),
  } as unknown as AuthService
}

// Build a mock Payload instance
function buildMockPayload(overrides?: {
  findResult?: unknown[]
  createResult?: unknown
  deleteResult?: unknown
}) {
  return {
    find: vi.fn().mockResolvedValue({ docs: overrides?.findResult ?? [] }),
    create: vi.fn().mockResolvedValue(overrides?.createResult ?? { id: 1, email: 'new@example.com', role: 'viewer' }),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue(overrides?.deleteResult ?? {}),
  }
}

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-18T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const buildRequest = (body: unknown) =>
    new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

  // ─── Input validation ─────────────────────────────────────────────────────

  it('returns 400 when email is missing', async () => {
    const mockPayload = buildMockPayload()
    const authService = buildMockAuthService(async () => ({ accessToken: '', refreshToken: '', user: { id: 1, email: '', role: 'viewer' } }))
    const response = await POST(buildRequest({ password: 'password123' }), { authService, payloadInstance: mockPayload as any })
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toMatch(/email/i)
  })

  it('returns 400 when password is missing', async () => {
    const mockPayload = buildMockPayload()
    const authService = buildMockAuthService(async () => ({ accessToken: '', refreshToken: '', user: { id: 1, email: '', role: 'viewer' } }))
    const response = await POST(buildRequest({ email: 'new@example.com' }), { authService, payloadInstance: mockPayload as any })
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toMatch(/password/i)
  })

  it('returns 400 when body is empty object', async () => {
    const mockPayload = buildMockPayload()
    const authService = buildMockAuthService(async () => ({ accessToken: '', refreshToken: '', user: { id: 1, email: '', role: 'viewer' } }))
    const response = await POST(buildRequest({}), { authService, payloadInstance: mockPayload as any })
    expect(response.status).toBe(400)
  })

  it('returns 400 when email is not a string', async () => {
    const mockPayload = buildMockPayload()
    const authService = buildMockAuthService(async () => ({ accessToken: '', refreshToken: '', user: { id: 1, email: '', role: 'viewer' } }))
    const response = await POST(
      new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 123, password: 'password123' }),
      }),
      { authService, payloadInstance: mockPayload as any }
    )
    expect(response.status).toBe(400)
  })

  // ─── Password validation ──────────────────────────────────────────────────

  it('returns 400 when password is too short', async () => {
    const mockPayload = buildMockPayload({ findResult: [] })
    const authService = buildMockAuthService(async () => ({ accessToken: '', refreshToken: '', user: { id: 1, email: '', role: 'viewer' } }))
    const response = await POST(buildRequest({ email: 'new@example.com', password: 'short' }), { authService, payloadInstance: mockPayload as any })
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toMatch(/password/i)
  })

  // ─── confirmPassword validation ────────────────────────────────────────────

  it('returns 400 when confirmPassword does not match password', async () => {
    const mockPayload = buildMockPayload({ findResult: [] })
    const authService = buildMockAuthService(async () => ({ accessToken: '', refreshToken: '', user: { id: 1, email: '', role: 'viewer' } }))
    const response = await POST(
      buildRequest({ email: 'new@example.com', password: 'password123', confirmPassword: 'different' }),
      { authService, payloadInstance: mockPayload as any }
    )
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toMatch(/match/i)
  })

  it('returns 201 when confirmPassword matches password', async () => {
    const mockPayload = buildMockPayload({
      findResult: [],
      createResult: { id: 2, email: 'new@example.com', role: 'viewer', isActive: true },
    })
    const authService = buildMockAuthService(async () => ({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: { id: 2, email: 'new@example.com', role: 'viewer' },
    }))
    const response = await POST(
      buildRequest({ email: 'new@example.com', password: 'password123', confirmPassword: 'password123' }),
      { authService, payloadInstance: mockPayload as any }
    )
    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body).toHaveProperty('accessToken', 'mock-access-token')
    expect(body).toHaveProperty('refreshToken', 'mock-refresh-token')
    expect(body.user.email).toBe('new@example.com')
  })

  // ─── Duplicate email ───────────────────────────────────────────────────────

  it('returns 409 when email already exists', async () => {
    const mockPayload = buildMockPayload({
      findResult: [{ id: 1, email: 'existing@example.com', role: 'viewer' }],
    })
    const authService = buildMockAuthService(async () => ({ accessToken: '', refreshToken: '', user: { id: 1, email: '', role: 'viewer' } }))
    const response = await POST(
      buildRequest({ email: 'existing@example.com', password: 'password123' }),
      { authService, payloadInstance: mockPayload as any }
    )
    expect(response.status).toBe(409)
    const body = await response.json()
    expect(body.error).toMatch(/email.*already/i)
  })

  // ─── Successful registration ──────────────────────────────────────────────

  it('returns 201 with tokens on valid registration', async () => {
    const mockPayload = buildMockPayload({
      findResult: [],
      createResult: { id: 2, email: 'newuser@example.com', role: 'viewer', isActive: true },
    })
    const authService = buildMockAuthService(async () => ({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: { id: 2, email: 'newuser@example.com', role: 'viewer' },
    }))
    const response = await POST(
      buildRequest({ email: 'newuser@example.com', password: 'password123' }),
      { authService, payloadInstance: mockPayload as any }
    )
    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body).toHaveProperty('accessToken', 'mock-access-token')
    expect(body).toHaveProperty('refreshToken', 'mock-refresh-token')
    expect(body.user.email).toBe('newuser@example.com')
    expect(body.user.role).toBe('viewer')
  })

  it('creates user with hashed password and viewer role', async () => {
    const mockPayload = buildMockPayload({
      findResult: [],
      createResult: { id: 2, email: 'newuser@example.com', role: 'viewer', isActive: true },
    })
    const authService = buildMockAuthService(async () => ({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: { id: 2, email: 'newuser@example.com', role: 'viewer' },
    }))
    await POST(
      buildRequest({ email: 'newuser@example.com', password: 'password123' }),
      { authService, payloadInstance: mockPayload as any }
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createCall = (mockPayload.create as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(createCall.collection).toBe('users')
    expect(createCall.data.email).toBe('newuser@example.com')
    expect(createCall.data.role).toBe('viewer')
    expect(typeof createCall.data.salt).toBe('string')
    expect(typeof createCall.data.hash).toBe('string')
    expect(createCall.data.isActive).toBe(true)
  })
})
