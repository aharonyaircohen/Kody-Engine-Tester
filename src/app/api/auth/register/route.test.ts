import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock Payload
vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(() => ({
    find: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  })),
}))

vi.mock('@/auth/auth-service', () => ({
  AuthService: vi.fn(),
}))

vi.mock('@/auth/jwt-service', () => ({
  JwtService: vi.fn(),
}))

// Mock the register function
vi.mock('@/api/auth/register', () => ({
  register: vi.fn(),
}))

import { register } from '@/api/auth/register'
import { POST } from './route'

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 201 with tokens on successful registration', async () => {
    const mockResult = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: { id: '1', email: 'new@example.com', role: 'viewer' },
    }
    ;(register as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult)

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'new@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)
    expect(response.headers.get('Content-Type')).toBe('application/json')

    const body = await response.json()
    expect(body.accessToken).toBe('mock-access-token')
    expect(body.refreshToken).toBe('mock-refresh-token')
    expect(body.user.email).toBe('new@example.com')
  })

  it('returns 409 for duplicate email', async () => {
    const error = new Error('Email already in use') as Error & { status: number }
    error.status = 409
    ;(register as ReturnType<typeof vi.fn>).mockRejectedValue(error)

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'existing@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(409)

    const body = await response.json()
    expect(body.error).toBe('Email already in use')
  })

  it('returns 400 for weak password', async () => {
    const error = new Error('Password must be at least 8 characters') as Error & { status: number }
    error.status = 400
    ;(register as ReturnType<typeof vi.fn>).mockRejectedValue(error)

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

    const body = await response.json()
    expect(body.error).toBe('Password must be at least 8 characters')
  })

  it('returns 400 for mismatched passwords', async () => {
    const error = new Error('Passwords do not match') as Error & { status: number }
    error.status = 400
    ;(register as ReturnType<typeof vi.fn>).mockRejectedValue(error)

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'new@example.com',
        password: 'Password123!',
        confirmPassword: 'Different123!',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body.error).toBe('Passwords do not match')
  })

  it('returns 400 for invalid email', async () => {
    const error = new Error('Invalid email format') as Error & { status: number }
    error.status = 400
    ;(register as ReturnType<typeof vi.fn>).mockRejectedValue(error)

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'not-an-email',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body.error).toBe('Invalid email format')
  })

  it('returns 400 for missing fields', async () => {
    const error = new Error('Email, password, and confirm password are required') as Error & { status: number }
    error.status = 400
    ;(register as ReturnType<typeof vi.fn>).mockRejectedValue(error)

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body.error).toBe('Email, password, and confirm password are required')
  })

  it('returns 500 for unexpected errors', async () => {
    ;(register as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Unexpected error'))

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'new@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(500)

    const body = await response.json()
    expect(body.error).toBe('Unexpected error')
  })
})