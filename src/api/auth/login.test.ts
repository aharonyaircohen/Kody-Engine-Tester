import { describe, it, expect, beforeEach, vi } from 'vitest'
import { login } from './login'
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

describe('login', () => {
  let authService: AuthService
  let jwtService: JwtService
  let testKeys: { privateKey: string; publicKey: string }

  beforeEach(() => {
    vi.clearAllMocks()
    testKeys = generateTestKeyPair()
    jwtService = new JwtService(testKeys.privateKey, testKeys.publicKey)
    authService = new AuthService(mockPayload as any, jwtService)
  })

  it('should return tokens and user on successful login', async () => {
    const testHash = await computeTestHash('AdminPass1!', 'salt123')
    const mockUser = {
      id: 1,
      email: 'admin@example.com',
      hash: testHash,
      salt: 'salt123',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      tokenVersion: 0,
    }
    mockPayload.find.mockResolvedValue({ docs: [mockUser] })

    const result = await login('admin@example.com', 'AdminPass1!', '127.0.0.1', 'TestAgent', authService)
    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()
    expect(result.user.email).toBe('admin@example.com')
    expect(result.user.role).toBe('admin')
    expect(result.user.id).toBeDefined()
  })

  it('should return 401 for unknown email', async () => {
    mockPayload.find.mockResolvedValue({ docs: [] })

    await expect(login('unknown@example.com', 'pass', '127.0.0.1', 'UA', authService))
      .rejects.toMatchObject({ status: 401 })
  })

  it('should return 401 for wrong password', async () => {
    const testHash = await computeTestHash('AdminPass1!', 'salt123')
    const mockUser = {
      id: 1,
      email: 'admin@example.com',
      hash: testHash,
      salt: 'salt123',
      role: 'admin',
      isActive: true,
      tokenVersion: 0,
    }
    mockPayload.find.mockResolvedValue({ docs: [mockUser] })

    await expect(login('admin@example.com', 'wrongpass', '127.0.0.1', 'UA', authService))
      .rejects.toMatchObject({ status: 401 })
  })

  it('should return 400 for missing credentials', async () => {
    await expect(login('', '', '127.0.0.1', 'UA', authService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should return 403 for inactive user', async () => {
    const testHash = await computeTestHash('AdminPass1!', 'salt123')
    const mockUser = {
      id: 1,
      email: 'admin@example.com',
      hash: testHash,
      salt: 'salt123',
      role: 'admin',
      isActive: false,
      tokenVersion: 0,
    }
    mockPayload.find.mockResolvedValue({ docs: [mockUser] })

    await expect(login('admin@example.com', 'AdminPass1!', '127.0.0.1', 'UA', authService))
      .rejects.toMatchObject({ status: 403 })
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