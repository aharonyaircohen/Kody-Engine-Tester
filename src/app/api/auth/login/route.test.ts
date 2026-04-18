import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockLogin = vi.fn()
const mockGetAuthService = vi.fn<() => { login: typeof mockLogin }>().mockReturnValue({
  login: mockLogin,
} as unknown as { login: typeof mockLogin })

vi.mock('@/auth/withAuth', () => ({
  getAuthService: mockGetAuthService,
}))

vi.mock('@/auth/auth-service', () => ({
  AuthService: vi.fn(),
}))

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-18T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns 200 and tokens on valid credentials', async () => {
    const authResult = {
      accessToken: 'access-token-value',
      refreshToken: 'refresh-token-value',
      user: { id: 1, email: 'admin@example.com', role: 'admin' as const },
    }
    mockLogin.mockResolvedValue(authResult)

    const { POST } = await import('./route')

    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'password123' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(authResult)
  })

  it('returns 400 when email is missing', async () => {
    const err = new Error('Email is required') as Error & { status: number }
    err.status = 400
    mockLogin.mockRejectedValue(err)

    const { POST } = await import('./route')

    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'password123' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Email is required' })
  })

  it('returns 401 on invalid credentials', async () => {
    const err = new Error('Invalid credentials') as Error & { status: number }
    err.status = 401
    mockLogin.mockRejectedValue(err)

    const { POST } = await import('./route')

    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'wrongpassword' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Invalid credentials' })
  })

  it('returns 400 when password is missing', async () => {
    const err = new Error('Password is required') as Error & { status: number }
    err.status = 400
    mockLogin.mockRejectedValue(err)

    const { POST } = await import('./route')

    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Password is required' })
  })

  it('returns 403 for inactive account', async () => {
    const err = new Error('Account is inactive') as Error & { status: number }
    err.status = 403
    mockLogin.mockRejectedValue(err)

    const { POST } = await import('./route')

    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'inactive@example.com', password: 'password123' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({ error: 'Account is inactive' })
  })
})
