import { describe, it, expect } from 'vitest'
import {
  isAdmin,
  isEditor,
  isViewer,
  isAuthenticated,
  hasRole,
  requireAuth,
  requireRole,
  requireAdmin,
  canReadField,
  canWriteField,
} from './index'
import type { AccessContext } from './index'

describe('Access Control', () => {
  const adminCtx: AccessContext = {
    user: { id: 'admin-1', email: 'admin@test.com', role: 'admin' } as never,
    session: { id: 'session-1' } as never,
  }

  const editorCtx: AccessContext = {
    user: { id: 'editor-1', email: 'editor@test.com', role: 'editor' } as never,
    session: { id: 'session-2' } as never,
  }

  const viewerCtx: AccessContext = {
    user: { id: 'viewer-1', email: 'viewer@test.com', role: 'viewer' } as never,
    session: { id: 'session-3' } as never,
  }

  const guestCtx: AccessContext = {
    user: undefined,
    session: undefined,
  }

  describe('isAdmin', () => {
    it('should return true for admin role', () => {
      expect(isAdmin(adminCtx)).toBe(true)
    })

    it('should return false for non-admin roles', () => {
      expect(isAdmin(editorCtx)).toBe(false)
      expect(isAdmin(viewerCtx)).toBe(false)
      expect(isAdmin(guestCtx)).toBe(false)
    })
  })

  describe('isEditor', () => {
    it('should return true for editor role', () => {
      expect(isEditor(editorCtx)).toBe(true)
    })

    it('should return true for admin (admins have editor privileges)', () => {
      expect(isEditor(adminCtx)).toBe(true)
    })

    it('should return false for non-editor roles', () => {
      expect(isEditor(viewerCtx)).toBe(false)
      expect(isEditor(guestCtx)).toBe(false)
    })
  })

  describe('isViewer', () => {
    it('should return true for viewer role', () => {
      expect(isViewer(viewerCtx)).toBe(true)
    })

    it('should return true for admin (admins have viewer privileges)', () => {
      expect(isViewer(adminCtx)).toBe(true)
    })

    it('should return true for editor (editors have viewer privileges)', () => {
      expect(isViewer(editorCtx)).toBe(true)
    })

    it('should return false for guest', () => {
      expect(isViewer(guestCtx)).toBe(false)
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when user and session exist', () => {
      const ctx: AccessContext = {
        user: { id: '1' } as never,
        session: { id: '1' } as never,
      }
      expect(isAuthenticated(ctx)).toBe(true)
    })

    it('should return false when no user', () => {
      expect(isAuthenticated(guestCtx)).toBe(false)
    })

    it('should return false when no session', () => {
      const ctx: AccessContext = {
        user: { id: '1' } as never,
        session: undefined,
      }
      expect(isAuthenticated(ctx)).toBe(false)
    })
  })

  describe('hasRole', () => {
    it('should return true when user has one of the specified roles', () => {
      expect(hasRole(editorCtx, 'editor', 'admin')).toBe(true)
      expect(hasRole(viewerCtx, 'viewer', 'admin')).toBe(true)
    })

    it('should return false when user does not have any of the roles', () => {
      expect(hasRole(viewerCtx, 'editor', 'admin')).toBe(false)
    })

    it('should return false when no user', () => {
      expect(hasRole(guestCtx, 'admin')).toBe(false)
    })
  })

  describe('requireAuth', () => {
    it('should return null for authenticated context', () => {
      const ctx: AccessContext = {
        user: { id: '1' } as never,
        session: { id: '1' } as never,
      }
      expect(requireAuth(ctx)).toBeNull()
    })

    it('should return error when no user', () => {
      const result = requireAuth(guestCtx)
      expect(result).toEqual({ error: 'Authentication required', status: 401 })
    })

    it('should return error when no session', () => {
      const ctx: AccessContext = { user: { id: '1' } as never }
      const result = requireAuth(ctx)
      expect(result).toEqual({ error: 'Valid session required', status: 401 })
    })
  })

  describe('requireRole', () => {
    it('should return null when user has required role', () => {
      expect(requireRole(editorCtx, 'editor')).toBeNull()
    })

    it('should return null when user has one of multiple allowed roles', () => {
      expect(requireRole(viewerCtx, 'editor', 'viewer')).toBeNull()
    })

    it('should return error when user lacks required role', () => {
      const result = requireRole(viewerCtx, 'editor')
      expect(result).toEqual({
        error: 'Forbidden: requires one of roles [editor]',
        status: 403,
      })
    })

    it('should return auth error when not authenticated', () => {
      const result = requireRole(guestCtx, 'admin')
      expect(result?.status).toBe(401)
    })
  })

  describe('requireAdmin', () => {
    it('should return null for admin', () => {
      expect(requireAdmin(adminCtx)).toBeNull()
    })

    it('should return error for non-admin', () => {
      const result = requireAdmin(viewerCtx)
      expect(result?.status).toBe(403)
    })
  })

  describe('canReadField', () => {
    it('should allow admin to read any field', () => {
      expect(canReadField(adminCtx, 'password')).toBe(true)
      expect(canReadField(adminCtx, 'secret')).toBe(true)
    })

    it('should allow user to read their own fields', () => {
      expect(canReadField(viewerCtx, 'email', 'viewer-1')).toBe(true)
    })

    it('should allow editor to read course fields', () => {
      expect(canReadField(editorCtx, 'title')).toBe(true)
    })

    it('should deny access to fields without proper permissions', () => {
      expect(canReadField(viewerCtx, 'password', 'other-user')).toBe(false)
    })
  })

  describe('canWriteField', () => {
    it('should allow admin to write any field', () => {
      expect(canWriteField(adminCtx, 'password')).toBe(true)
      expect(canWriteField(adminCtx, 'role')).toBe(true)
    })

    it('should allow user to write their own non-protected fields', () => {
      expect(canWriteField(viewerCtx, 'email', 'viewer-1')).toBe(true)
    })

    it('should not allow user to write protected fields', () => {
      expect(canWriteField(viewerCtx, 'role', 'viewer-1')).toBe(false)
      expect(canWriteField(viewerCtx, 'isActive', 'viewer-1')).toBe(false)
    })

    it('should allow editor to write course fields they own', () => {
      expect(canWriteField(editorCtx, 'title', 'editor-1')).toBe(true)
    })
  })
})
