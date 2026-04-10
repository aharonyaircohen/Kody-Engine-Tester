import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createAuthMiddleware } from './auth-middleware'
import type { AuthService } from '../auth/auth-service'
import type { AuthenticatedUser } from '../auth/auth-service'

describe('AuthMiddleware', () => {
  let mockAuthService: AuthService
  let middleware: ReturnType<typeof createAuthMiddleware>

  beforeEach(() => {
    mockAuthService = {
      verifyAccessToken: vi.fn(),
    } as unknown as AuthService

    middleware = createAuthMiddleware(mockAuthService)
  })

  it('should attach user to context on valid token', async () => {
    const mockUser: AuthenticatedUser = {
      id: '1',
      email: 'admin@example.com',
      role: 'admin',
      isActive: true,
    }
    ;(mockAuthService.verifyAccessToken as ReturnType<typeof vi.fn>).mockResolvedValue({ user: mockUser })

    const result = await middleware({ authorization: 'Bearer valid-token', ip: '127.0.0.1' })
    expect(result.user?.id).toBe('1')
    expect(result.user?.email).toBe('admin@example.com')
    expect(result.error).toBeUndefined()
  })

  it('should return 401 when no token provided', async () => {
    const result = await middleware({ authorization: undefined, ip: '127.0.0.1' })
    expect(result.status).toBe(401)
    expect(result.error).toBe('Missing or invalid Authorization header')
  })

  it('should return 401 for invalid token', async () => {
    ;(mockAuthService.verifyAccessToken as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Invalid token'))

    const result = await middleware({ authorization: 'Bearer invalid-token', ip: '127.0.0.1' })
    expect(result.status).toBe(401)
    expect(result.error).toBe('Invalid token')
  })

  it('should return 401 for expired token', async () => {
    ;(mockAuthService.verifyAccessToken as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Token expired'))

    const result = await middleware({ authorization: 'Bearer expired-token', ip: '127.0.0.1' })
    expect(result.status).toBe(401)
    expect(result.error).toBe('Token expired')
  })

  it('should allow requests under rate limit', async () => {
    const mockUser: AuthenticatedUser = {
      id: '1',
      email: 'admin@example.com',
      role: 'admin',
      isActive: true,
    }
    ;(mockAuthService.verifyAccessToken as ReturnType<typeof vi.fn>).mockResolvedValue({ user: mockUser })

    const result = await middleware({ authorization: 'Bearer valid-token', ip: '10.0.0.1' })
    expect(result.status).toBeUndefined()
    expect(result.user).toBeDefined()
  })

  it('should block requests exceeding rate limit', async () => {
    const ip = '192.168.1.100'
    // Make 100 requests
    for (let i = 0; i < 100; i++) {
      await middleware({ authorization: undefined, ip })
    }
    const result = await middleware({ authorization: undefined, ip })
    expect(result.status).toBe(429)
  })
})
