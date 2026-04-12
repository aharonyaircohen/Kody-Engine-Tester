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

// Use vi.hoisted to define mocks at the same level as vi.mock (hoisted together)
const { mockPbkdf2, mockRandomBytes, mockTimingSafeEqual } = vi.hoisted(() => ({
  mockPbkdf2: vi.fn(),
  mockRandomBytes: vi.fn(),
  mockTimingSafeEqual: vi.fn(),
}))

// Mock crypto module
vi.mock('crypto', () => ({
  default: {
    pbkdf2: mockPbkdf2,
    randomBytes: mockRandomBytes,
    timingSafeEqual: mockTimingSafeEqual,
  },
}))

describe('login', () => {
  let authService: AuthService
  let jwtService: JwtService

  beforeEach(() => {
    vi.clearAllMocks()
    jwtService = new JwtService('test-secret')
    authService = new AuthService(mockPayload as any, jwtService)
    mockRandomBytes.mockReturnValue(Buffer.from('testsalt123'))
  })

  it('should return tokens and user on successful login', async () => {
    const storedHash = 'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899'
    const mockUser = {
      id: 1,
      email: 'admin@example.com',
      hash: storedHash,
      salt: 'testsalt123',
      role: 'admin',
      isActive: true,
    }

    mockPayload.find.mockResolvedValue({ docs: [mockUser] })
    mockPayload.update.mockResolvedValue(mockUser)

    // Mock pbkdf2 to return the same hash (simulating correct password)
    mockPbkdf2.mockImplementation((password, salt, iterations, keylen, digest, callback) => {
      callback(null, Buffer.from(storedHash, 'hex'))
    })
    mockTimingSafeEqual.mockReturnValue(true)

    const result = await login('admin@example.com', 'AdminPass1!', '127.0.0.1', 'TestAgent', mockPayload as any, authService)

    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()
    expect(result.user.email).toBe('admin@example.com')
    expect(result.user.role).toBe('admin')
    expect(result.user.id).toBeDefined()
  })

  it('should return 401 for unknown email', async () => {
    mockPayload.find.mockResolvedValue({ docs: [] })

    await expect(login('unknown@example.com', 'pass', '127.0.0.1', 'UA', mockPayload as any, authService))
      .rejects.toMatchObject({ status: 401 })
  })

  it('should return 401 for wrong password', async () => {
    const storedHash = 'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899'
    const mockUser = {
      id: 1,
      email: 'admin@example.com',
      hash: storedHash,
      salt: 'testsalt123',
      role: 'admin',
      isActive: true,
    }

    mockPayload.find.mockResolvedValue({ docs: [mockUser] })

    // Mock pbkdf2 to return a different hash (simulating wrong password)
    const wrongHash = '0000000000000000000000000000000000000000000000000000000000000000'
    mockPbkdf2.mockImplementation((password, salt, iterations, keylen, digest, callback) => {
      callback(null, Buffer.from(wrongHash, 'hex'))
    })
    mockTimingSafeEqual.mockReturnValue(false)

    await expect(login('admin@example.com', 'wrongpass', '127.0.0.1', 'UA', mockPayload as any, authService))
      .rejects.toMatchObject({ status: 401 })
  })

  it('should return 400 for missing credentials', async () => {
    await expect(login('', '', '127.0.0.1', 'UA', mockPayload as any, authService))
      .rejects.toMatchObject({ status: 400 })
  })
})