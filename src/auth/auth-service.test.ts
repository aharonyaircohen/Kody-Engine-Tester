import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthService, type AuthResult } from './auth-service'
import { JwtService } from './jwt-service'

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

const TEST_JWT_SECRET = 'test-secret-key-for-auth-service'

// Default implementations
const defaultHash = Buffer.from('aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899', 'hex')
const defaultSalt = Buffer.from('testsalt123')

// Use vi.hoisted to create mock functions that are properly hoisted with vi.mock
const { mockPbkdf2, mockRandomBytes, mockTimingSafeEqual } = vi.hoisted(() => ({
  mockPbkdf2: vi.fn((password: unknown, salt: unknown, iterations: unknown, keylen: unknown, digest: unknown, callback: (err: Error | null, derivedKey?: Buffer) => void) => {
    callback(null, defaultHash)
  }),
  mockRandomBytes: vi.fn((bytes: number) => {
    return defaultSalt
  }),
  mockTimingSafeEqual: vi.fn((a: Buffer, b: Buffer) => {
    return a.length === b.length
  }),
}))

// Mock crypto module for password verification tests
vi.mock('crypto', () => ({
  default: {
    pbkdf2: mockPbkdf2,
    randomBytes: mockRandomBytes,
    timingSafeEqual: mockTimingSafeEqual,
  },
}))

