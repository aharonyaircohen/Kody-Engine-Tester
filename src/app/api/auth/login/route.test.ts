import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the login function and auth module before importing the route
vi.mock('@/api/auth/login', () => ({
  login: vi.fn(),
}))

vi.mock('@/auth', () => ({
  userStore: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    verifyPassword: vi.fn(),
    isLocked: vi.fn(),
    recordFailedLogin: vi.fn(),
    resetFailedAttempts: vi.fn(),
    update: vi.fn(),
    ready: Promise.resolve(),
  },
  sessionStore: {
    create: vi.fn(),
    refresh: vi.fn(),
  },
  jwtService: {
    signAccessToken: vi.fn(),
    signRefreshToken: vi.fn(),
    verify: vi.fn(),
  },
}))

import { login } from '@/api/auth/login'
import { POST } from './route'

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with tokens on successful login', async () => {
    const mockResult = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: { id: '1', email: 'test@example.com', role: 'viewer' },
    }
    ;(login as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'Password123!' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')

    const body = await response.json()
    expect(body.accessToken).toBe('mock-access-token')
    expect(body.refreshToken).toBe('mock-refresh-token')
    expect(body.user.email).toBe('test@example.com')
  })

  it('returns 401 for invalid credentials', async () => {
    const error = new Error('Invalid credentials') as Error & { status: number }
    error.status = 401
    ;(login as ReturnType<typeof vi.fn>).mockRejectedValue(error)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'wrong@example.com', password: 'wrongpass' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)

    const body = await response.json()
    expect(body.error).toBe('Invalid credentials')
  })

  it('returns 400 for missing email', async () => {
    const error = new Error('Email and password are required') as Error & { status: number }
    error.status = 400
    ;(login as ReturnType<typeof vi.fn>).mockRejectedValue(error)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'Password123!' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 400 for missing password', async () => {
    const error = new Error('Email and password are required') as Error & { status: number }
    error.status = 400
    ;(login as ReturnType<typeof vi.fn>).mockRejectedValue(error)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 400 for empty body', async () => {
    const error = new Error('Email and password are required') as Error & { status: number }
    error.status = 400
    ;(login as ReturnType<typeof vi.fn>).mockRejectedValue(error)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 500 for unexpected errors', async () => {
    ;(login as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Unexpected error'))

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'Password123!' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(500)

    const body = await response.json()
    expect(body.error).toBe('Unexpected error')
  })
})