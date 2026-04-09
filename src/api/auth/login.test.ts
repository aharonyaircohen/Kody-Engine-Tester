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

// Mock crypto for password verification
vi.mock('crypto', () => ({
  default: {
    pbkdf2: vi.fn((password, salt, iterations, keylen, digest, callback) => {
      // Return a fixed hash that matches the stored hash when compared
      const testHash = Buffer.from('aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899', 'hex')
      callback(null, testHash)
    }),
    randomBytes: vi.fn((bytes, callback) => {
      callback(null, Buffer.from('testsalt123'))
    }),
    timingSafeEqual: vi.fn((a, b) => {
      return a.length === b.length
    }),
  },
}))

const TEST_JWT_SECRET = 'test-secret'

describe('login', () => {
  let authService: AuthService
  let jwtService: JwtService

  beforeEach(() => {
    vi.clearAllMocks()
    jwtService = new JwtService(TEST_JWT_SECRET)
    authService = new AuthService(mockPayload as any, jwtService)
  })

  it('should return tokens and user on successful login', async () => {
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
    mockPayload.find.mockResolvedValue({ docs: [mockUser] })

    const result = await login('admin@example.com', 'password123', authService)
    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()
    expect(result.user.email).toBe('admin@example.com')
    expect(result.user.role).toBe('admin')
    expect(result.user.id).toBeDefined()
  })

  it('should return 401 for unknown email', async () => {
    mockPayload.find.mockResolvedValue({ docs: [] })

    await expect(login('unknown@example.com', 'pass', authService))
      .rejects.toMatchObject({ status: 401 })
  })

  it('should return 401 for wrong password', async () => {
    const mockUser = {
      id: 1,
      email: 'admin@example.com',
      hash: 'wronghash',
      salt: 'testsalt123',
      role: 'admin',
      isActive: true,
    }
    mockPayload.find.mockResolvedValue({ docs: [mockUser] })

    await expect(login('admin@example.com', 'wrongpass', authService))
      .rejects.toMatchObject({ status: 401 })
  })

  it('should return 400 for missing credentials', async () => {
    await expect(login('', '', authService))
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
    mockPayload.find.mockResolvedValue({ docs: [mockUser] })

    await expect(login('inactive@example.com', 'password123', authService))
      .rejects.toMatchObject({ status: 403 })
  })
})