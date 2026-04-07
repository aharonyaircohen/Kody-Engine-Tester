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

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when email is missing', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'Password1!', confirmPassword: 'Password1!' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Email, password, and confirm password are required')
  })

  it('returns 400 when password is missing', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', confirmPassword: 'Password1!' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Email, password, and confirm password are required')
  })

  it('returns 400 when confirmPassword is missing', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'Password1!' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Email, password, and confirm password are required')
  })

  it('returns 400 for invalid JSON body', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json',
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Invalid JSON body')
  })

  it('returns 400 for invalid email format', async () => {
    mockPayload.find.mockResolvedValue({ docs: [] })

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: 'Password1!', confirmPassword: 'Password1!' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Invalid email format')
  })

  it('returns 400 for weak password', async () => {
    mockPayload.find.mockResolvedValue({ docs: [] })

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'short', confirmPassword: 'short' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Password must be at least 8 characters')
  })

  it('returns 400 for mismatched passwords', async () => {
    mockPayload.find.mockResolvedValue({ docs: [] })

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'Password1!', confirmPassword: 'Different1!' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Passwords do not match')
  })

  it('returns 409 for duplicate email', async () => {
    mockPayload.find.mockResolvedValue({ docs: [{ id: 1, email: 'existing@example.com' }] })

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'existing@example.com', password: 'Password1!', confirmPassword: 'Password1!' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(409)
    const body = await response.json()
    expect(body.error).toBe('Email already in use')
  })

  it('returns 201 with user data on success', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      hash: 'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899',
      salt: 'testsalt123',
      role: 'viewer',
      isActive: true,
    }

    // First call: check for existing user (empty), Second call: login
    mockPayload.find
      .mockResolvedValueOnce({ docs: [] }) // existing user check
      .mockResolvedValueOnce({ docs: [mockUser] }) // login

    mockPayload.create.mockResolvedValue({ id: 1, email: 'test@example.com', role: 'viewer' })
    mockPayload.update.mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'Password1!', confirmPassword: 'Password1!' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body).toHaveProperty('accessToken')
    expect(body).toHaveProperty('refreshToken')
    expect(body.user.email).toBe('test@example.com')
    expect(body.user.role).toBe('viewer')
    expect(body.user).not.toHaveProperty('passwordHash')
  })
})