import { describe, it, expect, beforeEach } from 'vitest'
import { createAuthMiddleware } from './auth-middleware'
import { UserStore } from '../auth/user-store'
import { JwtService } from '../auth/jwt-service'
import type { RbacRole } from '../auth/_auth'

describe('AuthMiddleware', () => {
  let userStore: UserStore
  let jwtService: JwtService
  let middleware: ReturnType<typeof createAuthMiddleware>

  beforeEach(async () => {
    userStore = new UserStore()
    await userStore.ready
    jwtService = new JwtService('test-secret')
    middleware = createAuthMiddleware(userStore, jwtService)
  })

  async function makeAuthenticatedContext() {
    const user = await userStore.findByEmail('admin@example.com')
    const rbacRole: RbacRole = user!.roles[0] // Use the new roles array
    const accessToken = await jwtService.signAccessToken({
      userId: user!.id,
      email: user!.email,
      role: rbacRole,
      sessionId: 'session-1',
      generation: 0,
    })
    return { user: user!, accessToken }
  }

  it('should attach user and roles to context on valid token', async () => {
    const { user, accessToken } = await makeAuthenticatedContext()
    const result = await middleware({ authorization: `Bearer ${accessToken}`, ip: '127.0.0.1' })
    expect(result.user?.id).toBe(user.id)
    expect(result.roles).toBeDefined()
    expect(result.roles).toContain('admin')
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
    const rbacRole: RbacRole = user!.roles[0]
    const expiredToken = await jwtService.sign(
      { userId: user!.id, email: user!.email, role: rbacRole, sessionId: 'session-1', generation: 0 },
      -1000
    )
    const result = await middleware({ authorization: `Bearer ${expiredToken}`, ip: '127.0.0.1' })
    expect(result.status).toBe(401)
  })

  it('should return 401 for inactive user', async () => {
    const user = await userStore.findByEmail('inactive@example.com')
    const rbacRole: RbacRole = user!.roles[0]
    const accessToken = await jwtService.signAccessToken({
      userId: user!.id,
      email: user!.email,
      role: rbacRole,
      sessionId: 'session-1',
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

  it('should return 401 for non-existent user', async () => {
    const accessToken = await jwtService.signAccessToken({
      userId: 'non-existent-id',
      email: 'none@example.com',
      role: 'viewer' as RbacRole,
      sessionId: 'session-1',
      generation: 0,
    })
    const result = await middleware({ authorization: `Bearer ${accessToken}`, ip: '127.0.0.1' })
    expect(result.status).toBe(401)
    expect(result.error).toBe('User not found or inactive')
  })
})
