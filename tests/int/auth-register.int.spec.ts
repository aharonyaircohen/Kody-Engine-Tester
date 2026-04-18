import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { registerRateLimiter } from '@/middleware/auth-rate-limiters'
import type { AuthResult } from '@/auth/auth-service'

// Mock getPayloadInstance
const mockPayload = { find: vi.fn(), create: vi.fn(), update: vi.fn() }
vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(() => Promise.resolve(mockPayload)),
}))

// Mock the register utility from src/api/auth/register so we control the outcome
vi.mock('@/api/auth/register', () => ({
  register: vi.fn(),
}))

import { register as registerUser } from '@/api/auth/register'
import { POST as registerPost } from '@/app/api/auth/register/route'

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    registerRateLimiter.reset()
  })

  function buildRequest(body: Record<string, unknown>): NextRequest {
    return new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  const successResult: AuthResult = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: { id: 1, email: 'newuser@example.com', role: 'viewer' },
  }

  it('returns 200 with tokens and user on valid registration', async () => {
    vi.mocked(registerUser).mockResolvedValueOnce(successResult)

    const res = await registerPost(
      buildRequest({
        email: 'newuser@example.com',
        password: 'ValidPass1!',
        confirmPassword: 'ValidPass1!',
      })
    )

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveProperty('accessToken', 'mock-access-token')
    expect(json).toHaveProperty('refreshToken', 'mock-refresh-token')
    expect(json.user).toMatchObject({ email: 'newuser@example.com', role: 'viewer' })
  })

  it('returns 409 for existing email', async () => {
    const err = new Error('Email already in use') as Error & { status: number }
    err.status = 409
    vi.mocked(registerUser).mockRejectedValueOnce(err)

    const res = await registerPost(
      buildRequest({
        email: 'taken@example.com',
        password: 'ValidPass1!',
        confirmPassword: 'ValidPass1!',
      })
    )

    expect(res.status).toBe(409)
  })

  it('returns 400 for password mismatch', async () => {
    const res = await registerPost(
      buildRequest({
        email: 'new@example.com',
        password: 'ValidPass1!',
        confirmPassword: 'DifferentPass1!',
      })
    )

    expect(res.status).toBe(400)
  })

  it('returns 400 for weak password — too short', async () => {
    const res = await registerPost(
      buildRequest({
        email: 'new@example.com',
        password: 'Ab1!xyz',
        confirmPassword: 'Ab1!xyz',
      })
    )

    expect(res.status).toBe(400)
  })

  it('returns 400 for weak password — missing uppercase', async () => {
    const res = await registerPost(
      buildRequest({
        email: 'new@example.com',
        password: 'password1!',
        confirmPassword: 'password1!',
      })
    )

    expect(res.status).toBe(400)
  })

  it('returns 400 for weak password — missing number', async () => {
    const res = await registerPost(
      buildRequest({
        email: 'new@example.com',
        password: 'Password!',
        confirmPassword: 'Password!',
      })
    )

    expect(res.status).toBe(400)
  })

  it('returns 400 for weak password — missing special character', async () => {
    const res = await registerPost(
      buildRequest({
        email: 'new@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
      })
    )

    expect(res.status).toBe(400)
  })

  it('returns 400 for malformed email', async () => {
    const res = await registerPost(
      buildRequest({
        email: 'not-an-email',
        password: 'ValidPass1!',
        confirmPassword: 'ValidPass1!',
      })
    )

    expect(res.status).toBe(400)
  })

  it('returns 400 for missing fields', async () => {
    const res = await registerPost(buildRequest({}))
    expect(res.status).toBe(400)
  })

  it('returns 429 when rate limit is exceeded', async () => {
    vi.mocked(registerUser).mockResolvedValue(successResult)

    // Make 6 requests (the rate limit cap for registration is 5)
    const requests = Array.from({ length: 6 }, () =>
      registerPost(
        buildRequest({
          email: 'new@example.com',
          password: 'ValidPass1!',
          confirmPassword: 'ValidPass1!',
        })
      )
    )

    const results = await Promise.all(requests)
    const lastResult = results[results.length - 1]
    expect(lastResult.status).toBe(429)
  })
})
