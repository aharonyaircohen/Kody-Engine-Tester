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

  it('should clear refresh token on logout', async () => {
    mockPayload.update.mockResolvedValue({ id: 1, refreshToken: null })

    await logout('1', 'token', false, authService)

    expect(mockPayload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'users',
        id: '1',
        data: { refreshToken: null },
      })
    )
  })

  it('should clear refresh token regardless of allDevices flag', async () => {
    mockPayload.update.mockResolvedValue({ id: 1, refreshToken: null })

    await logout('1', 'token', true, authService)

    // With AuthService, allDevices doesn't create separate sessions since it uses JWT rotation
    // Clearing the refresh token invalidates all tokens for this user
    expect(mockPayload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'users',
        id: '1',
        data: { refreshToken: null },
      })
    )
  })
})
