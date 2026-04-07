import { describe, it, expect, beforeEach, vi } from 'vitest'
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

vi.mock('crypto', () => ({
  default: {
    pbkdf2: vi.fn((password, salt, iterations, keylen, digest, callback) => {
      const testHash = Buffer.from('aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899', 'hex')
      callback(null, testHash)
    }),
    randomBytes: vi.fn(() => Buffer.from('testsalt123')),
    randomUUID: vi.fn(() => 'test-uuid'),
    timingSafeEqual: vi.fn(() => true),
    subtle: {
      digest: vi.fn(async () => Buffer.from('testdigest')),
    },
  },
}))

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 201 and JWT tokens on successful registration', async () => {
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

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'new@example.com', password: 'NewPass1!' }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body.accessToken).toBeDefined()
    expect(body.refreshToken).toBeDefined()
    expect(body.user.email).toBe('new@example.com')
    expect(body.user.role).toBe('viewer')
  })

  it('should return 400 for invalid email format', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: 'NewPass1!' }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Invalid email format')
  })

  it('should return 201 when email and password are provided (confirmPassword auto-filled)', async () => {
    // Since the route passes password as both password and confirmPassword,
    // this test verifies that providing email+password works
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

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'new@example.com', password: 'NewPass1!' }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body.accessToken).toBeDefined()
  })

  it('should return 400 for weak password - too short', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'new@example.com', password: 'Ab1!' }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
  })

  it('should return 400 for weak password - no uppercase', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'new@example.com', password: 'password1!' }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
  })

  it('should return 400 for duplicate email', async () => {
    mockPayload.find.mockResolvedValue({ docs: [{ id: 1, email: 'existing@example.com' }] })

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'existing@example.com', password: 'NewPass1!' }),
    })

    const response = await POST(request)
    const body = await response.json()

    // Per task AC: duplicate email returns 400, not 409
    expect(response.status).toBe(400)
    expect(body.error).toBe('Email already in use')
  })

  it('should return 400 for missing email field', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'NewPass1!' }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
  })
})