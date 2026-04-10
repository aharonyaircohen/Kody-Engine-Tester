import { describe, it, expect, beforeEach, vi } from 'vitest'
import { logout } from './logout'
import { AuthService } from '../../auth/auth-service'
import { JwtService } from '../../auth/jwt-service'
import { generateTestKeyPair } from '../../auth/test-helpers'

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
  let testKeys: { privateKey: string; publicKey: string }

  beforeEach(() => {
    vi.clearAllMocks()
    testKeys = generateTestKeyPair()
    jwtService = new JwtService(testKeys.privateKey, testKeys.publicKey)
    authService = new AuthService(mockPayload as any, jwtService)
  })

  it('should increment tokenVersion and clear refresh token on logout', async () => {
    mockPayload.find.mockResolvedValue({
      docs: [{
        id: 1,
        email: 'admin@example.com',
        role: 'admin',
        refreshToken: 'some_token',
        tokenVersion: 0,
      }],
    })
    mockPayload.update.mockResolvedValue({ id: 1, refreshToken: null, tokenVersion: 1 })

    await logout('1', 'token', false, authService)

    expect(mockPayload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'users',
        id: '1',
        data: expect.objectContaining({
          refreshToken: null,
          tokenVersion: 1,
        }),
      })
    )
  })

  it('should clear refresh token regardless of allDevices flag', async () => {
    mockPayload.find.mockResolvedValue({
      docs: [{
        id: 1,
        email: 'admin@example.com',
        role: 'admin',
        refreshToken: 'some_token',
        tokenVersion: 0,
      }],
    })
    mockPayload.update.mockResolvedValue({ id: 1, refreshToken: null, tokenVersion: 1 })

    await logout('1', 'token', true, authService)

    // With AuthService using tokenVersion-based revocation, clearing refreshToken and
    // incrementing tokenVersion invalidates all tokens for this user
    expect(mockPayload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'users',
        id: '1',
        data: expect.objectContaining({
          refreshToken: null,
          tokenVersion: 1,
        }),
      })
    )
  })
})