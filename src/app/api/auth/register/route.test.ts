import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

// Mock getPayloadInstance
const mockPayload = {
  find: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
}

vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(() => Promise.resolve(mockPayload)),
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

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with tokens and user on successful registration', async () => {
    const mockUser = {
      id: 1,
      email: 'new@example.com',
      hash: 'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899',
      salt: 'testsalt123',
      role: 'viewer',
      isActive: true,
    }

    mockPayload.find
      .mockResolvedValueOnce({ docs: [] }) // existing user check
      .mockResolvedValueOnce({ docs: [mockUser] }) // login lookup

    mockPayload.create.mockResolvedValue({ id: 1, email: 'new@example.com', role: 'viewer' })
    mockPayload.update.mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.1.1',
        'user-agent': 'TestAgent/1.0',
      },
      body: JSON.stringify({
        email: 'new@example.com',
        password: 'NewPass1!',
        confirmPassword: 'NewPass1!',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body).toHaveProperty('accessToken')
    expect(body).toHaveProperty('refreshToken')
    expect(body.user).toEqual({
      id: expect.anything(),
      email: 'new@example.com',
      role: 'viewer',
    })
  })

  it('returns 409 for duplicate email', async () => {
    mockPayload.find.mockResolvedValueOnce({ docs: [{ id: 1, email: 'existing@example.com' }] })

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'existing@example.com',
        password: 'NewPass1!',
        confirmPassword: 'NewPass1!',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(409)

    const body = await response.json()
    expect(body).toHaveProperty('error', 'Email already in use')
  })

  it('returns 400 for invalid email format', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'not-an-email',
        password: 'NewPass1!',
        confirmPassword: 'NewPass1!',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body).toHaveProperty('error', 'Invalid email format')
  })

  it('returns 400 for mismatched passwords', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'new@example.com',
        password: 'NewPass1!',
        confirmPassword: 'DifferentPass1!',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body).toHaveProperty('error', 'Passwords do not match')
  })

  it('returns 400 for weak password', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'new@example.com',
        password: 'weak',
        confirmPassword: 'weak',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 400 for missing required fields', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: '',
        password: '',
        confirmPassword: '',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body).toHaveProperty('error', 'Email, password, and confirm password are required')
  })
})