import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createAuthMiddleware } from './auth-middleware'
import type { AuthService, AuthenticatedUser } from '../auth/auth-service'

describe('AuthMiddleware', () => {
  let mockAuthService: AuthService
  let middleware: ReturnType<typeof createAuthMiddleware>

  beforeEach(() => {
    mockAuthService = {
      login: vi.fn(),
      refresh: vi.fn(),
      verifyAccessToken: vi.fn(),
      logout: vi.fn(),
    } as unknown as AuthService

    middleware = createAuthMiddleware(mockAuthService)
  })

  const mockUser: AuthenticatedUser = {
    id: '1',
    email: 'admin@example.com',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    isActive: true,
  }

  it('should attach user to context on valid token', async () => {
    mockAuthService.verifyAccessToken = vi.fn().mockResolvedValue({ user: mockUser })

    const result = await middleware({ authorization: 'Bearer valid-token', ip: '127.0.0.1' })

    expect(result.user?.id).toBe(mockUser.id)
    expect(result.user?.email).toBe(mockUser.email)
    expect(result.error).toBeUndefined()
  })

  it('should return 401 when no token provided', async () => {
    const result = await middleware({ authorization: undefined, ip: '127.0.0.1' })
    expect(result.status).toBe(401)
    expect(result.error).toBe('Missing or invalid Authorization header')
  })

  it('should return 401 for invalid token', async () => {
    const error = new Error('Invalid token')
    mockAuthService.verifyAccessToken = vi.fn().mockRejectedValue(error)

    const result = await middleware({ authorization: 'Bearer invalid-token', ip: '127.0.0.1' })
    expect(result.status).toBe(401)
    expect(result.error).toBe('Invalid token')
  })

  it('should return 401 when verifyAccessToken returns no user', async () => {
    mockAuthService.verifyAccessToken = vi.fn().mockResolvedValue({ user: undefined })

    const result = await middleware({ authorization: 'Bearer valid-token', ip: '127.0.0.1' })
    expect(result.status).toBe(401)
    expect(result.error).toBe('User not found')
  })

  it('should allow requests under rate limit', async () => {
    mockAuthService.verifyAccessToken = vi.fn().mockResolvedValue({ user: mockUser })

    const result = await middleware({ authorization: 'Bearer valid-token', ip: '10.0.0.1' })
    expect(result.status).toBeUndefined()
    expect(result.user).toBeDefined()
  })

  it('should block requests exceeding rate limit', async () => {
    const ip = '192.168.1.100'
    // Make 100 requests to exhaust rate limit
    for (let i = 0; i < 100; i++) {
      await middleware({ authorization: undefined, ip })
    }
    const result = await middleware({ authorization: undefined, ip })
    expect(result.status).toBe(429)
    expect(result.error).toBe('Too many requests')
  })
})