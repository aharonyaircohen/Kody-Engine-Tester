import { describe, it, expect, beforeAll } from 'vitest'
import { NextRequest } from 'next/server'
import { UserStore } from '@/auth/user-store'
import { SessionStore } from '@/auth/session-store'
import { JwtService } from '@/auth/jwt-service'
import { createAuthMiddleware } from '@/middleware/auth-middleware'

// Replicate the middleware logic for testing without importing the actual middleware
// (which would require full Next.js setup)
function createTestAuthMiddleware(
  userStore: UserStore,
  sessionStore: SessionStore,
  jwtService: JwtService
) {
  return async function authMiddleware(req: { authorization?: string; ip?: string }) {
    const ip = req.ip ?? 'unknown'
    const authHeader = req.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Missing or invalid Authorization header', status: 401 }
    }

    const token = authHeader.slice(7)

    let payload
    try {
      payload = await jwtService.verify(token)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid token'
      return { error: message, status: 401 }
    }

    const session = sessionStore.findByToken(token)
    if (!session) {
      return { error: 'Session not found or expired', status: 401 }
    }

    if (payload.generation < session.generation) {
      return { error: 'Token has been superseded by a newer session', status: 401 }
    }

    const user = await userStore.findById(payload.userId)
    if (!user || !user.isActive) {
      return { error: 'User not found or inactive', status: 401 }
    }

    return { user, session }
  }
}

describe('Middleware Integration', () => {
  let userStore: UserStore
  let sessionStore: SessionStore
  let jwtService: JwtService
  let middleware: ReturnType<typeof createAuthMiddleware>

  beforeAll(async () => {
    userStore = new UserStore()
    await userStore.ready
    sessionStore = new SessionStore()
    jwtService = new JwtService('test-secret')
    middleware = createAuthMiddleware(userStore, sessionStore, jwtService)
  })

  async function createValidSession() {
    const user = await userStore.findByEmail('admin@example.com')
    if (!user) throw new Error('Test user not found')

    const accessToken = await jwtService.signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'admin' | 'editor' | 'viewer',
      sessionId: 'session-1',
      generation: 0,
    })
    const refreshToken = await jwtService.signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'admin' | 'editor' | 'viewer',
      sessionId: 'session-1',
      generation: 0,
    })
    const session = sessionStore.create(user.id, accessToken, refreshToken, '127.0.0.1', 'TestAgent')
    return { user, accessToken, refreshToken, session }
  }

  describe('Protected endpoint access', () => {
    it('should allow access with valid token', async () => {
      const { user, accessToken } = await createValidSession()

      const result = await middleware({
        authorization: `Bearer ${accessToken}`,
        ip: '127.0.0.1',
      })

      expect(result.user).toBeDefined()
      expect(result.user?.id).toBe(user.id)
      expect(result.error).toBeUndefined()
    })

    it('should return 401 without token', async () => {
      const result = await middleware({
        authorization: undefined,
        ip: '127.0.0.1',
      })

      expect(result.status).toBe(401)
      expect(result.error).toBe('Missing or invalid Authorization header')
    })

    it('should return 401 with malformed token', async () => {
      const result = await middleware({
        authorization: 'Bearer invalid-token-format',
        ip: '127.0.0.1',
      })

      expect(result.status).toBe(401)
    })

    it('should return 401 with expired token', async () => {
      const user = await userStore.findByEmail('user@example.com')
      const expiredToken = await jwtService.sign(
        {
          userId: user!.id,
          email: user!.email,
          role: user!.role as 'admin' | 'editor' | 'viewer',
          sessionId: 'session-1',
          generation: 0,
        },
        -1000 // Already expired
      )

      const result = await middleware({
        authorization: `Bearer ${expiredToken}`,
        ip: '127.0.0.1',
      })

      expect(result.status).toBe(401)
    })
  })

  describe('Auth context attachment', () => {
    it('should attach userId and email to context for valid tokens', async () => {
      const { user, accessToken } = await createValidSession()

      const result = await middleware({
        authorization: `Bearer ${accessToken}`,
        ip: '127.0.0.1',
      })

      expect(result.user).toBeDefined()
      expect(result.user?.id).toBe(user.id)
      expect(result.user?.email).toBe(user.email)
    })

    it('should attach session to context for valid tokens', async () => {
      const { session, accessToken } = await createValidSession()

      const result = await middleware({
        authorization: `Bearer ${accessToken}`,
        ip: '127.0.0.1',
      })

      expect(result.session).toBeDefined()
      expect(result.session?.id).toBe(session.id)
    })
  })
})
