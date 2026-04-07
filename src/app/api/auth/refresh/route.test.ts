import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import type { NextRequest } from 'next/server'

// Mock auth middleware singleton
vi.mock('@/middleware/auth-middleware', () => ({
  getAuthService: vi.fn(),
}))

describe('POST /api/auth/refresh', () => {
  let mockAuthService: any
  let mockGetAuthService: any

  beforeEach(async () => {
    vi.clearAllMocks()

    mockAuthService = {
      refresh: vi.fn(),
    }

    const { getAuthService } = await import('@/middleware/auth-middleware')
    mockGetAuthService = getAuthService as any
    mockGetAuthService.mockReturnValue(mockAuthService)
  })

  it('should return new tokens on valid refresh', async () => {
    const mockResult = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    }
    mockAuthService.refresh.mockResolvedValue(mockResult)

    const req = new Request('http://localhost/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
    }) as unknown as NextRequest

    const res = await POST(req)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.accessToken).toBe('new-access-token')
    expect(body.refreshToken).toBe('new-refresh-token')
  })

  it('should return 400 when refreshToken is missing', async () => {
    const req = new Request('http://localhost/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }) as unknown as NextRequest

    const res = await POST(req)

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Refresh token is required')
  })

  it('should return 401 on invalid refresh token', async () => {
    const error = new Error('Invalid or expired refresh token') as Error & { status: number }
    error.status = 401
    mockAuthService.refresh.mockRejectedValue(error)

    const req = new Request('http://localhost/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: 'invalid-token' }),
    }) as unknown as NextRequest

    const res = await POST(req)

    expect(res.status).toBe(401)
  })
})
