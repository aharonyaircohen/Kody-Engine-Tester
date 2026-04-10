import { describe, it, expect, beforeEach } from 'vitest'
import { createJwtMiddleware } from './auth-middleware'
import { UserStore } from '../auth/user-store'
import { JwtService } from '../auth/jwt-service'

describe('AuthMiddleware', () => {
  let userStore: UserStore
  let jwtService: JwtService
  let middleware: ReturnType<typeof createJwtMiddleware>

  beforeEach(async () => {
    userStore = new UserStore()
    await userStore.ready
    jwtService = new JwtService('test-secret')
    middleware = createJwtMiddleware(userStore, jwtService)
  })

  async function makeAuthenticatedContext() {
    const user = await userStore.findByEmail('admin@example.com')
    const accessToken = await jwtService.signAccessToken({
      userId: user!.id,
      email: user!.email,
      role: user!.role as 'admin' | 'editor' | 'viewer',
      sessionId: '',
      generation: 0,
    })
    const refreshToken = await jwtService.signRefreshToken({
      userId: user!.id,
      email: user!.email,
      role: user!.role as 'admin' | 'editor' | 'viewer',
      sessionId: '',
      generation: 0,
    })
    return { user: user!, accessToken, refreshToken }
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
      { userId: user!.id, email: user!.email, role: user!.role as 'admin' | 'editor' | 'viewer', sessionId: '', generation: 0 },
      -1000
    )
    const result = await middleware({ authorization: `Bearer ${expiredToken}`, ip: '127.0.0.1' })
    expect(result.status).toBe(401)
  })

  it('should return 401 for inactive user', async () => {
    const inactive = await userStore.findByEmail('inactive@example.com')
    const accessToken = await jwtService.signAccessToken({
      userId: inactive!.id,
      email: inactive!.email,
      role: inactive!.role as 'admin' | 'editor' | 'viewer',
      sessionId: '',
      generation: 0,
    })
    const result = await middleware({ authorization: `Bearer ${accessToken}`, ip: '127.0.0.1' })
    expect(result.status).toBe(401)
    expect(result.error).toBe('User not found or inactive')
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