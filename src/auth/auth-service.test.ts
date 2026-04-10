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

// Mock crypto module for password verification tests
vi.mock('crypto', () => ({
  default: {
    pbkdf2: vi.fn((password, salt, iterations, keylen, digest, callback) => {
      // Simulate PBKDF2 - return a fixed hash that matches the stored hash when compared
      const testHash = Buffer.from('aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899', 'hex')
      callback(null, testHash)
    }),
    randomBytes: vi.fn((bytes, callback) => {
      callback(null, Buffer.from('testsalt123'))
    }),
    timingSafeEqual: vi.fn((a, b) => {
      // In tests, always return true if lengths match (password verification succeeds)
      return a.length === b.length
    }),
  },
}))

describe('AuthService', () => {
  let authService: AuthService
  let jwtService: JwtService

  beforeEach(() => {
    vi.clearAllMocks()
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

    it('should throw 423 when user is locked', async () => {
      const lockedUser = {
        ...mockUser,
        lockedUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min from now
        failedLoginAttempts: 5,
      }
      mockPayload.find.mockResolvedValue({ docs: [lockedUser] })

      await expect(
        authService.login('admin@example.com', 'password123', '127.0.0.1', 'TestAgent')
      ).rejects.toMatchObject({ status: 423, message: 'Account is locked. Please try again later.' })
    })

    it('should allow login after lockout expires', async () => {
      const expiredLockUser = {
        ...mockUser,
        lockedUntil: new Date(Date.now() - 1000).toISOString(), // 1 second ago
        failedLoginAttempts: 5,
      }
      mockPayload.find.mockResolvedValue({ docs: [expiredLockUser] })

      const result = await authService.login('admin@example.com', 'password123', '127.0.0.1', 'TestAgent')
      expect(result).toHaveProperty('accessToken')
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
})
