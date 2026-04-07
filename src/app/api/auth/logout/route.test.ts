import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import type { NextRequest } from 'next/server'

// Mock auth and middleware
vi.mock('@/auth/withAuth', () => ({
  withAuth: (handler: any) => handler,
}))

vi.mock('@/middleware/auth-middleware', () => ({
  getAuthService: vi.fn(),
  getJwtService: vi.fn(),
}))

describe('POST /api/auth/logout', () => {
  let mockAuthService: any
  let mockJwtService: any
  let mockGetAuthService: any
  let mockGetJwtService: any

  beforeEach(async () => {
    vi.clearAllMocks()

    mockAuthService = {
      logout: vi.fn().mockResolvedValue(undefined),
    }
    mockJwtService = {
      blacklist: vi.fn(),
    }

    const { getAuthService, getJwtService } = await import('@/middleware/auth-middleware')
    mockGetAuthService = getAuthService as any
    mockGetJwtService = getJwtService as any
    mockGetAuthService.mockReturnValue(mockAuthService)
    mockGetJwtService.mockReturnValue(mockJwtService)
  })

  it('should blacklist token and clear refresh token on logout', async () => {
    const mockUser = { id: '1', email: 'admin@example.com', role: 'admin' as const }

    const req = new Request('http://localhost/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-access-token',
      },
      body: JSON.stringify({}),
    }) as unknown as NextRequest

    const res = await POST(req, { user: mockUser })

    expect(res.status).toBe(200)
    expect(mockJwtService.blacklist).toHaveBeenCalledWith('valid-access-token')
    expect(mockAuthService.logout).toHaveBeenCalledWith('1')
  })

  it('should handle logout with allDevices flag', async () => {
    const mockUser = { id: '1', email: 'admin@example.com', role: 'admin' as const }

    const req = new Request('http://localhost/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-access-token',
      },
      body: JSON.stringify({ allDevices: true }),
    }) as unknown as NextRequest

    const res = await POST(req, { user: mockUser })

    expect(res.status).toBe(200)
    expect(mockJwtService.blacklist).toHaveBeenCalled()
    expect(mockAuthService.logout).toHaveBeenCalledWith('1')
  })

  it('should return 500 on error', async () => {
    const mockUser = { id: '1', email: 'admin@example.com', role: 'admin' as const }
    mockAuthService.logout.mockRejectedValue(new Error('DB error'))

    const req = new Request('http://localhost/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-access-token',
      },
      body: JSON.stringify({}),
    }) as unknown as NextRequest

    const res = await POST(req, { user: mockUser })

    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('Logout failed')
  })
})
