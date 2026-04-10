import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

// Mock Payload - must mock 'payload' module directly since getPayloadInstance uses dynamic import
const mockPayload = {
  findByID: vi.fn(),
  find: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
}

vi.mock('payload', () => ({
  getPayload: vi.fn(() => mockPayload),
}))

// Mock crypto for password verification
vi.mock('crypto', () => ({
  default: {
    pbkdf2: vi.fn((password, salt, iterations, keylen, digest, callback) => {
      // Return correct hash only for the valid password, wrong hash otherwise
      const correctPassword = 'Password123!'
      const correctHash = Buffer.from(
        'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899',
        'hex'
      )
      const wrongHash = Buffer.from(
        '0000000000000000000000000000000000000000000000000000000000000000',
        'hex'
      )
      const resultHash = password === correctPassword ? correctHash : wrongHash
      callback(null, resultHash)
    }),
    randomBytes: vi.fn(() => Buffer.from('testsalt123')),
    timingSafeEqual: vi.fn((a, b) => {
      // Return true only if hashes match (a === b)
      return a.length === b.length && Buffer.compare(a, b) === 0
    }),
  },
}))

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with JWT tokens on valid credentials', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      hash: 'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899',
      salt: 'testsalt123',
      role: 'viewer',
      isActive: true,
    }
    mockPayload.find.mockResolvedValue({ docs: [mockUser] })
    mockPayload.update.mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'Password123!' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.accessToken).toBeDefined()
    expect(body.refreshToken).toBeDefined()
    expect(body.user.email).toBe('test@example.com')
  })

  it('returns 401 on non-existent user', async () => {
    mockPayload.find.mockResolvedValue({ docs: [] })

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@example.com', password: 'Password123!' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('Invalid credentials')
  })

  it('returns 401 on wrong password', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      hash: 'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899',
      salt: 'testsalt123',
      role: 'viewer',
      isActive: true,
    }
    mockPayload.find.mockResolvedValue({ docs: [mockUser] })

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'WrongPassword123!' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('Invalid credentials')
  })

  it('returns 400 for missing email or password', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Email and password are required')
  })

  it('returns 400 when email is empty string', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '', password: 'Password123!' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('returns 401 when user is inactive', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      hash: 'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899',
      salt: 'testsalt123',
      role: 'viewer',
      isActive: false,
    }
    mockPayload.find.mockResolvedValue({ docs: [mockUser] })

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'Password123!' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(403)
    const body = await response.json()
    expect(body.error).toBe('Account is inactive')
  })
})