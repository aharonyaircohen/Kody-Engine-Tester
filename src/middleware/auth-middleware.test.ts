import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createAuthMiddleware } from './auth-middleware'
import { AuthService } from '../auth/auth-service'
import { JwtService } from '../auth/jwt-service'

// Mock Payload
const mockPayload = {
  findByID: vi.fn(),
  find: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
}

vi.mock('@/getPayload', () => ({
  getPayloadInstance: vi.fn(() => mockPayload),
}))

const TEST_JWT_SECRET = 'test-secret'

describe('AuthMiddleware', () => {
  let authService: AuthService
  let jwtService: JwtService
  let middleware: ReturnType<typeof createAuthMiddleware>

  beforeEach(() => {
    vi.clearAllMocks()
    jwtService = new JwtService(TEST_JWT_SECRET)
    authService = new AuthService(mockPayload as any, jwtService)
    middleware = createAuthMiddleware(authService)
  })

  async function createValidToken(userId: string, email: string, role: 'admin' | 'editor' | 'viewer' = 'admin') {
    return jwtService.signAccessToken({
      userId,
      email,
      role,
      sessionId: `session-${userId}`,
      generation: 0,
    })
  }

  async function createExpiredToken(userId: string, email: string) {
    return jwtService.sign(
      { userId, email, role: 'admin' as const, sessionId: `session-${userId}`, generation: 0 },
      -1000
    )
  }

  it('should return user context on valid token', async () => {
    const mockUser = {
      id: '123',
      email: 'admin@example.com',
      role: 'admin',
      isActive: true,
    }
    mockPayload.find.mockResolvedValue({ docs: [mockUser] })

    const token = await createValidToken('123', 'admin@example.com', 'admin')
    const result = await middleware({ authorization: `Bearer ${token}`, ip: '127.0.0.1' })

    expect(result.error).toBeUndefined()
    expect(result.user).toBeDefined()
    expect(result.user?.email).toBe('admin@example.com')
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

  it('should return 401 for expired token', async () => {
    const expiredToken = await createExpiredToken('123', 'admin@example.com')
    const result = await middleware({ authorization: `Bearer ${expiredToken}`, ip: '127.0.0.1' })
    expect(result.status).toBe(401)
  })

  it('should return 401 when user not found', async () => {
    mockPayload.find.mockResolvedValue({ docs: [] })

    const token = await createValidToken('nonexistent', 'nobody@example.com')
    const result = await middleware({ authorization: `Bearer ${token}`, ip: '127.0.0.1' })
    expect(result.status).toBe(401)
  })

  it('should return 401 for inactive user', async () => {
    const mockUser = {
      id: '123',
      email: 'admin@example.com',
      role: 'admin',
      isActive: false,
    }
    mockPayload.find.mockResolvedValue({ docs: [mockUser] })

    const token = await createValidToken('123', 'admin@example.com')
    const result = await middleware({ authorization: `Bearer ${token}`, ip: '127.0.0.1' })
    expect(result.status).toBe(401)
  })

  it('should allow requests under rate limit', async () => {
    const mockUser = {
      id: '123',
      email: 'admin@example.com',
      role: 'admin',
      isActive: true,
    }
    mockPayload.find.mockResolvedValue({ docs: [mockUser] })

    const token = await createValidToken('123', 'admin@example.com')
    const result = await middleware({ authorization: `Bearer ${token}`, ip: '10.0.0.1' })
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