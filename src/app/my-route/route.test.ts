import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'
import { UserStore } from '@/auth/user-store'
import { SessionStore } from '@/auth/session-store'
import { JwtService } from '@/auth/jwt-service'

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

describe('GET /my-route', () => {
  let userStore: UserStore
  let sessionStore: SessionStore
  let jwtService: JwtService
  let validToken: string
  let testUser: { id: string; email: string }

  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-10T12:00:00.000Z'))

    // Set the JWT_SECRET to match what withAuth uses
    vi.stubEnv('JWT_SECRET', 'test-secret')

    userStore = new UserStore()
    await userStore.ready
    sessionStore = new SessionStore()
    jwtService = new JwtService('test-secret')

    // Create a test user and generate a valid token
    testUser = await userStore.findByEmail('admin@example.com') as { id: string; email: string }
    const accessToken = await jwtService.signAccessToken({
      userId: testUser.id,
      email: testUser.email,
      role: 'admin',
      sessionId: 'session-1',
      generation: 0,
    })
    const refreshToken = await jwtService.signRefreshToken({
      userId: testUser.id,
      email: testUser.email,
      role: 'admin',
      sessionId: 'session-1',
      generation: 0,
    })
    sessionStore.create(testUser.id, accessToken, refreshToken, '127.0.0.1', 'TestAgent')
    validToken = accessToken
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
  })

  it('returns 401 without authorization header', async () => {
    const request = new NextRequest('http://localhost/my-route')
    const response = await GET(request)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body).toHaveProperty('error', 'Missing or invalid Authorization header')
  })

  it('returns 401 with malformed token', async () => {
    const request = new NextRequest('http://localhost/my-route', {
      headers: { Authorization: 'Bearer invalid-token' },
    })
    const response = await GET(request)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })

  it('returns 401 with expired token', async () => {
    const expiredToken = await jwtService.sign(
      { userId: testUser.id, email: testUser.email, role: 'admin', sessionId: 'session-1', generation: 0 },
      -1000 // expired 1000ms ago
    )
    const request = new NextRequest('http://localhost/my-route', {
      headers: { Authorization: `Bearer ${expiredToken}` },
    })
    const response = await GET(request)

    expect(response.status).toBe(401)
  })

  it('returns 200 with valid token', async () => {
    // Set up mock payload to return the user when verifyAccessToken calls find
    mockPayload.find.mockResolvedValue({
      docs: [{
        id: testUser.id,
        email: testUser.email,
        role: 'admin',
        isActive: true,
      }],
    })

    const request = new NextRequest('http://localhost/my-route', {
      headers: { Authorization: `Bearer ${validToken}` },
    })
    const response = await GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('message', 'This is an example of a protected route.')
    expect(body).toHaveProperty('user')
    expect(body.user).toHaveProperty('userId', testUser.id)
    expect(body.user).toHaveProperty('email', testUser.email)
  })
})