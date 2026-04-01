import { describe, it, expect } from 'vitest'
import { usersAccess, canReadUserField, canWriteUserField } from './users'
import type { AccessContext } from './index'

describe('Users Access Control', () => {
  const adminCtx: AccessContext = {
    user: { id: 'admin-1', email: 'admin@test.com', role: 'admin' } as never,
  }

  const editorCtx: AccessContext = {
    user: { id: 'editor-1', email: 'editor@test.com', role: 'editor' } as never,
  }

  const viewerCtx: AccessContext = {
    user: { id: 'viewer-1', email: 'viewer@test.com', role: 'viewer' } as never,
  }

  const guestCtx: AccessContext = {
    user: undefined,
  }

  describe('canCreate', () => {
    it('should allow admin to create users', () => {
      expect(usersAccess.canCreate(adminCtx)).toBe(true)
    })

    it('should deny editor from creating users', () => {
      expect(usersAccess.canCreate(editorCtx)).toBe(false)
    })

    it('should deny viewer from creating users', () => {
      expect(usersAccess.canCreate(viewerCtx)).toBe(false)
    })

    it('should deny guest from creating users', () => {
      expect(usersAccess.canCreate(guestCtx)).toBe(false)
    })
  })

  describe('canRead', () => {
    it('should allow user to read their own profile', () => {
      expect(usersAccess.canRead(viewerCtx, 'viewer-1')).toBe(true)
    })

    it('should allow admin to read any user', () => {
      expect(usersAccess.canRead(adminCtx, 'viewer-1')).toBe(true)
      expect(usersAccess.canRead(adminCtx, 'editor-1')).toBe(true)
    })

    it('should allow editor to read user profiles', () => {
      expect(usersAccess.canRead(editorCtx, 'viewer-1')).toBe(true)
    })

    it('should deny viewer from reading other user profiles', () => {
      expect(usersAccess.canRead(viewerCtx, 'editor-1')).toBe(false)
    })

    it('should deny guest from reading user profiles', () => {
      expect(usersAccess.canRead(guestCtx, 'viewer-1')).toBe(false)
    })
  })

  describe('canUpdate', () => {
    it('should allow user to update their own profile', () => {
      expect(usersAccess.canUpdate(viewerCtx, 'viewer-1')).toBe(true)
    })

    it('should allow admin to update any user', () => {
      expect(usersAccess.canUpdate(adminCtx, 'viewer-1')).toBe(true)
    })

    it('should deny viewer from updating other users', () => {
      expect(usersAccess.canUpdate(viewerCtx, 'editor-1')).toBe(false)
    })

    it('should deny editor from updating users', () => {
      expect(usersAccess.canUpdate(editorCtx, 'viewer-1')).toBe(false)
    })
  })

  describe('canDelete', () => {
    it('should allow admin to delete users', () => {
      expect(usersAccess.canDelete(adminCtx, 'viewer-1')).toBe(true)
    })

    it('should deny user from deleting themselves', () => {
      expect(usersAccess.canDelete(viewerCtx, 'viewer-1')).toBe(false)
    })

    it('should deny editor from deleting users', () => {
      expect(usersAccess.canDelete(editorCtx, 'viewer-1')).toBe(false)
    })
  })

  describe('canReadRole', () => {
    it('should allow user to read their own role', () => {
      expect(usersAccess.canReadRole(viewerCtx, 'viewer-1')).toBe(true)
    })

    it('should allow admin to read any role', () => {
      expect(usersAccess.canReadRole(adminCtx, 'viewer-1')).toBe(true)
    })

    it('should deny viewer from reading other user roles', () => {
      expect(usersAccess.canReadRole(viewerCtx, 'editor-1')).toBe(false)
    })
  })

  describe('canUpdateRole', () => {
    it('should allow admin to update roles', () => {
      expect(usersAccess.canUpdateRole(adminCtx, 'viewer-1')).toBe(true)
    })

    it('should deny user from updating their own role', () => {
      expect(usersAccess.canUpdateRole(viewerCtx, 'viewer-1')).toBe(false)
    })

    it('should deny editor from updating roles', () => {
      expect(usersAccess.canUpdateRole(editorCtx, 'viewer-1')).toBe(false)
    })
  })

  describe('canList', () => {
    it('should allow authenticated users to list', () => {
      expect(usersAccess.canList(viewerCtx)).toBe(true)
      expect(usersAccess.canList(editorCtx)).toBe(true)
      expect(usersAccess.canList(adminCtx)).toBe(true)
    })

    it('should deny guest from listing users', () => {
      expect(usersAccess.canList(guestCtx)).toBe(false)
    })
  })

  describe('canReadUserField', () => {
    it('should allow admin to read any field', () => {
      expect(canReadUserField(adminCtx, 'password')).toBe(true)
      expect(canReadUserField(adminCtx, 'salt')).toBe(true)
    })

    it('should allow user to read their own fields', () => {
      expect(canReadUserField(viewerCtx, 'email', 'viewer-1')).toBe(true)
    })

    it('should allow editor to read user email', () => {
      expect(canReadUserField(editorCtx, 'email', 'viewer-1')).toBe(true)
    })

    it('should deny access to protected fields', () => {
      expect(canReadUserField(viewerCtx, 'password', 'other')).toBe(false)
    })
  })

  describe('canWriteUserField', () => {
    it('should allow admin to write any field', () => {
      expect(canWriteUserField(adminCtx, 'password')).toBe(true)
      expect(canWriteUserField(adminCtx, 'role')).toBe(true)
    })

    it('should allow user to write their own non-protected fields', () => {
      expect(canWriteUserField(viewerCtx, 'email', 'viewer-1')).toBe(true)
    })

    it('should not allow user to write protected fields', () => {
      expect(canWriteUserField(viewerCtx, 'role', 'viewer-1')).toBe(false)
      expect(canWriteUserField(viewerCtx, 'isActive', 'viewer-1')).toBe(false)
    })
  })
})
