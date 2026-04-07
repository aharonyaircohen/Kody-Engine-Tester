import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createAuthMiddleware } from './auth-middleware'
import { JwtService } from '../auth/jwt-service'

// Mock Payload
vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(),
}))

describe('AuthMiddleware', () => {
  let mockPayload: any

  beforeEach(async () => {
    const mockUser = {
      id: 'user-1',
      email: 'admin@example.com',
      role: 'admin' as const,
      isActive: true,
      firstName: 'Admin',
      lastName: 'User',
    }

    mockPayload = {
      find: vi.fn().mockResolvedValue({ docs: [mockUser] }),
      findByID: vi.fn().mockResolvedValue(mockUser),
      update: vi.fn().mockResolvedValue(mockUser),
    }

    const { getPayloadInstance } = await import('@/services/progress')
    ;(getPayloadInstance as any).mockResolvedValue(mockPayload)
  })

  it('should return 401 when no authorization header', async () => {
    const middleware = createAuthMiddleware()
    const result = await middleware({ authorization: undefined, ip: '127.0.0.1' })
    expect(result.status).toBe(401)
    expect(result.error).toBe('Missing or invalid Authorization header')
  })

  it('should return 401 for invalid authorization format', async () => {
    const middleware = createAuthMiddleware()
    const result = await middleware({ authorization: 'InvalidFormat', ip: '127.0.0.1' })
    expect(result.status).toBe(401)
    expect(result.error).toBe('Missing or invalid Authorization header')
  })

  it('should return 401 for invalid token', async () => {
    const middleware = createAuthMiddleware()
    const result = await middleware({ authorization: 'Bearer invalid-token', ip: '127.0.0.1' })
    expect(result.status).toBe(401)
  })

  it('should allow requests under rate limit', async () => {
    const middleware = createAuthMiddleware()
    // Rate limit only applies after many requests; start fresh with a new IP
    const result = await middleware({ authorization: undefined, ip: '10.0.0.1' })
    // Without auth header, it fails with 401 (not rate limit)
    expect(result.status).toBe(401)
  })

  it('should block requests exceeding rate limit', async () => {
    const ip = '192.168.1.100'
    const middleware = createAuthMiddleware()
    // Make 100 requests that all get rejected due to missing auth
    for (let i = 0; i < 100; i++) {
      await middleware({ authorization: undefined, ip })
    }
    const result = await middleware({ authorization: undefined, ip })
    expect(result.status).toBe(429)
  })
})
