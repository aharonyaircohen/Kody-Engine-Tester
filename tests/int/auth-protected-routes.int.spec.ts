import { NextRequest } from 'next/server'
import { describe, it, expect, beforeAll } from 'vitest'
import { withAuth } from '@/auth/withAuth'
import { JwtService } from '@/auth/jwt-service'
import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

let payload: Payload
let jwtService: JwtService

// Test route handler that returns 200 if user is authenticated
const mockHandler = withAuth(async (req: NextRequest, context) => {
  if (!context.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return Response.json({ user: context.user }, { status: 200 })
}, { roles: ['admin', 'editor', 'viewer'] })

// Test route handler without roles (just requires auth)
const mockHandlerAuthRequired = withAuth(async (req: NextRequest, context) => {
  if (!context.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return Response.json({ user: context.user }, { status: 200 })
})

describe('Auth Protected Routes Integration', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
    // Use same secret as withAuth (from process.env.JWT_SECRET or default)
    jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')
  })

  async function getTestUser() {
    const users = await payload.find({
      collection: 'users',
      limit: 1,
    })
    if (!users.docs[0]) {
      throw new Error('No test user found. Ensure database is seeded.')
    }
    const user = users.docs[0] as { id: string | number; email: string; role: 'admin' | 'editor' | 'viewer' }
    return user
  }

  describe('Protected endpoint rejects unauthenticated request', () => {
    it('returns 401 when no Authorization header is provided', async () => {
      const request = new NextRequest('http://localhost/api/test', {
        method: 'GET',
      })
      const response = await mockHandler(request)
      expect(response.status).toBe(401)
    })

    it('returns 401 when Authorization header is malformed', async () => {
      const request = new NextRequest('http://localhost/api/test', {
        method: 'GET',
        headers: {
          'Authorization': 'InvalidScheme token',
        },
      })
      const response = await mockHandler(request)
      expect(response.status).toBe(401)
    })

    it('returns 401 when token is invalid', async () => {
      const request = new NextRequest('http://localhost/api/test', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      })
      const response = await mockHandler(request)
      expect(response.status).toBe(401)
    })
  })

  describe('Protected endpoint accepts authenticated request', () => {
    it('returns 200 with valid JWT token', async () => {
      const user = await getTestUser()
      const token = await jwtService.signAccessToken({
        userId: String(user.id),
        email: user.email,
        role: user.role,
        sessionId: 'test-session',
        generation: 0,
      })

      const request = new NextRequest('http://localhost/api/test', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const response = await mockHandler(request)
      expect(response.status).toBe(200)

      const body = await response.json()
      expect(body.user).toBeDefined()
      expect(body.user.email).toBe(user.email)
    })

    it('returns 200 with valid token for route requiring any authenticated user', async () => {
      const user = await getTestUser()
      const token = await jwtService.signAccessToken({
        userId: String(user.id),
        email: user.email,
        role: user.role,
        sessionId: 'test-session',
        generation: 0,
      })

      const request = new NextRequest('http://localhost/api/test', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const response = await mockHandlerAuthRequired(request)
      expect(response.status).toBe(200)
    })
  })

  describe('Token expiration handling', () => {
    it('returns 401 for expired token', async () => {
      const user = await getTestUser()
      // Create an expired token by signing with negative expiry
      const expiredToken = await jwtService.sign(
        {
          userId: String(user.id),
          email: user.email,
          role: user.role,
          sessionId: 'test-session',
          generation: 0,
        },
        -1000 // expired 1 second ago
      )

      const request = new NextRequest('http://localhost/api/test', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${expiredToken}`,
        },
      })
      const response = await mockHandler(request)
      expect(response.status).toBe(401)
    })
  })
})