import { describe, it, expect, beforeEach } from 'vitest'
import { createAuthMiddleware } from './auth-middleware'
import { UserStore } from '../auth/user-store'
import { JwtAuthStore } from '../auth/jwt-auth-store'
import { JwtService } from '../auth/jwt-service'

describe('AuthMiddleware', () => {
  let userStore: UserStore
  let jwtAuthStore: JwtAuthStore
  let jwtService: JwtService
  let middleware: ReturnType<typeof createAuthMiddleware>

  beforeEach(async () => {
    userStore = new UserStore()
    await userStore.ready
    jwtAuthStore = new JwtAuthStore()
    jwtService = new JwtService('test-secret')
    middleware = createAuthMiddleware(userStore, jwtAuthStore, jwtService)
  })

  async function makeAuthenticatedContext() {
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
    const storedToken = jwtAuthStore.create(user!.id, accessToken, refreshToken)
    return { user: user!, accessToken, storedToken }
  }

  it('should attach user to context on valid token', async () => {
    const { user, accessToken } = await makeAuthenticatedContext()
    const result = await middleware({ authorization: `Bearer ${accessToken}`, ip: '127.0.0.1' })
    expect(result.user?.id).toBe(user.id)
    expect(result.error).toBeUndefined()
  })

  it('should return 401 when no token provided', async () => {
    const result = await middleware({ authorization: undefined, ip: '127.0.0.1' })
    expect(result.status).toBe(401)
    expect(result.error).toBeDefined()
  })

  it('should return 401 for invalid token', async () => {
    const result = await middleware({ authorization: 'Bearer invalid-token', ip: '127.0.0.1' })
    expect(result.status).toBe(401)
    expect(result.error).toBeDefined()
  })

  it('should return 401 for expired token', async () => {
    const user = await userStore.findByEmail('user@example.com')
    const expiredToken = await jwtService.sign(
      { userId: user!.id, email: user!.email, role: user!.role as 'admin' | 'editor' | 'viewer', sessionId: 'session-1', generation: 0 },
      -1000
    )
    const result = await middleware({ authorization: `Bearer ${expiredToken}`, ip: '127.0.0.1' })
    expect(result.status).toBe(401)
  })

  it('should return 401 for revoked token', async () => {
    const { accessToken, storedToken } = await makeAuthenticatedContext()
    jwtAuthStore.revoke(storedToken.token)
    const result = await middleware({ authorization: `Bearer ${accessToken}`, ip: '127.0.0.1' })
    expect(result.status).toBe(401)
  })

  it('should return 401 for token with older generation after refresh', async () => {
    const user = await userStore.findByEmail('user@example.com')
    const oldAccessToken = await jwtService.signAccessToken({
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
    const storedToken = jwtAuthStore.create(user!.id, oldAccessToken, refreshToken)
    // Manually bump the generation to simulate a refresh
    jwtAuthStore['tokens'].set(storedToken.token, { ...storedToken, generation: 1 })
    const result = await middleware({ authorization: `Bearer ${oldAccessToken}`, ip: '127.0.0.1' })
    expect(result.status).toBe(401)
    expect(result.error).toBe('Token has been superseded by a newer session')
  })

  it('should allow requests under rate limit', async () => {
    const { accessToken } = await makeAuthenticatedContext()
    const result = await middleware({ authorization: `Bearer ${accessToken}`, ip: '10.0.0.1' })
    expect(result.status).toBeUndefined()
    expect(result.user).toBeDefined()
  })

  it('should block requests exceeding rate limit', async () => {
    const ip = '192.168.1.100'
    // Make 100 requests
    for (let i = 0; i < 100; i++) {
      await middleware({ authorization: undefined, ip })
    }
    const result = await middleware({ authorization: undefined, ip })
    expect(result.status).toBe(429)
  })
})