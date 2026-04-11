import { describe, it, expect, beforeEach, vi } from 'vitest'
import { register } from './register'
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

// Mock crypto for password hashing
vi.mock('crypto', () => ({
  default: {
    pbkdf2: vi.fn((password, salt, iterations, keylen, digest, callback) => {
      const testHash = Buffer.from('aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899', 'hex')
      callback(null, testHash)
    }),
    randomBytes: vi.fn(() => Buffer.from('testsalt123')),
    timingSafeEqual: vi.fn(() => true),
  },
}))

describe('register', () => {
  let authService: AuthService
  let jwtService: JwtService

  beforeEach(() => {
    vi.clearAllMocks()
    jwtService = new JwtService('test-secret')
    authService = new AuthService(mockPayload as any, jwtService)
  })

  it('should register and return tokens + user', async () => {
    const mockUser = {
      id: 1,
      email: 'new@example.com',
      hash: 'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899',
      salt: 'testsalt123',
      role: 'viewer',
      isActive: true,
    }

    // First call: check for existing user (empty), Second call: login
    mockPayload.find
      .mockResolvedValueOnce({ docs: [] }) // existing user check
      .mockResolvedValueOnce({ docs: [mockUser] }) // login

    mockPayload.create.mockResolvedValue({ id: 1, email: 'new@example.com', role: 'viewer' })
    mockPayload.update.mockResolvedValue(mockUser)

    const result = await register('new@example.com', 'NewPass1!', 'NewPass1!', 'John', 'Doe', '127.0.0.1', 'UA', mockPayload as any, authService)

    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()
    expect(result.user.email).toBe('new@example.com')
    expect(result.user.role).toBe('viewer')
  })

  it('should return 400 for invalid email', async () => {
    await expect(register('not-an-email', 'NewPass1!', 'NewPass1!', 'John', 'Doe', '127.0.0.1', 'UA', mockPayload as any, authService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should return 400 for mismatched passwords', async () => {
    await expect(register('new@example.com', 'NewPass1!', 'Different1!', 'John', 'Doe', '127.0.0.1', 'UA', mockPayload as any, authService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should return 400 for weak password - too short', async () => {
    await expect(register('new@example.com', 'Ab1!', 'Ab1!', 'John', 'Doe', '127.0.0.1', 'UA', mockPayload as any, authService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should return 400 for weak password - no uppercase', async () => {
    await expect(register('new@example.com', 'password1!', 'password1!', 'John', 'Doe', '127.0.0.1', 'UA', mockPayload as any, authService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should return 400 for weak password - no number', async () => {
    await expect(register('new@example.com', 'Password!', 'Password!', 'John', 'Doe', '127.0.0.1', 'UA', mockPayload as any, authService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should return 400 for weak password - no special char', async () => {
    await expect(register('new@example.com', 'Password1', 'Password1', 'John', 'Doe', '127.0.0.1', 'UA', mockPayload as any, authService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should return 409 for duplicate email', async () => {
    mockPayload.find.mockResolvedValue({ docs: [{ id: 1, email: 'existing@example.com' }] })

    await expect(register('existing@example.com', 'NewPass1!', 'NewPass1!', 'John', 'Doe', '127.0.0.1', 'UA', mockPayload as any, authService))
      .rejects.toMatchObject({ status: 409 })
  })

  it('should return 400 for missing fields', async () => {
    await expect(register('', '', '', 'John', 'Doe', '127.0.0.1', 'UA', mockPayload as any, authService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should assign viewer role', async () => {
    const mockUser = {
      id: 1,
      email: 'new@example.com',
      hash: 'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899',
      salt: 'testsalt123',
      role: 'viewer',
      isActive: true,
    }

    mockPayload.find
      .mockResolvedValueOnce({ docs: [] })
      .mockResolvedValueOnce({ docs: [mockUser] })

    mockPayload.create.mockResolvedValue({ id: 1, email: 'new@example.com', role: 'viewer' })
    mockPayload.update.mockResolvedValue(mockUser)

    const result = await register('new@example.com', 'NewPass1!', 'NewPass1!', 'John', 'Doe', '127.0.0.1', 'UA', mockPayload as any, authService)

    expect(result.user.role).toBe('viewer')
  })
})
