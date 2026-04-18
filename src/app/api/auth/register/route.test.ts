import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

// Mock register utility
vi.mock('@/api/auth/register', () => ({
  register: vi.fn(),
}))

// Mock getAuthService
const mockAuthService = {}
vi.mock('@/auth/withAuth', () => ({
  getAuthService: vi.fn(() => mockAuthService),
}))

// Mock getPayloadInstance
vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(() => Promise.resolve({})),
}))

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 201 with tokens on successful registration', async () => {
    const { register } = await import('@/api/auth/register')
    const mockResult = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: 1, email: 'new@example.com', role: 'viewer' },
    }
    ;(register as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult)

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'new@example.com', password: 'NewPass1!', confirmPassword: 'NewPass1!' }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body.accessToken).toBe('access-token')
    expect(body.refreshToken).toBe('refresh-token')
    expect(body.user.email).toBe('new@example.com')
  })

  it('returns 400 for invalid JSON body', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Invalid JSON body')
  })

  it('returns 400 with validation error for weak password', async () => {
    const { register } = await import('@/api/auth/register')
    const weakError = new Error('Password must be at least 8 characters') as Error & { status: number }
    weakError.status = 400
    ;(register as ReturnType<typeof vi.fn>).mockRejectedValue(weakError)

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com', password: 'Ab1!', confirmPassword: 'Ab1!' }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Password must be at least 8 characters')
  })

  it('returns 400 with validation error for mismatched passwords', async () => {
    const { register } = await import('@/api/auth/register')
    const mismatchError = new Error('Passwords do not match') as Error & { status: number }
    mismatchError.status = 400
    ;(register as ReturnType<typeof vi.fn>).mockRejectedValue(mismatchError)

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com', password: 'NewPass1!', confirmPassword: 'WrongPass1!' }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Passwords do not match')
  })

  it('returns 400 with validation error for invalid email', async () => {
    const { register } = await import('@/api/auth/register')
    const emailError = new Error('Invalid email format') as Error & { status: number }
    emailError.status = 400
    ;(register as ReturnType<typeof vi.fn>).mockRejectedValue(emailError)

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: 'NewPass1!', confirmPassword: 'NewPass1!' }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Invalid email format')
  })

  it('returns 409 for duplicate email', async () => {
    const { register } = await import('@/api/auth/register')
    const dupError = new Error('Email already in use') as Error & { status: number }
    dupError.status = 409
    ;(register as ReturnType<typeof vi.fn>).mockRejectedValue(dupError)

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'existing@example.com', password: 'NewPass1!', confirmPassword: 'NewPass1!' }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(409)
    expect(body.error).toBe('Email already in use')
  })

  it('returns 500 for unknown errors', async () => {
    const { register } = await import('@/api/auth/register')
    ;(register as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Unexpected error'))

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com', password: 'NewPass1!', confirmPassword: 'NewPass1!' }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('Unexpected error')
  })
})
