import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

// Mock getPayloadInstance
const mockPayload = {
  find: vi.fn(),
  update: vi.fn(),
}

vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(() => Promise.resolve(mockPayload)),
}))

// Mock crypto for password hashing
vi.mock('crypto', () => ({
  default: {
    pbkdf2: vi.fn((password, salt, iterations, keylen, digest, callback) => {
      // Return different hash based on password to simulate verification
      // For "ValidPass1!" return the correct hash, for anything else return wrong hash
      const correctHash = 'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899'
      if (password === 'ValidPass1!') {
        callback(null, Buffer.from(correctHash, 'hex'))
      } else {
        // Return a different hash to simulate wrong password
        callback(null, Buffer.from('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 'hex'))
      }
    }),
    randomBytes: vi.fn(() => Buffer.from('testsalt123')),
    timingSafeEqual: vi.fn((a: Buffer, b: Buffer) => a.equals(b)),
    subtle: {
      digest: vi.fn(async (algorithm: string, data: Uint8Array) => {
        // Simple mock: return deterministic hash based on input
        const mockHash = new Uint8Array(32)
        mockHash.fill(0x42)
        return mockHash.buffer
      }),
    },
    randomUUID: () => 'test-uuid-1234',
  },
}))

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with tokens and user on successful login', async () => {
    const mockUser = {
      id: 1,
      email: 'user@example.com',
      hash: 'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899',
      salt: 'testsalt123',
      role: 'viewer',
      isActive: true,
    }

    mockPayload.find.mockResolvedValueOnce({ docs: [mockUser] })
    mockPayload.update.mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.1.1',
        'user-agent': 'TestAgent/1.0',
      },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'ValidPass1!',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body).toHaveProperty('accessToken')
    expect(body).toHaveProperty('refreshToken')
    expect(body.user).toEqual({
      id: expect.anything(),
      email: 'user@example.com',
      role: 'viewer',
    })
  })

  it('returns 401 for non-existent user', async () => {
    mockPayload.find.mockResolvedValueOnce({ docs: [] })

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'ValidPass1!',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)

    const body = await response.json()
    expect(body).toHaveProperty('error', 'Invalid credentials')
  })

  it('returns 401 for wrong password', async () => {
    const mockUser = {
      id: 1,
      email: 'user@example.com',
      hash: 'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899',
      salt: 'testsalt123',
      role: 'viewer',
      isActive: true,
    }

    mockPayload.find.mockResolvedValueOnce({ docs: [mockUser] })

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'WrongPassword1!',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)

    const body = await response.json()
    expect(body).toHaveProperty('error', 'Invalid credentials')
  })

  it('returns 403 for inactive account', async () => {
    const mockUser = {
      id: 1,
      email: 'user@example.com',
      hash: 'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899',
      salt: 'testsalt123',
      role: 'viewer',
      isActive: false,
    }

    mockPayload.find.mockResolvedValueOnce({ docs: [mockUser] })

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'ValidPass1!',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(403)

    const body = await response.json()
    expect(body).toHaveProperty('error', 'Account is inactive')
  })

  it('returns 400 for missing credentials', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: '',
        password: '',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body).toHaveProperty('error', 'Email is required')
  })

  it('returns 400 when password is missing', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
        password: '',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body).toHaveProperty('error', 'Password is required')
  })
})