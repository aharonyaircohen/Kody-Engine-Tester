import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
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

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns 400 for missing fields', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 400 for invalid email format', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: 'TestPass1!', confirmPassword: 'TestPass1!' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 400 for password mismatch', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'TestPass1!', confirmPassword: 'Different1!' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 400 for weak password', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'weak', confirmPassword: 'weak' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 409 for duplicate email', async () => {
    mockPayload.find.mockResolvedValue({ docs: [{ id: 1, email: 'existing@example.com' }] })

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'existing@example.com', password: 'TestPass1!', confirmPassword: 'TestPass1!' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(409)
  })

  it('returns 201 with tokens for valid registration', async () => {
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
      .mockResolvedValueOnce({ docs: [mockUser] }) // login

    mockPayload.create.mockResolvedValue({ id: 1, email: 'new@example.com', role: 'viewer' })
    mockPayload.update.mockResolvedValue(mockUser)

    const uniqueEmail = `test${Date.now()}@example.com`
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: uniqueEmail, password: 'TestPass1!', confirmPassword: 'TestPass1!' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body).toHaveProperty('accessToken')
    expect(body).toHaveProperty('refreshToken')
    expect(body.user.email).toBe(uniqueEmail)
  })
})