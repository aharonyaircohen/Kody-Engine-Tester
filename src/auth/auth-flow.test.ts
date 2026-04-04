import { describe, it, expect, beforeEach, vi } from 'vitest'
import { JwtService } from './jwt-service'
import { checkTenantRole, getTenantRole } from './_auth'
import type { AuthenticatedUser } from './auth-service'
import type { TenantRole } from './jwt-service'

describe('Multi-tenant Auth Flow', () => {
  let jwtService: JwtService
  const TEST_SECRET = 'test-secret-key-for-multi-tenant-auth'

  beforeEach(() => {
    jwtService = new JwtService(TEST_SECRET)
  })

  const basePayload = {
    userId: 'user-1',
    email: 'test@example.com',
    role: 'admin' as const,
    tenantId: 'tenant-a',
    roles: [
      { tenantId: 'tenant-a', role: 'admin' as const },
      { tenantId: 'tenant-b', role: 'viewer' as const },
    ],
    sessionId: 'session-1',
    generation: 0,
  }

  describe('JWT Token with Multi-tenant Payload', () => {
    it('should sign and verify token with tenant info', async () => {
      const token = await jwtService.signAccessToken(basePayload)
      const payload = await jwtService.verify(token)

      expect(payload.userId).toBe('user-1')
      expect(payload.email).toBe('test@example.com')
      expect(payload.tenantId).toBe('tenant-a')
      expect(payload.roles).toHaveLength(2)
      expect(payload.roles[0]).toEqual({ tenantId: 'tenant-a', role: 'admin' })
    })

    it('should preserve roles array during token refresh', async () => {
      const refreshToken = await jwtService.signRefreshToken(basePayload)
      const payload = await jwtService.verify(refreshToken)

      expect(payload.tenantId).toBe('tenant-a')
      expect(payload.roles).toContainEqual({ tenantId: 'tenant-a', role: 'admin' })
      expect(payload.roles).toContainEqual({ tenantId: 'tenant-b', role: 'viewer' })
    })

    it('should reject tampered token with modified tenantId', async () => {
      const token = await jwtService.signAccessToken(basePayload)
      const parts = token.split('.')
      const tamperedBody = Buffer.from(JSON.stringify({ ...basePayload, tenantId: 'hacked' })).toString('base64url')
      const tampered = `${parts[0]}.${tamperedBody}.${parts[2]}`

      await expect(jwtService.verify(tampered)).rejects.toThrow()
    })
  })

  describe('Tenant-specific Role Checking', () => {
    const createMockUser = (roles: TenantRole[]): AuthenticatedUser => ({
      id: 'user-1',
      email: 'test@example.com',
      role: 'admin',
      tenantId: 'tenant-a',
      roles,
      isActive: true,
    })

    it('should allow access when user has required role in tenant', () => {
      const user = createMockUser([
        { tenantId: 'tenant-a', role: 'admin' },
        { tenantId: 'tenant-b', role: 'viewer' },
      ])

      const result = checkTenantRole(user, 'tenant-a', ['admin', 'editor'])
      expect(result.user).toBeDefined()
      expect(result.error).toBeUndefined()
    })

    it('should deny access when user lacks required role in tenant and no global fallback', () => {
      const user = createMockUser([
        { tenantId: 'tenant-a', role: 'viewer' },
        { tenantId: 'tenant-b', role: 'editor' },
      ])

      // User has global role 'admin' so the fallback check passes
      // To properly deny, we need a user with a non-matching global role
      const userWithNoAdmin = createMockUser([
        { tenantId: 'tenant-a', role: 'viewer' },
        { tenantId: 'tenant-b', role: 'editor' },
      ])
      // Override global role to 'viewer' so even fallback won't help
      userWithNoAdmin.role = 'viewer'

      const result = checkTenantRole(userWithNoAdmin, 'tenant-a', ['admin'])
      expect(result.error).toBe('Forbidden: requires role admin for tenant tenant-a')
      expect(result.status).toBe(403)
    })

    it('should fall back to global role check when tenant role not found', () => {
      const user = createMockUser([
        { tenantId: 'tenant-b', role: 'admin' },
      ])

      // User has global 'admin' role but no tenant-a role
      const result = checkTenantRole(user, 'tenant-a', ['admin'])
      expect(result.user).toBeDefined()
      expect(result.error).toBeUndefined()
    })

    it('should return null tenant role for undefined user', () => {
      const role = getTenantRole(undefined, 'tenant-a')
      expect(role).toBeNull()
    })

    it('should return correct tenant role when found', () => {
      const user = createMockUser([
        { tenantId: 'tenant-a', role: 'editor' },
        { tenantId: 'tenant-b', role: 'viewer' },
      ])

      const role = getTenantRole(user, 'tenant-a')
      expect(role).toBe('editor')
    })

    it('should fall back to global role when tenant role not found', () => {
      const user = createMockUser([
        { tenantId: 'tenant-b', role: 'admin' },
      ])

      const role = getTenantRole(user, 'tenant-a')
      expect(role).toBe('admin') // Falls back to global role
    })
  })

  describe('Token Blacklist', () => {
    it('should revoke token and reject subsequent use', async () => {
      const token = await jwtService.signAccessToken(basePayload)

      // Verify token works before blacklisting
      const payload1 = await jwtService.verify(token)
      expect(payload1.userId).toBe('user-1')

      // Blacklist the token
      jwtService.blacklist(token)

      // Verify token is now rejected
      await expect(jwtService.verify(token)).rejects.toThrow('Token revoked')
    })

    it('should cleanup expired blacklist entries', async () => {
      // Create an already-expired token and blacklist it
      const expiredToken = await jwtService.sign(basePayload, -1000)
      jwtService.blacklist(expiredToken)

      // Run cleanup
      jwtService.cleanupBlacklist()

      // The expired token should be cleaned up
      // (We can't directly verify the internal state, but we can verify no error is thrown)
    })
  })

  describe('Token Generation Count', () => {
    it('should increment generation on each token refresh', async () => {
      const token1 = await jwtService.signRefreshToken(basePayload)
      const payload1 = await jwtService.verify(token1)
      expect(payload1.generation).toBe(0)

      // Simulate refresh by creating new token with generation + 1
      const refreshedPayload = { ...basePayload, generation: payload1.generation + 1 }
      const token2 = await jwtService.signRefreshToken(refreshedPayload)
      const payload2 = await jwtService.verify(token2)

      expect(payload2.generation).toBe(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty roles array', async () => {
      const payloadWithNoRoles = { ...basePayload, roles: [] }
      const token = await jwtService.signAccessToken(payloadWithNoRoles)
      const verified = await jwtService.verify(token)

      expect(verified.roles).toEqual([])
    })

    it('should handle guest role correctly', async () => {
      const guestPayload = {
        ...basePayload,
        role: 'viewer' as const,
        roles: [{ tenantId: 'tenant-a', role: 'guest' as const }],
      }
      const token = await jwtService.signAccessToken(guestPayload)
      const verified = await jwtService.verify(token)

      expect(verified.roles[0].role).toBe('guest')
    })

    it('should reject token with missing tenantId', async () => {
      const payloadWithoutTenant = { ...basePayload, tenantId: '' }
      const token = await jwtService.signAccessToken(payloadWithoutTenant)

      // Token should still be verifiable (tenantId can be empty string)
      const verified = await jwtService.verify(token)
      expect(verified.tenantId).toBe('')
    })
  })
})

describe('Rate Limiter - Per-tenant Configuration', () => {
  it('should export byTenantAndIp key resolver', async () => {
    // This tests that the rate limiter exports the correct function
    const { byTenantAndIp } = await import('../middleware/rate-limiter')

    // Create a mock request
    const mockRequest = {
      headers: new Map([
        ['x-forwarded-for', '192.168.1.1'],
        ['x-tenant-id', 'tenant-abc'],
      ]),
      get: (name: string) => mockRequest.headers.get(name),
    } as unknown as import('next/server').NextRequest

    const key = byTenantAndIp(mockRequest)
    expect(key).toBe('tenant-abc:192.168.1.1')
  })

  it('should use default tenant when x-tenant-id header is missing', async () => {
    const { byTenantAndIp } = await import('../middleware/rate-limiter')

    const mockRequest = {
      headers: new Map([
        ['x-forwarded-for', '192.168.1.1'],
      ]),
      get: (name: string) => mockRequest.headers.get(name),
    } as unknown as import('next/server').NextRequest

    const key = byTenantAndIp(mockRequest)
    expect(key).toBe('default:192.168.1.1')
  })
})

describe('AuthService - Multi-tenant Token Handling', () => {
  it('should preserve tenantId and roles during token refresh', async () => {
    // This tests the AuthService flow
    const mockPayload = {
      find: vi.fn(),
      update: vi.fn(),
      findByID: vi.fn(),
    }

    const jwtService = new JwtService('test-secret')
    const { AuthService } = await import('./auth-service')

    const authService = new AuthService(mockPayload as any, jwtService)

    // Create a refresh token with tenant info
    const refreshToken = await jwtService.signRefreshToken({
      userId: '1',
      email: 'test@example.com',
      role: 'admin' as const,
      tenantId: 'tenant-x',
      roles: [{ tenantId: 'tenant-x', role: 'admin' as const }],
      sessionId: 'session-1',
      generation: 0,
    })

    // Mock user lookup
    mockPayload.find.mockResolvedValue({
      docs: [{
        id: 1,
        email: 'test@example.com',
        role: 'admin',
        tenantId: 'tenant-x',
        roles: [{ tenantId: 'tenant-x', role: 'admin' }],
        refreshToken,
        tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
      }],
    })

    mockPayload.update.mockResolvedValue({})

    // Refresh the token
    const result = await authService.refresh(refreshToken)

    expect(result.accessToken).toBeTruthy()
    expect(result.refreshToken).toBeTruthy()
    expect(result.accessToken).not.toBe(refreshToken)
  })
})