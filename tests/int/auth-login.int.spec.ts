import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { loginRateLimiter } from '@/middleware/auth-rate-limiters'
import { AuthService } from '@/auth/auth-service'
import type { AuthResult } from '@/auth/auth-service'

// Mock getPayloadInstance so the route handler can initialize AuthService
vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(() => Promise.resolve({ find: vi.fn(), update: vi.fn() })),
}))

import { POST as loginPost } from '@/app/api/auth/login/route'

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    loginRateLimiter.reset()
  })

  function buildRequest(body: Record<string, unknown>): NextRequest {
    return new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  const successResult: AuthResult = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: { id: 1, email: 'user@example.com', role: 'viewer' },
  }

  it('returns 200 with accessToken, refreshToken, and user on valid credentials', async () => {
    // Spy on AuthService.prototype.login so all instances use this spy
    const loginSpy = vi.spyOn(AuthService.prototype, 'login').mockResolvedValue(successResult)

    const res = await loginPost(buildRequest({ email: 'user@example.com', password: 'ValidPass1!' }))

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveProperty('accessToken', 'mock-access-token')
    expect(json).toHaveProperty('refreshToken', 'mock-refresh-token')
    expect(json.user).toMatchObject({ email: 'user@example.com', role: 'viewer' })

    loginSpy.mockRestore()
  })

  it('returns 400 for missing email', async () => {
    const res = await loginPost(buildRequest({ email: '', password: 'ValidPass1!' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for missing password', async () => {
    const res = await loginPost(buildRequest({ email: 'user@example.com', password: '' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for malformed email', async () => {
    const res = await loginPost(buildRequest({ email: 'not-an-email', password: 'ValidPass1!' }))
    expect(res.status).toBe(400)
  })

  it('returns 401 for non-existent email', async () => {
    const err = new Error('Invalid credentials') as Error & { status: number }
    err.status = 401
    const loginSpy = vi.spyOn(AuthService.prototype, 'login').mockRejectedValue(err)

    const res = await loginPost(buildRequest({ email: 'ghost@example.com', password: 'ValidPass1!' }))
    expect(res.status).toBe(401)

    loginSpy.mockRestore()
  })

  it('returns 401 for wrong password', async () => {
    const err = new Error('Invalid credentials') as Error & { status: number }
    err.status = 401
    const loginSpy = vi.spyOn(AuthService.prototype, 'login').mockRejectedValue(err)

    const res = await loginPost(buildRequest({ email: 'user@example.com', password: 'WrongPass1!' }))
    expect(res.status).toBe(401)

    loginSpy.mockRestore()
  })

  it('returns 403 for inactive account', async () => {
    const err = new Error('Account is inactive') as Error & { status: number }
    err.status = 403
    const loginSpy = vi.spyOn(AuthService.prototype, 'login').mockRejectedValue(err)

    const res = await loginPost(buildRequest({ email: 'inactive@example.com', password: 'ValidPass1!' }))
    expect(res.status).toBe(403)

    loginSpy.mockRestore()
  })

  it('returns 429 when rate limit is exceeded', async () => {
    const loginSpy = vi.spyOn(AuthService.prototype, 'login').mockResolvedValue(successResult)

    // Make 11 requests (the rate limit cap is 10)
    const requests = Array.from({ length: 11 }, () =>
      loginPost(buildRequest({ email: 'user@example.com', password: 'ValidPass1!' }))
    )

    const results = await Promise.all(requests)
    const lastResult = results[results.length - 1]
    expect(lastResult.status).toBe(429)

    loginSpy.mockRestore()
  })

  it('returns 400 for invalid JSON body', async () => {
    // Fresh rate limiter (reset in beforeEach) so this test isn't affected by other tests
    const badReq = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not valid json',
    })

    const res = await loginPost(badReq as unknown as Parameters<typeof loginPost>[0])
    expect(res.status).toBe(400)
  })
})
