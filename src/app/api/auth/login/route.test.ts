import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

// Mock Payload
const mockPayload = {
  findByID: vi.fn(),
  find: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
}

vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(() => Promise.resolve(mockPayload)),
}))

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

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when email is missing', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'Password1!' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Email and password are required')
  })

  it('returns 400 when password is missing', async () => {
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

  it('returns 400 for invalid JSON body', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json',
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Invalid JSON body')
  })

  it('returns 401 for invalid credentials', async () => {
    // Mock AuthService.login to reject with 401
    mockPayload.find.mockResolvedValue({ docs: [] })

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'WrongPassword1!' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('Invalid credentials')
  })

  it('returns 200 with tokens on valid credentials', async () => {
    // Mock AuthService.login to resolve with tokens
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
      body: JSON.stringify({ email: 'test@example.com', password: 'ValidPass1!' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('accessToken')
    expect(body).toHaveProperty('refreshToken')
    expect(body.user.email).toBe('test@example.com')
  })
})