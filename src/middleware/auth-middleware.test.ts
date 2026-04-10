import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createAuthMiddleware } from './auth-middleware'
import { JwtService } from '../auth/jwt-service'
import { AuthService } from '../auth/auth-service'

vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(() => mockPayload),
}))

const mockPayload = { find: vi.fn(), update: vi.fn() }
const mockJwtService = new JwtService('test-secret')

vi.spyOn(AuthService.prototype, 'verifyAccessToken')

describe('AuthMiddleware', () => {
  let middleware: ReturnType<typeof createAuthMiddleware>

  beforeEach(() => {
    vi.clearAllMocks()
    middleware = createAuthMiddleware(mockJwtService)
  })

  it('should return 401 when no token provided', async () => {
    const result = await middleware({ authorization: undefined, ip: '127.0.0.1' })
    expect(result.status).toBe(401)
    expect(result.error).toBeDefined()
  })

  it('should return 401 for invalid token', async () => {
    const result = await middleware({ authorization: 'Bearer invalid-token', ip: '127.0.0.1' })
    expect(result.status).toBe(401)
    expect(result.error).toBeDefined()
  })

  it('should allow requests under rate limit', async () => {
    ;(AuthService.prototype.verifyAccessToken as ReturnType<typeof vi.spyOn>).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com', role: 'admin' as const, isActive: true },
    })
    const token = await mockJwtService.signAccessToken({
      userId: '1',
      email: 'admin@example.com',
      role: 'admin',
      sessionId: 'session-1',
      generation: 0,
    })
    const result = await middleware({ authorization: `Bearer ${token}`, ip: '10.0.0.1' })
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
  })
})
