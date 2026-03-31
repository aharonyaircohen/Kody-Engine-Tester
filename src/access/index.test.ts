import { describe, it, expect } from 'vitest'
import {
  isAdmin,
  isInstructor,
  isStudent,
  isAuthenticated,
  hasRole,
  requireAuth,
  requireRole,
  requireAdmin,
  requireInstructor,
  requireStudent,
  canReadField,
  canWriteField,
} from './index'
import type { AccessContext } from './index'

describe('Access Control', () => {
  const adminCtx: AccessContext = {
    user: { id: 'admin-1', email: 'admin@test.com', role: 'admin' } as never,
    session: { id: 'session-1' } as never,
  }

  const instructorCtx: AccessContext = {
    user: { id: 'instructor-1', email: 'instructor@test.com', role: 'instructor' } as never,
    session: { id: 'session-2' } as never,
  }

  const studentCtx: AccessContext = {
    user: { id: 'student-1', email: 'student@test.com', role: 'student' } as never,
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
      expect(isAdmin(instructorCtx)).toBe(false)
      expect(isAdmin(studentCtx)).toBe(false)
      expect(isAdmin(guestCtx)).toBe(false)
    })
  })

  describe('isInstructor', () => {
    it('should return true for instructor role', () => {
      expect(isInstructor(instructorCtx)).toBe(true)
    })

    it('should return true for admin (admins have instructor privileges)', () => {
      expect(isInstructor(adminCtx)).toBe(true)
    })

    it('should return false for non-instructor roles', () => {
      expect(isInstructor(studentCtx)).toBe(false)
      expect(isInstructor(guestCtx)).toBe(false)
    })
  })

  describe('isStudent', () => {
    it('should return true for student role', () => {
      expect(isStudent(studentCtx)).toBe(true)
    })

    it('should return true for admin (admins have student privileges)', () => {
      expect(isStudent(adminCtx)).toBe(true)
    })

    it('should return false for non-student roles', () => {
      expect(isStudent(instructorCtx)).toBe(false)
      expect(isStudent(guestCtx)).toBe(false)
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
      expect(hasRole(instructorCtx, 'instructor', 'admin')).toBe(true)
      expect(hasRole(studentCtx, 'student', 'admin')).toBe(true)
    })

    it('should return false when user does not have any of the roles', () => {
      expect(hasRole(studentCtx, 'instructor', 'admin')).toBe(false)
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
      expect(requireRole(instructorCtx, 'instructor')).toBeNull()
    })

    it('should return null when user has one of multiple allowed roles', () => {
      expect(requireRole(studentCtx, 'instructor', 'student')).toBeNull()
    })

    it('should return error when user lacks required role', () => {
      const result = requireRole(studentCtx, 'instructor')
      expect(result).toEqual({
        error: 'Forbidden: requires one of roles [instructor]',
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
      const result = requireAdmin(studentCtx)
      expect(result?.status).toBe(403)
    })
  })

  describe('requireInstructor', () => {
    it('should return null for instructor', () => {
      expect(requireInstructor(instructorCtx)).toBeNull()
    })

    it('should return null for admin', () => {
      expect(requireInstructor(adminCtx)).toBeNull()
    })

    it('should return error for non-instructor', () => {
      const result = requireInstructor(studentCtx)
      expect(result?.status).toBe(403)
    })
  })

  describe('requireStudent', () => {
    it('should return null for student', () => {
      expect(requireStudent(studentCtx)).toBeNull()
    })

    it('should return null for admin', () => {
      expect(requireStudent(adminCtx)).toBeNull()
    })

    it('should return error for non-student', () => {
      const result = requireStudent(instructorCtx)
      expect(result?.status).toBe(403)
    })
  })

  describe('canReadField', () => {
    it('should allow admin to read any field', () => {
      expect(canReadField(adminCtx, 'password')).toBe(true)
      expect(canReadField(adminCtx, 'secret')).toBe(true)
    })

    it('should allow user to read their own fields', () => {
      expect(canReadField(studentCtx, 'email', 'student-1')).toBe(true)
    })

    it('should allow instructor to read course fields', () => {
      expect(canReadField(instructorCtx, 'title')).toBe(true)
    })

    it('should deny access to fields without proper permissions', () => {
      expect(canReadField(studentCtx, 'password', 'other-user')).toBe(false)
    })
  })

  describe('canWriteField', () => {
    it('should allow admin to write any field', () => {
      expect(canWriteField(adminCtx, 'password')).toBe(true)
      expect(canWriteField(adminCtx, 'role')).toBe(true)
    })

    it('should allow user to write their own non-protected fields', () => {
      expect(canWriteField(studentCtx, 'email', 'student-1')).toBe(true)
    })

    it('should not allow user to write protected fields', () => {
      expect(canWriteField(studentCtx, 'role', 'student-1')).toBe(false)
      expect(canWriteField(studentCtx, 'isActive', 'student-1')).toBe(false)
    })

    it('should allow instructor to write course fields they own', () => {
      expect(canWriteField(instructorCtx, 'title', 'instructor-1')).toBe(true)
    })
  })
})
