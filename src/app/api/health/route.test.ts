import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'
import { userStore, sessionStore, jwtService } from '@/auth'

describe('GET /api/health', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-05T12:00:00.000Z'))
    await userStore.ready
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  async function createAuthenticatedRequest() {
    const user = await userStore.findByEmail('admin@example.com')
    const accessToken = await jwtService.signAccessToken({
      userId: user!.id,
      email: user!.email,
      role: user!.role as 'admin' | 'editor' | 'viewer',
      sessionId: 'session-1',
      generation: 0,
    })
    const refreshToken = await jwtService.signRefreshToken({
      userId: user!.id,
      email: user!.email,
      role: user!.role as 'admin' | 'editor' | 'viewer',
      sessionId: 'session-1',
      generation: 0,
    })
    sessionStore.create(user!.id, accessToken, refreshToken, '127.0.0.1', 'TestAgent')
    return new NextRequest('http://localhost/api/health', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  }

  it('returns health check response with correct structure', async () => {
    const request = await createAuthenticatedRequest()
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')

    const body = await response.json()
    expect(body).toHaveProperty('status', 'ok')
    expect(body).toHaveProperty('uptime')
    expect(typeof body.uptime).toBe('number')
    expect(body.uptime).toBeGreaterThanOrEqual(0)
    expect(body).toHaveProperty('timestamp', '2026-04-05T12:00:00.000Z')
  })

  it('returns 401 when no token provided', async () => {
    const request = new NextRequest('http://localhost/api/health')
    const response = await GET(request)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })

  it('returns 401 for invalid token', async () => {
    const request = new NextRequest('http://localhost/api/health', {
      headers: { Authorization: 'Bearer invalid-token' },
    })
    const response = await GET(request)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })
})