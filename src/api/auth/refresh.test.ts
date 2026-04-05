import { describe, it, expect, beforeEach, vi } from 'vitest'
import { refresh } from './refresh'
import { AuthService } from '../../auth/auth-service'
import { JwtService } from '../../auth/jwt-service'

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

describe('refresh', () => {
  let authService: AuthService
  let jwtService: JwtService

  beforeEach(() => {
    vi.clearAllMocks()
    jwtService = new JwtService('test-secret')
    authService = new AuthService(mockPayload as any, jwtService)
  })

  it('should return new token pair on valid refresh token', async () => {
    const mockRefreshToken = await jwtService.signRefreshToken({
      userId: '1',
      email: 'user@example.com',
      role: 'viewer',
      sessionId: 'session-1',
      generation: 0,
    })

    const userWithValidToken = {
      id: 1,
      email: 'user@example.com',
      role: 'viewer' as const,
      refreshToken: mockRefreshToken,
      tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
    }

    mockPayload.find.mockResolvedValue({ docs: [userWithValidToken] })
    mockPayload.update.mockResolvedValue({ ...userWithValidToken, refreshToken: 'new_refresh_token' })

    const result = await refresh(mockRefreshToken, authService)

    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()
    expect(result.accessToken).not.toBe(mockRefreshToken)
    expect(result.refreshToken).not.toBe(mockRefreshToken)
  })

  it('should throw on invalid refresh token', async () => {
    await expect(refresh('invalid-token', authService)).rejects.toMatchObject({ status: 401 })
  })

  it('should rotate refresh token', async () => {
    const mockRefreshToken = await jwtService.signRefreshToken({
      userId: '1',
      email: 'user@example.com',
      role: 'viewer',
      sessionId: 'session-1',
      generation: 0,
    })

    const userWithValidToken = {
      id: 1,
      email: 'user@example.com',
      role: 'viewer' as const,
      refreshToken: mockRefreshToken,
      tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
    }

    mockPayload.find.mockResolvedValue({ docs: [userWithValidToken] })
    mockPayload.update.mockResolvedValue({ ...userWithValidToken, refreshToken: 'new_refresh_token' })

    const result = await refresh(mockRefreshToken, authService)

    // Old refresh token should be invalidated
    expect(result.refreshToken).not.toBe(mockRefreshToken)
  })
})
