import { describe, it, expect, beforeEach } from 'vitest'
import { createRbacMiddleware, type RbacContext, type RbacOptions } from './rbac'
import type { RbacRole } from '../auth/auth-service'

// Helper to create a mock request
function createMockRequest(authHeader?: string): Request {
  return new Request('http://localhost', {
    headers: authHeader ? { authorization: authHeader } : {},
  })
}

// Helper to create mock next handler
function createMockNext() {
  return async () => new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('createRbacMiddleware', () => {
  let mockNext: ReturnType<typeof createMockNext>

  beforeEach(() => {
    mockNext = createMockNext()
  })

  describe('role hierarchy', () => {
    it('should allow admin to access admin-only routes', async () => {
      const middleware = createRbacMiddleware({ roles: ['admin'] })
      const context: RbacContext = {
        user: { id: '1', email: 'admin@test.com', role: 'admin', isActive: true },
      }
      const result = await middleware(context, mockNext)
      expect(result).toBeUndefined() // undefined means authorized
    })

    it('should allow admin to access editor routes (hierarchical)', async () => {
      const middleware = createRbacMiddleware({ roles: ['editor'] })
      const context: RbacContext = {
        user: { id: '1', email: 'admin@test.com', role: 'admin', isActive: true },
      }
      const result = await middleware(context, mockNext)
      expect(result).toBeUndefined()
    })

    it('should allow admin to access viewer routes (hierarchical)', async () => {
      const middleware = createRbacMiddleware({ roles: ['viewer'] })
      const context: RbacContext = {
        user: { id: '1', email: 'admin@test.com', role: 'admin', isActive: true },
      }
      const result = await middleware(context, mockNext)
      expect(result).toBeUndefined()
    })

    it('should allow editor to access viewer routes (hierarchical)', async () => {
      const middleware = createRbacMiddleware({ roles: ['viewer'] })
      const context: RbacContext = {
        user: { id: '1', email: 'editor@test.com', role: 'editor', isActive: true },
      }
      const result = await middleware(context, mockNext)
      expect(result).toBeUndefined()
    })

    it('should deny viewer access to editor routes', async () => {
      const middleware = createRbacMiddleware({ roles: ['editor'] })
      const context: RbacContext = {
        user: { id: '1', email: 'viewer@test.com', role: 'viewer', isActive: true },
      }
      const result = await middleware(context, mockNext)
      expect(result).toBeDefined()
      expect(result?.status).toBe(403)
      expect(result?.error).toContain('editor')
    })

    it('should deny viewer access to admin routes', async () => {
      const middleware = createRbacMiddleware({ roles: ['admin'] })
      const context: RbacContext = {
        user: { id: '1', email: 'viewer@test.com', role: 'viewer', isActive: true },
      }
      const result = await middleware(context, mockNext)
      expect(result).toBeDefined()
      expect(result?.status).toBe(403)
      expect(result?.error).toContain('admin')
    })

    it('should deny editor access to admin routes', async () => {
      const middleware = createRbacMiddleware({ roles: ['admin'] })
      const context: RbacContext = {
        user: { id: '1', email: 'editor@test.com', role: 'editor', isActive: true },
      }
      const result = await middleware(context, mockNext)
      expect(result).toBeDefined()
      expect(result?.status).toBe(403)
      expect(result?.error).toContain('admin')
    })
  })

  describe('multiple allowed roles', () => {
    it('should allow access when user has one of multiple allowed roles', async () => {
      const middleware = createRbacMiddleware({ roles: ['admin', 'editor'] })
      const editorContext: RbacContext = {
        user: { id: '1', email: 'editor@test.com', role: 'editor', isActive: true },
      }
      const adminContext: RbacContext = {
        user: { id: '2', email: 'admin@test.com', role: 'admin', isActive: true },
      }
      expect(await middleware(editorContext, mockNext)).toBeUndefined()
      expect(await middleware(adminContext, mockNext)).toBeUndefined()
    })

    it('should deny access when user has neither role', async () => {
      const middleware = createRbacMiddleware({ roles: ['admin', 'editor'] })
      const context: RbacContext = {
        user: { id: '1', email: 'viewer@test.com', role: 'viewer', isActive: true },
      }
      const result = await middleware(context, mockNext)
      expect(result).toBeDefined()
      expect(result?.status).toBe(403)
    })
  })

  describe('authentication required', () => {
    it('should return 401 when no user in context', async () => {
      const middleware = createRbacMiddleware({ roles: ['admin'] })
      const context: RbacContext = {}
      const result = await middleware(context, mockNext)
      expect(result).toBeDefined()
      expect(result?.status).toBe(401)
      expect(result?.error).toBe('Authentication required')
    })

    it('should return 401 when user has no role', async () => {
      const middleware = createRbacMiddleware({ roles: ['admin'] })
      const context: RbacContext = {
        user: { id: '1', email: 'test@test.com', isActive: true },
      }
      const result = await middleware(context, mockNext)
      expect(result).toBeDefined()
      expect(result?.status).toBe(401)
      expect(result?.error).toBe('User role not configured')
    })
  })

  describe('no role requirement', () => {
    it('should allow access when no roles required', async () => {
      const middleware = createRbacMiddleware({})
      const context: RbacContext = {
        user: { id: '1', email: 'viewer@test.com', role: 'viewer', isActive: true },
      }
      const result = await middleware(context, mockNext)
      expect(result).toBeUndefined()
    })

    it('should allow access when roles array is empty', async () => {
      const middleware = createRbacMiddleware({ roles: [] })
      const context: RbacContext = {
        user: { id: '1', email: 'viewer@test.com', role: 'viewer', isActive: true },
      }
      const result = await middleware(context, mockNext)
      expect(result).toBeUndefined()
    })
  })

  describe('legacy role mapping (migration)', () => {
    it('should map legacy admin role to RbacRole admin', async () => {
      const middleware = createRbacMiddleware({ roles: ['admin'] })
      // Legacy role 'admin' from UserStore should still work
      const context: RbacContext = {
        user: { id: '1', email: 'legacy-admin@test.com', role: 'admin', isActive: true },
      }
      const result = await middleware(context, mockNext)
      expect(result).toBeUndefined()
    })

    it('should deny legacy guest role from admin routes', async () => {
      const middleware = createRbacMiddleware({ roles: ['admin'] })
      const context: RbacContext = {
        user: { id: '1', email: 'guest@test.com', role: 'guest', isActive: true },
      }
      const result = await middleware(context, mockNext)
      // guest is not in the RbacRole hierarchy, so it should fail role check
      expect(result).toBeDefined()
      expect(result?.status).toBe(403)
    })
  })

  describe('error response format', () => {
    it('should return proper error response', async () => {
      const middleware = createRbacMiddleware({ roles: ['admin'] })
      const context: RbacContext = {}
      const result = await middleware(context, mockNext)
      expect(result).toBeDefined()
      expect(result?.status).toBe(401)
      expect(result?.error).toBe('Authentication required')
    })

    it('should include descriptive error message with required roles', async () => {
      const middleware = createRbacMiddleware({ roles: ['admin', 'editor'] })
      const context: RbacContext = {
        user: { id: '1', email: 'viewer@test.com', role: 'viewer', isActive: true },
      }
      const result = await middleware(context, mockNext)
      expect(result).toBeDefined()
      expect(result?.error).toContain('admin')
      expect(result?.error).toContain('editor')
    })
  })
})
