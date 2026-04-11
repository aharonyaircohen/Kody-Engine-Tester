import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Create mock login function
const mockLogin = vi.fn()

// Mock the entire auth-service module with a class-like structure
vi.mock('@/auth/auth-service', () => {
  return {
    AuthService: vi.fn().mockImplementation(function() {
      return {
        login: mockLogin,
      }
    }),
  }
})

// Mock getJwtService to return a mock
vi.mock('@/auth', () => ({
  getJwtService: vi.fn(() => ({
    verify: vi.fn(),
    signAccessToken: vi.fn(),
    signRefreshToken: vi.fn(),
  })),
}))

// Mock getPayloadInstance
vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(() => Promise.resolve({})),
}))

// Import POST after mocks are set up
import { POST } from './route'

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with tokens on valid credentials', async () => {
    const mockResult = {
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-123',
      user: { id: 1, email: 'test@example.com', role: 'viewer' },
    }
    mockLogin.mockResolvedValueOnce(mockResult)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'Password123!' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('accessToken')
    expect(body).toHaveProperty('refreshToken')
    expect(body.user.email).toBe('test@example.com')
  })

  it('returns 401 on invalid credentials', async () => {
    const error = new Error('Invalid credentials') as Error & { status: number }
    error.status = 401
    mockLogin.mockRejectedValueOnce(error)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'WrongPassword!' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })

  it('returns 401 on nonexistent user', async () => {
    const error = new Error('Invalid credentials') as Error & { status: number }
    error.status = 401
    mockLogin.mockRejectedValueOnce(error)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@example.com', password: 'Password123!' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })

  it('returns 400 on missing email', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'Password123!' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })

  it('returns 400 on missing password', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })

  it('returns 400 on empty credentials', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })
})