describe('AuthService', () => {
  let authService: AuthService
  let jwtService: JwtService

  beforeEach(() => {
    vi.clearAllMocks()
    jwtService = new JwtService(TEST_JWT_SECRET)
    authService = new AuthService(mockPayload as any, jwtService)
    // Reset crypto mocks to default implementations
    mockPbkdf2.mockImplementation((password: unknown, salt: unknown, iterations: unknown, keylen: unknown, digest: unknown, callback: (err: Error | null, derivedKey?: Buffer) => void) => {
      callback(null, defaultHash)
    })
    mockRandomBytes.mockImplementation((bytes: number) => {
      return defaultSalt
    })
  })

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset all mock implementations and return values
    mockPayload.find.mockReset()
    mockPayload.update.mockReset()
    mockPayload.findByID.mockReset()
    mockPayload.create.mockReset()
    jwtService = new JwtService(TEST_JWT_SECRET)
    authService = new AuthService(mockPayload as any, jwtService)
  })

  describe('login', () => {
    // Hash must match what the mock pbkdf2 returns (hex decoded)
    const mockUser = {
      id: 1,
      email: 'admin@example.com',
      hash: 'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899',
      salt: 'testsalt123',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
    }

    it('should return auth result with tokens on successful login', async () => {
      mockPayload.find.mockResolvedValue({ docs: [mockUser] })

      const result = await authService.login('admin@example.com', 'password123', '127.0.0.1', 'TestAgent')

      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('refreshToken')
      expect(result).toHaveProperty('user')
      expect(result.user.email).toBe('admin@example.com')
      expect(result.user.role).toBe('admin')
      expect(result.accessToken).toBeTruthy()
      expect(result.refreshToken).toBeTruthy()
    })

    it('should store refreshToken and tokenExpiresAt on user', async () => {
      mockPayload.find.mockResolvedValue({ docs: [mockUser] })

      await authService.login('admin@example.com', 'password123', '127.0.0.1', 'TestAgent')

      expect(mockPayload.update).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'users',
          id: 1,
          data: expect.objectContaining({
            refreshToken: expect.any(String),
            tokenExpiresAt: expect.any(String),
          }),
        })
      )
    })

    it('should throw on invalid email', async () => {
      mockPayload.find.mockResolvedValue({ docs: [] })

      await expect(
        authService.login('nonexistent@example.com', 'password123', '127.0.0.1', 'TestAgent')
      ).rejects.toThrow('Invalid credentials')
    })

    it('should throw on empty email', async () => {
      await expect(
        authService.login('', 'anypassword', '127.0.0.1', 'TestAgent')
      ).rejects.toThrow('Email is required')
    })

    it('should throw when user is inactive', async () => {
      mockPayload.find.mockResolvedValue({ docs: [{ ...mockUser, isActive: false }] })

      await expect(
        authService.login('admin@example.com', 'password123', '127.0.0.1', 'TestAgent')
      ).rejects.toThrow('Account is inactive')
    })

    it('should update lastTokenUsedAt on login', async () => {
      mockPayload.find.mockResolvedValue({ docs: [mockUser] })

      await authService.login('admin@example.com', 'password123', '127.0.0.1', 'TestAgent')

      expect(mockPayload.update).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'users',
          id: 1,
          data: expect.objectContaining({
            lastTokenUsedAt: expect.any(String),
          }),
        })
      )
    })
  })

  describe('refresh', () => {
    // Real JWT tokens for testing
    let validRefreshToken: string
    let mismatchedRefreshToken: string

    const mockUser = {
      id: 1,
      email: 'admin@example.com',
      hash: 'hashed_password',
      role: 'admin',
      refreshToken: 'valid_refresh_token',
      tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
    }

    beforeEach(async () => {
      // Create real JWT refresh tokens for testing
      validRefreshToken = await jwtService.signRefreshToken({
        userId: '1',
        email: 'admin@example.com',
        role: 'admin',
        sessionId: 'session-1',
        generation: 0,
      })
      mismatchedRefreshToken = await jwtService.signRefreshToken({
        userId: '2', // Different user
        email: 'other@example.com',
        role: 'viewer',
        sessionId: 'session-2',
        generation: 0,
      })
    })

    it('should return new tokens on valid refresh', async () => {
      const userWithRealToken = { ...mockUser, refreshToken: validRefreshToken }
      mockPayload.find.mockResolvedValue({ docs: [userWithRealToken] })
      mockPayload.update.mockResolvedValue({ ...userWithRealToken, refreshToken: 'new_refresh_token' })

      const result = await authService.refresh(validRefreshToken)

      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('refreshToken')
      expect(result.accessToken).toBeTruthy()
      expect(result.refreshToken).toBeTruthy()
    })

    it('should rotate refresh token on refresh', async () => {
      const userWithRealToken = { ...mockUser, refreshToken: validRefreshToken }
      mockPayload.find.mockResolvedValue({ docs: [userWithRealToken] })
      mockPayload.update.mockResolvedValue({ ...userWithRealToken, refreshToken: 'new_refresh_token' })

      const result = await authService.refresh(validRefreshToken)

      // Verify a new refresh token was returned and it's different from the original
      expect(result.refreshToken).toBeTruthy()
      expect(result.refreshToken).not.toBe(validRefreshToken)
    })

    it('should throw on missing refresh token', async () => {
      await expect(authService.refresh('')).rejects.toThrow('Refresh token is required')
    })

    it('should throw on expired refresh token', async () => {
      // Use a valid (non-expired) JWT but with expired tokenExpiresAt in stored user
      const userWithExpiredStoredToken = {
        ...mockUser,
        refreshToken: validRefreshToken, // Valid JWT, but...
        tokenExpiresAt: new Date(Date.now() - 1000).toISOString(), // ...stored expiry is expired
      }
      mockPayload.find.mockResolvedValue({ docs: [userWithExpiredStoredToken] })

      await expect(authService.refresh(validRefreshToken)).rejects.toThrow('Refresh token expired')
    })

    it('should throw when stored refresh token does not match', async () => {
      // Stored token belongs to user 1, but we pass token for user 2
      const userWithDifferentToken = { ...mockUser, refreshToken: validRefreshToken }
      mockPayload.find.mockResolvedValue({ docs: [userWithDifferentToken] })

      await expect(authService.refresh(mismatchedRefreshToken)).rejects.toThrow('Invalid refresh token')
    })
  })

  describe('verifyAccessToken', () => {
    const mockUser = {
      id: 1,
      email: 'admin@example.com',
      role: 'admin',
      isActive: true,
    }

    it('should return user context for valid access token', async () => {
      // Create a valid access token directly
      const accessToken = await jwtService.signAccessToken({
        userId: '1',
        email: 'admin@example.com',
        role: 'admin',
        sessionId: 'session-1',
        generation: 0,
      })

      mockPayload.find.mockResolvedValue({ docs: [{
        id: 1,
        email: 'admin@example.com',
        role: 'admin',
        isActive: true,
      }] })

      const result = await authService.verifyAccessToken(accessToken)

      expect(result).toHaveProperty('user')
      expect(result.user?.email).toBe('admin@example.com')
      expect(result.user?.role).toBe('admin')
    })

    it('should throw on invalid access token', async () => {
      await expect(authService.verifyAccessToken('invalid.token.here')).rejects.toThrow('Invalid token')
    })

    it('should throw on expired access token', async () => {
      const expiredToken = await jwtService.sign(
        { userId: '1', email: 'admin@example.com', role: 'admin', sessionId: 'session-1', generation: 0 },
        -1000 // Already expired
      )

      await expect(authService.verifyAccessToken(expiredToken)).rejects.toThrow('Token expired')
    })
  })

  describe('logout', () => {
    it('should clear refresh token on logout', async () => {
      mockPayload.findByID.mockResolvedValue({
        id: 1,
        email: 'admin@example.com',
        role: 'admin',
        refreshToken: 'some_token',
      })
      mockPayload.update.mockResolvedValue({ id: 1, refreshToken: null })

      await authService.logout(1)

      expect(mockPayload.update).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'users',
          id: 1,
          data: { refreshToken: null },
        })
      )
    })
  })

  describe('RBAC role checks', () => {
    it('should include role in auth result', async () => {
      const mockUser = {
        id: 1,
        email: 'editor@example.com',
        hash: 'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899',
        salt: 'testsalt123',
        role: 'editor',
        isActive: true,
      }
      mockPayload.find.mockResolvedValue({ docs: [mockUser] })

      const result = await authService.login('editor@example.com', 'password123', '127.0.0.1', 'TestAgent')

      expect(result.user.role).toBe('editor')
    })
  })

  describe('changePassword', () => {
    const baseMockUser = {
      id: 1,
      email: 'user@example.com',
      hash: 'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899',
      salt: 'testsalt123',
      role: 'viewer',
      isActive: true,
      passwordHistory: [],
    }

    const differentSalt = Buffer.from('differentSalt123')
    const differentHash = Buffer.from('99887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa', 'hex')

    beforeEach(() => {
      // Reset crypto mocks to default implementations
      mockPbkdf2.mockImplementation((password, salt, iterations, keylen, digest, callback) => {
        callback(null, defaultHash)
      })
      mockRandomBytes.mockImplementation((bytes) => {
        return defaultSalt
      })
    })

    it('should successfully change password', async () => {
      // First PBKDF2: verifyPassword (returns stored hash for verification)
      // Second PBKDF2: new password hash (returns different hash)
      mockPbkdf2
        .mockImplementationOnce((password, salt, iterations, keylen, digest, callback) => {
          callback(null, defaultHash) // Returns stored hash for verification
        })
        .mockImplementationOnce((password, salt, iterations, keylen, digest, callback) => {
          callback(null, differentHash) // Returns new hash
        })
      mockRandomBytes.mockReturnValue(differentSalt)

      // First find: get user for changePassword
      // Second find: verification after update (must return the new hash)
      mockPayload.find
        .mockResolvedValueOnce({ docs: [baseMockUser] })
        .mockResolvedValueOnce({ docs: [{ ...baseMockUser, hash: differentHash.toString('hex') }] })
      mockPayload.update.mockResolvedValue({ ...baseMockUser, hash: differentHash.toString('hex') })

      await authService.changePassword('1', 'currentPassword', 'newPassword123')

      expect(mockPayload.update).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'users',
          id: '1',
          data: expect.objectContaining({
            hash: expect.any(String),
            salt: expect.any(String),
            passwordHistory: expect.any(Array),
          }),
        })
      )
    })

    it('should throw on wrong current password', async () => {
      const userWithWrongPassword = {
        ...baseMockUser,
        hash: 'different_hash',
        salt: 'different_salt',
      }
      mockPayload.find.mockResolvedValue({ docs: [userWithWrongPassword] })

      await expect(
        authService.changePassword('1', 'wrongPassword', 'newPassword123')
      ).rejects.toMatchObject({ message: 'Current password is incorrect', status: 401 })
    })

    it('should throw when reusing a recent password from history', async () => {
      // The mock PBKDF2 returns defaultHash for any password
      // So if history contains this hash, it will match
      const userWithHistory = {
        ...baseMockUser,
        passwordHistory: [
          { hash: defaultHash.toString('hex'), salt: 'testsalt123', changedAt: new Date() },
        ],
      }
      mockPayload.find.mockResolvedValue({ docs: [userWithHistory] })

      await expect(
        authService.changePassword('1', 'anyPassword', 'newPassword')
      ).rejects.toMatchObject({ message: 'Cannot reuse any of your last 5 passwords', status: 400 })
    })

    it('should return early when new password equals current hash', async () => {
      // Default mock returns same hash as stored, so early return happens
      mockPayload.find.mockResolvedValue({ docs: [baseMockUser] })

      await authService.changePassword('1', 'currentPassword', 'newPassword123')

      // The update should not have been called because newHash equals current hash
      expect(mockPayload.update).not.toHaveBeenCalled()
    })

    it('should throw 409 on concurrent modification', async () => {
      // First PBKDF2: verifyPassword (returns stored hash for verification)
      // Second PBKDF2: new password hash (returns different hash)
      mockPbkdf2
        .mockImplementationOnce((password, salt, iterations, keylen, digest, callback) => {
          callback(null, defaultHash)
        })
        .mockImplementationOnce((password, salt, iterations, keylen, digest, callback) => {
          callback(null, differentHash)
        })

      mockPayload.find
        .mockResolvedValueOnce({ docs: [baseMockUser] }) // First call for changePassword
        .mockResolvedValueOnce({ docs: [{ ...baseMockUser, hash: 'different_hash' }] }) // Verification call - hash changed

      await expect(
        authService.changePassword('1', 'currentPassword', 'newPassword123')
      ).rejects.toMatchObject({ message: 'Password was changed by another request. Please try again.', status: 409 })
    })

    it('should throw when user not found', async () => {
      mockPayload.find.mockResolvedValue({ docs: [] })

      await expect(
        authService.changePassword('999', 'currentPassword', 'newPassword123')
      ).rejects.toMatchObject({ message: 'User not found', status: 404 })
    })

    it('should throw when new password is empty', async () => {
      await expect(
        authService.changePassword('1', 'currentPassword', '')
      ).rejects.toMatchObject({ message: 'New password is required', status: 400 })
    })
  })
})
