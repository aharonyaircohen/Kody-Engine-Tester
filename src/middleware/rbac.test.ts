import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRbacMiddleware, createRbacMiddlewareWithAuth } from './rbac'
import type { RbacRole } from '../auth/auth-service'
import type { RbacContext } from './rbac'
import { JwtService } from '../auth/jwt-service'

describe('rbac middleware', () => {
  describe('createRbacMiddleware', () => {
    it('should call next() when user has sufficient role', () => {
      const middleware = createRbacMiddleware({ roles: ['editor'] })
      const context: RbacContext = {
        user: { id: '1', email: 'test@test.com', role: 'editor' as RbacRole, isActive: true },
      }
      let nextCalled = false
      middleware(context, () => {
        nextCalled = true
      })
      expect(nextCalled).toBe(true)
      expect((context as RbacContext & { error?: string }).error).toBeUndefined()
    })

    it('should call next() when user has higher role (admin accesses editor route)', () => {
      const middleware = createRbacMiddleware({ roles: ['editor'] })
      const context: RbacContext = {
        user: { id: '1', email: 'test@test.com', role: 'admin' as RbacRole, isActive: true },
      }
      let nextCalled = false
      middleware(context, () => {
        nextCalled = true
      })
      expect(nextCalled).toBe(true)
    })

    it('should set error 403 when user has insufficient role', () => {
      const middleware = createRbacMiddleware({ roles: ['admin'] })
      const context: RbacContext = {
        user: { id: '1', email: 'test@test.com', role: 'viewer' as RbacRole, isActive: true },
      }
      let nextCalled = false
      middleware(context, () => {
        nextCalled = true
      })
      expect(nextCalled).toBe(false)
      expect(context.error).toContain('Forbidden')
      expect(context.status).toBe(403)
    })

    it('should set error 401 when no user provided (non-optional)', () => {
      const middleware = createRbacMiddleware({ roles: ['editor'] })
      const context: RbacContext = {}
      let nextCalled = false
      middleware(context, () => {
        nextCalled = true
      })
      expect(nextCalled).toBe(false)
      expect(context.error).toBe('Authentication required')
      expect(context.status).toBe(401)
    })

    it('should call next() in optional mode without user', () => {
      const middleware = createRbacMiddleware({ roles: ['editor'], optional: true })
      const context: RbacContext = {}
      let nextCalled = false
      middleware(context, () => {
        nextCalled = true
      })
      expect(nextCalled).toBe(true)
    })

    it('should call next() in optional mode with sufficient role user', () => {
      const middleware = createRbacMiddleware({ roles: ['editor'], optional: true })
      const context: RbacContext = {
        user: { id: '1', email: 'test@test.com', role: 'editor' as RbacRole, isActive: true },
      }
      let nextCalled = false
      middleware(context, () => {
        nextCalled = true
      })
      expect(nextCalled).toBe(true)
    })

    it('should allow access when no roles are required', () => {
      const middleware = createRbacMiddleware({})
      const context: RbacContext = {
        user: { id: '1', email: 'test@test.com', role: 'viewer' as RbacRole, isActive: true },
      }
      let nextCalled = false
      middleware(context, () => {
        nextCalled = true
      })
      expect(nextCalled).toBe(true)
    })
  })

  describe('createRbacMiddlewareWithAuth', () => {
    let jwtService: JwtService

    beforeEach(() => {
      jwtService = new JwtService('test-secret')
    })

    it('should return user context for valid token with correct role', async () => {
      const user = { id: '1', email: 'test@test.com', role: 'editor' as RbacRole, isActive: true }
      const token = await jwtService.signAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId: 'session-1',
        generation: 0,
      })

      const middleware = createRbacMiddlewareWithAuth({ roles: ['editor'] })
      const result = await middleware(`Bearer ${token}`, jwtService)

      expect(result.user).toBeDefined()
      expect(result.user?.role).toBe('editor')
      expect(result.error).toBeUndefined()
    })

    it('should return 403 for insufficient role with valid token', async () => {
      const user = { id: '1', email: 'test@test.com', role: 'viewer' as RbacRole, isActive: true }
      const token = await jwtService.signAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId: 'session-1',
        generation: 0,
      })

      const middleware = createRbacMiddlewareWithAuth({ roles: ['admin'] })
      const result = await middleware(`Bearer ${token}`, jwtService)

      expect(result.user).toBeUndefined()
      expect(result.error).toContain('Forbidden')
      expect(result.status).toBe(403)
    })

    it('should return 401 for missing token (non-optional)', async () => {
      const middleware = createRbacMiddlewareWithAuth({ roles: ['editor'] })
      const result = await middleware(null, jwtService)

      expect(result.user).toBeUndefined()
      expect(result.error).toBe('Missing or invalid Authorization header')
      expect(result.status).toBe(401)
    })

    it('should return empty context for optional mode without token', async () => {
      const middleware = createRbacMiddlewareWithAuth({ roles: ['editor'], optional: true })
      const result = await middleware(null, jwtService)

      expect(result.user).toBeUndefined()
      expect(result.error).toBeUndefined()
    })

    it('should return 401 for invalid token', async () => {
      const middleware = createRbacMiddlewareWithAuth({ roles: ['editor'] })
      const result = await middleware('Bearer invalid-token', jwtService)

      expect(result.user).toBeUndefined()
      expect(result.error).toBe('Invalid token format')
      expect(result.status).toBe(401)
    })

    it('should hierarchical role inheritance - admin can access editor-required routes', async () => {
      const user = { id: '1', email: 'test@test.com', role: 'admin' as RbacRole, isActive: true }
      const token = await jwtService.signAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId: 'session-1',
        generation: 0,
      })

      const middleware = createRbacMiddlewareWithAuth({ roles: ['editor'] })
      const result = await middleware(`Bearer ${token}`, jwtService)

      expect(result.user).toBeDefined()
      expect(result.user?.role).toBe('admin')
      expect(result.error).toBeUndefined()
    })
  })
})