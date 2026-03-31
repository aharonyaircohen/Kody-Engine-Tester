import { describe, it, expect } from 'vitest'
import { usersAccess, canReadUserField, canWriteUserField } from './users'
import type { AccessContext } from './index'

describe('Users Access Control', () => {
  const adminCtx: AccessContext = {
    user: { id: 'admin-1', email: 'admin@test.com', role: 'admin' } as never,
  }

  const instructorCtx: AccessContext = {
    user: { id: 'instructor-1', email: 'instructor@test.com', role: 'instructor' } as never,
  }

  const studentCtx: AccessContext = {
    user: { id: 'student-1', email: 'student@test.com', role: 'student' } as never,
  }

  const guestCtx: AccessContext = {
    user: undefined,
  }

  describe('canCreate', () => {
    it('should allow admin to create users', () => {
      expect(usersAccess.canCreate(adminCtx)).toBe(true)
    })

    it('should deny instructor from creating users', () => {
      expect(usersAccess.canCreate(instructorCtx)).toBe(false)
    })

    it('should deny student from creating users', () => {
      expect(usersAccess.canCreate(studentCtx)).toBe(false)
    })

    it('should deny guest from creating users', () => {
      expect(usersAccess.canCreate(guestCtx)).toBe(false)
    })
  })

  describe('canRead', () => {
    it('should allow user to read their own profile', () => {
      expect(usersAccess.canRead(studentCtx, 'student-1')).toBe(true)
    })

    it('should allow admin to read any user', () => {
      expect(usersAccess.canRead(adminCtx, 'student-1')).toBe(true)
      expect(usersAccess.canRead(adminCtx, 'instructor-1')).toBe(true)
    })

    it('should allow instructor to read student profiles', () => {
      expect(usersAccess.canRead(instructorCtx, 'student-1')).toBe(true)
    })

    it('should deny student from reading other user profiles', () => {
      expect(usersAccess.canRead(studentCtx, 'instructor-1')).toBe(false)
    })

    it('should deny guest from reading user profiles', () => {
      expect(usersAccess.canRead(guestCtx, 'student-1')).toBe(false)
    })
  })

  describe('canUpdate', () => {
    it('should allow user to update their own profile', () => {
      expect(usersAccess.canUpdate(studentCtx, 'student-1')).toBe(true)
    })

    it('should allow admin to update any user', () => {
      expect(usersAccess.canUpdate(adminCtx, 'student-1')).toBe(true)
    })

    it('should deny student from updating other users', () => {
      expect(usersAccess.canUpdate(studentCtx, 'instructor-1')).toBe(false)
    })

    it('should deny instructor from updating users', () => {
      expect(usersAccess.canUpdate(instructorCtx, 'student-1')).toBe(false)
    })
  })

  describe('canDelete', () => {
    it('should allow admin to delete users', () => {
      expect(usersAccess.canDelete(adminCtx, 'student-1')).toBe(true)
    })

    it('should deny user from deleting themselves', () => {
      expect(usersAccess.canDelete(studentCtx, 'student-1')).toBe(false)
    })

    it('should deny instructor from deleting users', () => {
      expect(usersAccess.canDelete(instructorCtx, 'student-1')).toBe(false)
    })
  })

  describe('canReadRole', () => {
    it('should allow user to read their own role', () => {
      expect(usersAccess.canReadRole(studentCtx, 'student-1')).toBe(true)
    })

    it('should allow admin to read any role', () => {
      expect(usersAccess.canReadRole(adminCtx, 'student-1')).toBe(true)
    })

    it('should deny student from reading other user roles', () => {
      expect(usersAccess.canReadRole(studentCtx, 'instructor-1')).toBe(false)
    })
  })

  describe('canUpdateRole', () => {
    it('should allow admin to update roles', () => {
      expect(usersAccess.canUpdateRole(adminCtx, 'student-1')).toBe(true)
    })

    it('should deny user from updating their own role', () => {
      expect(usersAccess.canUpdateRole(studentCtx, 'student-1')).toBe(false)
    })

    it('should deny instructor from updating roles', () => {
      expect(usersAccess.canUpdateRole(instructorCtx, 'student-1')).toBe(false)
    })
  })

  describe('canList', () => {
    it('should allow authenticated users to list', () => {
      expect(usersAccess.canList(studentCtx)).toBe(true)
      expect(usersAccess.canList(instructorCtx)).toBe(true)
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
      expect(canReadUserField(studentCtx, 'email', 'student-1')).toBe(true)
    })

    it('should allow instructor to read student email', () => {
      expect(canReadUserField(instructorCtx, 'email', 'student-1')).toBe(true)
    })

    it('should deny access to protected fields', () => {
      expect(canReadUserField(studentCtx, 'password', 'other')).toBe(false)
    })
  })

  describe('canWriteUserField', () => {
    it('should allow admin to write any field', () => {
      expect(canWriteUserField(adminCtx, 'password')).toBe(true)
      expect(canWriteUserField(adminCtx, 'role')).toBe(true)
    })

    it('should allow user to write their own non-protected fields', () => {
      expect(canWriteUserField(studentCtx, 'email', 'student-1')).toBe(true)
    })

    it('should not allow user to write protected fields', () => {
      expect(canWriteUserField(studentCtx, 'role', 'student-1')).toBe(false)
      expect(canWriteUserField(studentCtx, 'isActive', 'student-1')).toBe(false)
    })
  })
})
