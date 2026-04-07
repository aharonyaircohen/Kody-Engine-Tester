import { describe, it, expect, beforeEach, vi } from 'vitest'
import { logout } from './logout'
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

describe('logout', () => {
  let authService: AuthService
  let jwtService: JwtService

  beforeEach(() => {
    vi.clearAllMocks()
    jwtService = new JwtService('test-secret')
    authService = new AuthService(mockPayload as any, jwtService)
  })

  it('should blacklist the access token on logout', async () => {
    mockPayload.update.mockResolvedValue({ id: 1, refreshToken: null })

    // Create a valid signed token
    const token = await jwtService.signAccessToken({
      userId: '1',
      email: 'test@example.com',
      role: 'admin',
      sessionId: 'session-1',
      generation: 0,
    })
    await logout('1', token, false, authService, jwtService)

    // Verify the token was blacklisted - verify() is async
    await expect(jwtService.verify(token)).rejects.toThrow('Token revoked')
  })

  it('should clear refresh token on logout', async () => {
    mockPayload.update.mockResolvedValue({ id: 1, refreshToken: null })

    await logout('1', 'token', false, authService, jwtService)

    expect(mockPayload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'users',
        id: '1',
        data: { refreshToken: null },
      })
    )
  })

  it('should call authService.logout when allDevices is true', async () => {
    mockPayload.update.mockResolvedValue({ id: 1, refreshToken: null })

    await logout('1', 'token', true, authService, jwtService)

    // authService.logout is called to clear all tokens
    expect(mockPayload.update).toHaveBeenCalled()
  })

  it('should blacklist token even when allDevices is false', async () => {
    mockPayload.update.mockResolvedValue({ id: 1, refreshToken: null })

    const token = await jwtService.signAccessToken({
      userId: '1',
      email: 'test@example.com',
      role: 'admin',
      sessionId: 'session-1',
      generation: 0,
    })
    await logout('1', token, false, authService, jwtService)

    // Token should still be blacklisted
    await expect(jwtService.verify(token)).rejects.toThrow('Token revoked')
  })
})
