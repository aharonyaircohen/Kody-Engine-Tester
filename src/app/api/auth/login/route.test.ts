import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'
import type { AuthService } from '@/auth/auth-service'

// Build a mock AuthService instance from a given loginImpl factory
function buildMockAuthService(loginImpl: (email: string, password: string) => Promise<unknown>): AuthService {
  return {
    login: loginImpl as AuthService['login'],
    refresh: vi.fn(),
    verifyAccessToken: vi.fn(),
    logout: vi.fn(),
  } as unknown as AuthService
}

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-18T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const buildRequest = (body: unknown) =>
    new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

  // ─── Input validation ─────────────────────────────────────────────────────

  it('returns 400 when email is missing', async () => {
    const authService = buildMockAuthService(async () => ({ accessToken: '', refreshToken: '', user: { id: 1, email: '', role: 'viewer' } }))
    const response = await POST(buildRequest({ password: 'password123' }), { authService })
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toMatch(/email/i)
  })

  it('returns 400 when password is missing', async () => {
    const authService = buildMockAuthService(async () => ({ accessToken: '', refreshToken: '', user: { id: 1, email: '', role: 'viewer' } }))
    const response = await POST(buildRequest({ email: 'test@example.com' }), { authService })
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toMatch(/password/i)
  })

  it('returns 400 when body is empty object', async () => {
    const authService = buildMockAuthService(async () => ({ accessToken: '', refreshToken: '', user: { id: 1, email: '', role: 'viewer' } }))
    const response = await POST(buildRequest({}), { authService })
    expect(response.status).toBe(400)
  })

  it('returns 400 when email is not a string', async () => {
    const authService = buildMockAuthService(async () => ({ accessToken: '', refreshToken: '', user: { id: 1, email: '', role: 'viewer' } }))
    const response = await POST(
      new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 123, password: 'password123' }),
      }),
      { authService }
    )
    expect(response.status).toBe(400)
  })

  // ─── Authentication ────────────────────────────────────────────────────────

  it('returns 401 when email is not found', async () => {
    const error = new Error('Invalid credentials') as Error & { status: number }
    error.status = 401
    const authService = buildMockAuthService(async () => { throw error })
    const response = await POST(buildRequest({ email: 'notfound@example.com', password: 'password123' }), { authService })
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toMatch(/invalid credentials/i)
  })

  it('returns 401 when password is incorrect', async () => {
    const error = new Error('Invalid credentials') as Error & { status: number }
    error.status = 401
    const authService = buildMockAuthService(async () => { throw error })
    const response = await POST(buildRequest({ email: 'test@example.com', password: 'wrongpassword' }), { authService })
    expect(response.status).toBe(401)
  })

  it('returns 200 with tokens when credentials are valid', async () => {
    const authService = buildMockAuthService(async () => ({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: { id: 1, email: 'test@example.com', role: 'viewer' },
    }))
    const response = await POST(buildRequest({ email: 'test@example.com', password: 'password123' }), { authService })
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('accessToken', 'mock-access-token')
    expect(body).toHaveProperty('refreshToken', 'mock-refresh-token')
    expect(body.user.email).toBe('test@example.com')
  })

  it('returns 401 when user has no hash field', async () => {
    const error = new Error('Invalid credentials') as Error & { status: number }
    error.status = 401
    const authService = buildMockAuthService(async () => { throw error })
    const response = await POST(buildRequest({ email: 'test@example.com', password: 'password123' }), { authService })
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toMatch(/invalid credentials/i)
  })

  it('returns 403 when account is inactive', async () => {
    const error = new Error('Account is inactive') as Error & { status: number }
    error.status = 403
    const authService = buildMockAuthService(async () => { throw error })
    const response = await POST(buildRequest({ email: 'test@example.com', password: 'password123' }), { authService })
    expect(response.status).toBe(403)
  })
})
