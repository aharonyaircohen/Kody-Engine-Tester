import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import type { NextRequest } from 'next/server'

// Mock auth middleware singleton
vi.mock('@/middleware/auth-middleware', () => ({
  getAuthService: vi.fn(),
}))

describe('POST /api/auth/login', () => {
  let mockAuthService: any
  let mockGetAuthService: any

  beforeEach(async () => {
    vi.clearAllMocks()

    mockAuthService = {
      login: vi.fn(),
    }

    const { getAuthService } = await import('@/middleware/auth-middleware')
    mockGetAuthService = getAuthService as any
    mockGetAuthService.mockReturnValue(mockAuthService)
  })

  it('should return tokens on successful login', async () => {
    const mockResult = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: '1', email: 'admin@example.com', role: 'admin' },
    }
    mockAuthService.login.mockResolvedValue(mockResult)

    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'AdminPass1!' }),
    }) as unknown as NextRequest

    const res = await POST(req)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.accessToken).toBe('access-token')
    expect(body.refreshToken).toBe('refresh-token')
  })

  it('should return 400 when email or password is missing', async () => {
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com' }),
    }) as unknown as NextRequest

    const res = await POST(req)

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Email and password are required')
  })

  it('should return 401 on invalid credentials', async () => {
    const error = new Error('Invalid credentials') as Error & { status: number }
    error.status = 401
    mockAuthService.login.mockRejectedValue(error)

    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'wrong' }),
    }) as unknown as NextRequest

    const res = await POST(req)

    expect(res.status).toBe(401)
  })
})
