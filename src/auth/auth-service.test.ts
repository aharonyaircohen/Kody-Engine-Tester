import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthService, type AuthResult } from './auth-service'
import { JwtService } from './jwt-service'
import { generateTestKeyPair } from './test-helpers'

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

describe('AuthService', () => {
  let authService: AuthService
  let jwtService: JwtService
  let testKeys: { privateKey: string; publicKey: string }

  beforeEach(() => {
    vi.clearAllMocks()
    // Generate RSA key pair for each test
    testKeys = generateTestKeyPair()
    jwtService = new JwtService(testKeys.privateKey, testKeys.publicKey)
    authService = new AuthService(mockPayload as any, jwtService)
  })

  describe('login', () => {
    it('should return auth result with tokens on successful login', async () => {
      // Pre-computed hash for 'password123' with salt 'testsalt123' using PBKDF2
      // This is the actual PBKDF2 hash that the auth service will compute
      const testHash = await computeTestHash('password123', 'testsalt123')
      const mockUser = {
        id: 1,
        email: 'admin@example.com',
        hash: testHash,
        salt: 'testsalt123',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        tokenVersion: 0,
      }
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
      const testHash = await computeTestHash('password123', 'testsalt123')
      const mockUser = {
        id: 1,
        email: 'admin@example.com',
        hash: testHash,
        salt: 'testsalt123',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        tokenVersion: 0,
      }
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
      const testHash = await computeTestHash('password123', 'testsalt123')
      const mockUser = {
        id: 1,
        email: 'admin@example.com',
        hash: testHash,
        salt: 'testsalt123',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        isActive: false,
        tokenVersion: 0,
      }
      mockPayload.find.mockResolvedValue({ docs: [mockUser] })

      await expect(
        authService.login('admin@example.com', 'password123', '127.0.0.1', 'TestAgent')
      ).rejects.toThrow('Account is inactive')
    })

    it('should update lastTokenUsedAt on login', async () => {
      const testHash = await computeTestHash('password123', 'testsalt123')
      const mockUser = {
        id: 1,
        email: 'admin@example.com',
        hash: testHash,
        salt: 'testsalt123',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        tokenVersion: 0,
      }
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
      tokenVersion: 0,
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

    it('should throw when token has been revoked via tokenVersion', async () => {
      // Token was issued with generation 0, but user's tokenVersion is now 1 (incremented on logout)
      const userWithRevokedToken = {
        ...mockUser,
        refreshToken: validRefreshToken,
        tokenVersion: 1, // User has logged out, tokenVersion incremented
      }
      mockPayload.find.mockResolvedValue({ docs: [userWithRevokedToken] })

      await expect(authService.refresh(validRefreshToken)).rejects.toThrow('Token has been revoked')
    })
  })

  describe('verifyAccessToken', () => {
    const mockUser = {
      id: 1,
      email: 'admin@example.com',
      role: 'admin',
      isActive: true,
      tokenVersion: 0,
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
        tokenVersion: 0,
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

    it('should throw on revoked token', async () => {
      const accessToken = await jwtService.signAccessToken({
        userId: '1',
        email: 'admin@example.com',
        role: 'admin',
        sessionId: 'session-1',
        generation: 0, // Token was issued with generation 0
      })

      // But user's tokenVersion is now 1 (token was revoked)
      mockPayload.find.mockResolvedValue({ docs: [{
        id: 1,
        email: 'admin@example.com',
        role: 'admin',
        isActive: true,
        tokenVersion: 1,
      }] })

      await expect(authService.verifyAccessToken(accessToken)).rejects.toThrow('Token has been revoked')
    })
  })

  describe('logout', () => {
    it('should increment tokenVersion on logout', async () => {
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

      await authService.logout(1)

      expect(mockPayload.update).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'users',
          id: 1,
          data: expect.objectContaining({
            refreshToken: null,
            tokenVersion: 1,
          }),
        })
      )
    })
  })

  describe('RBAC role checks', () => {
    it('should include role in auth result', async () => {
      const testHash = await computeTestHash('password123', 'testsalt123')
      const mockUser = {
        id: 1,
        email: 'editor@example.com',
        hash: testHash,
        salt: 'testsalt123',
        role: 'editor',
        isActive: true,
        tokenVersion: 0,
      }
      mockPayload.find.mockResolvedValue({ docs: [mockUser] })

      const result = await authService.login('editor@example.com', 'password123', '127.0.0.1', 'TestAgent')

      expect(result.user.role).toBe('editor')
    })
  })
})

// Helper function to compute PBKDF2 hash
async function computeTestHash(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const crypto = require('crypto')
    crypto.pbkdf2(password, salt, 25000, 512, 'sha256', (err: Error | null, derivedKey?: Buffer) => {
      if (err) {
        reject(err)
        return
      }
      resolve(derivedKey!.toString('hex'))
    })
  })
}