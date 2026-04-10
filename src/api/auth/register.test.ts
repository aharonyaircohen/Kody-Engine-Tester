import { describe, it, expect, beforeEach, vi } from 'vitest'
import { register } from './register'
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

describe('register', () => {
  let authService: AuthService
  let jwtService: JwtService
  let testKeys: { privateKey: string; publicKey: string }
  // Pre-computed PBKDF2 hash for 'NewPass1!' with salt 'testsalt123'
  let computedHash: string

  beforeEach(async () => {
    vi.clearAllMocks()
    testKeys = generateTestKeyPair()
    jwtService = new JwtService(testKeys.privateKey, testKeys.publicKey)
    authService = new AuthService(mockPayload as any, jwtService)
    // Pre-compute the actual PBKDF2 hash for 'NewPass1!' with 'testsalt123'
    computedHash = await computeTestHash('NewPass1!', 'testsalt123')
  })

  it('should register and return tokens + user', async () => {
    const mockUser = {
      id: 1,
      email: 'new@example.com',
      hash: computedHash,
      salt: 'testsalt123',
      role: 'viewer',
      isActive: true,
      tokenVersion: 0,
    }

    // First call: check for existing user (empty), Second call: login
    mockPayload.find
      .mockResolvedValueOnce({ docs: [] }) // existing user check
      .mockResolvedValueOnce({ docs: [mockUser] }) // login

    mockPayload.create.mockResolvedValue({ id: 1, email: 'new@example.com', role: 'viewer' })
    mockPayload.update.mockResolvedValue(mockUser)

    const result = await register('new@example.com', 'NewPass1!', 'NewPass1!', '127.0.0.1', 'UA', mockPayload as any, authService)

    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()
    expect(result.user.email).toBe('new@example.com')
    expect(result.user.role).toBe('viewer')
  })

  it('should return 400 for invalid email', async () => {
    await expect(register('not-an-email', 'NewPass1!', 'NewPass1!', '127.0.0.1', 'UA', mockPayload as any, authService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should return 400 for mismatched passwords', async () => {
    await expect(register('new@example.com', 'NewPass1!', 'Different1!', '127.0.0.1', 'UA', mockPayload as any, authService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should return 400 for weak password - too short', async () => {
    await expect(register('new@example.com', 'Ab1!', 'Ab1!', '127.0.0.1', 'UA', mockPayload as any, authService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should return 400 for weak password - no uppercase', async () => {
    await expect(register('new@example.com', 'password1!', 'password1!', '127.0.0.1', 'UA', mockPayload as any, authService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should return 400 for weak password - no number', async () => {
    await expect(register('new@example.com', 'Password!', 'Password!', '127.0.0.1', 'UA', mockPayload as any, authService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should return 400 for weak password - no special char', async () => {
    await expect(register('new@example.com', 'Password1', 'Password1', '127.0.0.1', 'UA', mockPayload as any, authService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should return 409 for duplicate email', async () => {
    mockPayload.find.mockResolvedValue({ docs: [{ id: 1, email: 'existing@example.com' }] })

    await expect(register('existing@example.com', 'NewPass1!', 'NewPass1!', '127.0.0.1', 'UA', mockPayload as any, authService))
      .rejects.toMatchObject({ status: 409 })
  })

  it('should return 400 for missing fields', async () => {
    await expect(register('', '', '', '127.0.0.1', 'UA', mockPayload as any, authService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should assign viewer role', async () => {
    const mockUser = {
      id: 1,
      email: 'new@example.com',
      hash: computedHash,
      salt: 'testsalt123',
      role: 'viewer',
      isActive: true,
      tokenVersion: 0,
    }

    mockPayload.find
      .mockResolvedValueOnce({ docs: [] })
      .mockResolvedValueOnce({ docs: [mockUser] })

    mockPayload.create.mockResolvedValue({ id: 1, email: 'new@example.com', role: 'viewer' })
    mockPayload.update.mockResolvedValue(mockUser)

    const result = await register('new@example.com', 'NewPass1!', 'NewPass1!', '127.0.0.1', 'UA', mockPayload as any, authService)

    expect(result.user.role).toBe('viewer')
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