import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

// Mock getPayloadInstance
const mockPayload = {
  find: vi.fn(),
  findByID: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
}
vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(() => Promise.resolve(mockPayload)),
}))

// Mock JwtService
const mockSignAccessToken = vi.fn()
const mockSignRefreshToken = vi.fn()

vi.mock('@/auth', () => ({
  getJwtService: vi.fn(() => ({
    verify: vi.fn(),
    signAccessToken: mockSignAccessToken,
    signRefreshToken: mockSignRefreshToken,
  })),
}))

// Mock crypto for password hashing used by AuthService
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

  it('returns 201 with tokens on valid registration', async () => {
    const mockUser = {
      id: 1,
      email: 'new@example.com',
      role: 'viewer' as const,
      isActive: true,
      hash: 'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899',
      salt: 'testsalt123',
    }

    // First call: check for existing user (empty), Second call: login find
    mockPayload.find
      .mockResolvedValueOnce({ docs: [] }) // existing user check
      .mockResolvedValueOnce({ docs: [mockUser] }) // login

    mockPayload.create.mockResolvedValue({ id: 1, email: 'new@example.com', role: 'viewer' })
    mockPayload.update.mockResolvedValue(mockUser)

    mockSignAccessToken.mockResolvedValueOnce('access-token-123')
    mockSignRefreshToken.mockResolvedValueOnce('refresh-token-123')

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'new@example.com',
        password: 'NewPass1!',
        confirmPassword: 'NewPass1!',
        firstName: 'John',
        lastName: 'Doe',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body).toHaveProperty('accessToken')
    expect(body).toHaveProperty('refreshToken')
    expect(body.user.email).toBe('new@example.com')
  })

  it('returns 409 on duplicate email', async () => {
    mockPayload.find.mockResolvedValueOnce({ docs: [{ id: 1, email: 'existing@example.com' }] })

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'existing@example.com',
        password: 'NewPass1!',
        confirmPassword: 'NewPass1!',
        firstName: 'John',
        lastName: 'Doe',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(409)
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })

  it('returns 400 on weak password - too short', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'new@example.com',
        password: 'Ab1!',
        confirmPassword: 'Ab1!',
        firstName: 'John',
        lastName: 'Doe',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })

  it('returns 400 on weak password - no uppercase', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'new@example.com',
        password: 'password1!',
        confirmPassword: 'password1!',
        firstName: 'John',
        lastName: 'Doe',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })

  it('returns 400 on weak password - no number', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'new@example.com',
        password: 'Password!',
        confirmPassword: 'Password!',
        firstName: 'John',
        lastName: 'Doe',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })

  it('returns 400 on weak password - no special char', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'new@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
        firstName: 'John',
        lastName: 'Doe',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })

  it('returns 400 on mismatched passwords', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'new@example.com',
        password: 'NewPass1!',
        confirmPassword: 'Different1!',
        firstName: 'John',
        lastName: 'Doe',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })

  it('returns 400 on missing required fields', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'new@example.com',
        // missing password, confirmPassword, firstName, lastName
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })

  it('returns 400 on missing firstName', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'new@example.com',
        password: 'NewPass1!',
        confirmPassword: 'NewPass1!',
        lastName: 'Doe',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })

  it('returns 400 on missing lastName', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'new@example.com',
        password: 'NewPass1!',
        confirmPassword: 'NewPass1!',
        firstName: 'John',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })
})