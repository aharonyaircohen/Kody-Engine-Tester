import { describe, it, expect, beforeEach, vi } from 'vitest'
import { login } from './login'
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

// Mock crypto for password hashing (PBKDF2)
vi.mock('crypto', () => {
  const mod = {
    pbkdf2: vi.fn((_password, _salt, _iterations, _keylen, _digest, callback) => {
      const testHash = Buffer.from('aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899', 'hex')
      callback(null, testHash)
    }),
    randomBytes: vi.fn(() => Buffer.from('testsalt123')),
    timingSafeEqual: vi.fn(() => true),
  }
  return { default: mod }
})

// Re-export the mock so we can spy on it via vi.spyOn in tests
import * as cryptoMock from 'crypto'
const { timingSafeEqual } = cryptoMock.default

describe('login', () => {
  let authService: AuthService
  let jwtService: JwtService

  beforeEach(() => {
    vi.clearAllMocks()
    // Restore timingSafeEqual to default (returns true) between tests
    timingSafeEqual.mockReturnValue(true)
    jwtService = new JwtService('test-secret')
    authService = new AuthService(mockPayload as any, jwtService)
  })

  it('should return tokens and user on successful login', async () => {
    const mockUser = {
      id: 1,
      email: 'admin@example.com',
      hash: 'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899',
      salt: 'testsalt123',
      role: 'admin',
      isActive: true,
    }

    mockPayload.find.mockResolvedValueOnce({ docs: [mockUser] })
    mockPayload.update.mockResolvedValueOnce(mockUser)

    const result = await login('admin@example.com', 'AdminPass1!', '127.0.0.1', 'UA', mockPayload as any, authService)

    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()
    expect(result.user.email).toBe('admin@example.com')
    expect(result.user.role).toBe('admin')
    expect(result.user.id).toBeDefined()
  })

  it('should return 401 for unknown email', async () => {
    mockPayload.find.mockResolvedValueOnce({ docs: [] })

    await expect(login('unknown@example.com', 'pass', '127.0.0.1', 'UA', mockPayload as any, authService))
      .rejects.toMatchObject({ status: 401 })
  })

  it('should return 401 for wrong password', async () => {
    const mockUser = {
      id: 1,
      email: 'admin@example.com',
      hash: 'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899',
      salt: 'testsalt123',
      role: 'admin',
      isActive: true,
    }

    mockPayload.find.mockResolvedValueOnce({ docs: [mockUser] })

    // Simulate wrong password: timingSafeEqual returns false for this test only
    timingSafeEqual.mockReturnValueOnce(false)

    await expect(login('admin@example.com', 'wrongpass', '127.0.0.1', 'UA', mockPayload as any, authService))
      .rejects.toMatchObject({ status: 401 })
  })

  it('should return 400 for missing credentials', async () => {
    await expect(login('', '', '127.0.0.1', 'UA', mockPayload as any, authService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should return 403 for inactive user', async () => {
    const mockUser = {
      id: 1,
      email: 'inactive@example.com',
      hash: 'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899',
      salt: 'testsalt123',
      role: 'viewer',
      isActive: false,
    }

    mockPayload.find.mockResolvedValueOnce({ docs: [mockUser] })

    await expect(login('inactive@example.com', 'InactivePass1!', '127.0.0.1', 'UA', mockPayload as any, authService))
      .rejects.toMatchObject({ status: 403 })
  })
})
