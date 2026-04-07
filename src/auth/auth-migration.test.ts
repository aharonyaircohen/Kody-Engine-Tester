import { describe, it, expect, beforeEach } from 'vitest'
import { UserStore } from './user-store'
import { JwtService } from './jwt-service'
import { checkRole, canAccessRole, hasPermission } from './rbac'
import { login } from '../api/auth/login'

describe('Auth Migration Tests', () => {
  let store: UserStore
  let jwtService: JwtService

  beforeEach(async () => {
    store = new UserStore()
    await store.ready
    jwtService = new JwtService('test-secret')
  })

  describe('UserStore with RbacRole', () => {
    it('should have admin user with admin role', async () => {
      const admin = await store.findByEmail('admin@example.com')
      expect(admin).toBeDefined()
      expect(admin?.role).toBe('admin')
      expect(admin?.roles).toContain('admin')
    })

    it('should have instructor user migrated to editor role', async () => {
      const instructor = await store.findByEmail('instructor@example.com')
      expect(instructor).toBeDefined()
      expect(instructor?.role).toBe('editor')
      expect(instructor?.roles).toContain('editor')
    })

    it('should have student user migrated to viewer role', async () => {
      const student = await store.findByEmail('student@example.com')
      expect(student).toBeDefined()
      expect(student?.role).toBe('viewer')
      expect(student?.roles).toContain('viewer')
    })

    it('should have user@example.com migrated to viewer role', async () => {
      const user = await store.findByEmail('user@example.com')
      expect(user).toBeDefined()
      expect(user?.role).toBe('viewer')
      expect(user?.roles).toContain('viewer')
    })

    it('should create user with RbacRole', async () => {
      const user = await store.create({
        email: 'newadmin@example.com',
        password: 'Password1!',
        role: 'admin',
        roles: ['admin'],
      })
      expect(user.role).toBe('admin')
      expect(user.roles).toEqual(['admin'])
    })

    it('should verify password with PBKDF2', async () => {
      const user = await store.findByEmail('admin@example.com')
      const valid = await store.verifyPassword('AdminPass1!', user!.passwordHash, user!.salt)
      expect(valid).toBe(true)
    })

    it('should reject incorrect password with PBKDF2', async () => {
      const user = await store.findByEmail('admin@example.com')
      const valid = await store.verifyPassword('WrongPassword!', user!.passwordHash, user!.salt)
      expect(valid).toBe(false)
    })
  })

  describe('RBAC permission checks', () => {
    it('should allow admin to access editor resources', () => {
      const admin = { id: '1', email: 'admin@example.com', role: 'admin' as const, isActive: true }
      const result = checkRole(admin, ['editor'])
      expect(result.error).toBeUndefined()
      expect(result.user?.role).toBe('admin')
    })

    it('should allow admin to access viewer resources', () => {
      const admin = { id: '1', email: 'admin@example.com', role: 'admin' as const, isActive: true }
      const result = checkRole(admin, ['viewer'])
      expect(result.error).toBeUndefined()
    })

    it('should allow editor to access viewer resources', () => {
      const editor = { id: '1', email: 'editor@example.com', role: 'editor' as const, isActive: true }
      const result = checkRole(editor, ['viewer'])
      expect(result.error).toBeUndefined()
    })

    it('should deny viewer from accessing editor resources', () => {
      const viewer = { id: '1', email: 'viewer@example.com', role: 'viewer' as const, isActive: true }
      const result = checkRole(viewer, ['editor'])
      expect(result.error).toBeDefined()
      expect(result.status).toBe(403)
    })

    it('should deny viewer from accessing admin resources', () => {
      const viewer = { id: '1', email: 'viewer@example.com', role: 'viewer' as const, isActive: true }
      const result = checkRole(viewer, ['admin'])
      expect(result.error).toBeDefined()
      expect(result.status).toBe(403)
    })

    it('should deny unauthenticated user', () => {
      const result = checkRole(undefined, ['admin'])
      expect(result.error).toBe('Authentication required')
      expect(result.status).toBe(401)
    })

    it('should allow access when no roles required', () => {
      const viewer = { id: '1', email: 'viewer@example.com', role: 'viewer' as const, isActive: true }
      const result = checkRole(viewer, undefined)
      expect(result.error).toBeUndefined()
    })
  })

  describe('canAccessRole helper', () => {
    it('admin can access admin, editor, viewer', () => {
      expect(canAccessRole('admin', 'admin')).toBe(true)
      expect(canAccessRole('admin', 'editor')).toBe(true)
      expect(canAccessRole('admin', 'viewer')).toBe(true)
    })

    it('editor can access editor, viewer but not admin', () => {
      expect(canAccessRole('editor', 'admin')).toBe(false)
      expect(canAccessRole('editor', 'editor')).toBe(true)
      expect(canAccessRole('editor', 'viewer')).toBe(true)
    })

    it('viewer can only access viewer', () => {
      expect(canAccessRole('viewer', 'admin')).toBe(false)
      expect(canAccessRole('viewer', 'editor')).toBe(false)
      expect(canAccessRole('viewer', 'viewer')).toBe(true)
    })
  })

  describe('hasPermission helper', () => {
    it('should return true for user with sufficient role', () => {
      const admin = { id: '1', email: 'admin@example.com', role: 'admin' as const, isActive: true }
      expect(hasPermission(admin, 'viewer')).toBe(true)
    })

    it('should return false for user with insufficient role', () => {
      const viewer = { id: '1', email: 'viewer@example.com', role: 'viewer' as const, isActive: true }
      expect(hasPermission(viewer, 'admin')).toBe(false)
    })

    it('should return false for undefined user', () => {
      expect(hasPermission(undefined, 'viewer')).toBe(false)
    })
  })

  describe('JWT login without SessionStore', () => {
    it('should login and return self-contained JWT tokens', async () => {
      const result = await login(
        'admin@example.com',
        'AdminPass1!',
        '127.0.0.1',
        'test-user-agent',
        store,
        jwtService
      )

      expect(result.accessToken).toBeDefined()
      expect(result.refreshToken).toBeDefined()
      expect(result.user.id).toBeDefined()
      expect(result.user.email).toBe('admin@example.com')
      expect(result.user.role).toBe('admin')
    })

    it('should fail with invalid credentials', async () => {
      await expect(
        login(
          'admin@example.com',
          'WrongPassword!',
          '127.0.0.1',
          'test-user-agent',
          store,
          jwtService
        )
      ).rejects.toThrow('Invalid credentials')
    })

    it('should fail for inactive user', async () => {
      await expect(
        login(
          'inactive@example.com',
          'InactivePass1!',
          '127.0.0.1',
          'test-user-agent',
          store,
          jwtService
        )
      ).rejects.toThrow('Account is inactive')
    })

    it('should verify JWT token after login', async () => {
      const loginResult = await login(
        'admin@example.com',
        'AdminPass1!',
        '127.0.0.1',
        'test-user-agent',
        store,
        jwtService
      )

      const payload = await jwtService.verify(loginResult.accessToken)
      expect(payload.email).toBe('admin@example.com')
      expect(payload.role).toBe('admin')
      expect(payload.generation).toBe(0)
    })
  })
})
