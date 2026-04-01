import { describe, it, expect } from 'vitest'
import { enrollmentsAccess, canReadEnrollmentField, canWriteEnrollmentField, canAddEnrollment, isAlreadyEnrolled } from './enrollments'
import type { AccessContext } from './index'

describe('Enrollments Access Control', () => {
  const adminCtx: AccessContext = {
    user: { id: 'admin-1', email: 'admin@test.com', role: 'admin' } as never,
  }

  const editorCtx: AccessContext = {
    user: { id: 'editor-1', email: 'editor@test.com', role: 'editor' } as never,
  }

  const viewerCtx: AccessContext = {
    user: { id: 'viewer-1', email: 'viewer@test.com', role: 'viewer' } as never,
  }

  const otherViewerCtx: AccessContext = {
    user: { id: 'other-viewer-1', email: 'other@test.com', role: 'viewer' } as never,
  }

  const guestCtx: AccessContext = {
    user: undefined,
  }

  describe('canCreate', () => {
    it('should allow viewer to create enrollment for themselves', () => {
      expect(enrollmentsAccess.canCreate(viewerCtx, { studentId: 'viewer-1' })).toBe(true)
    })

    it('should deny admin from creating enrollment for others', () => {
      expect(enrollmentsAccess.canCreate(adminCtx, { studentId: 'viewer-1' })).toBe(false)
    })

    it('should deny viewer from creating enrollment for others', () => {
      expect(enrollmentsAccess.canCreate(viewerCtx, { studentId: 'other-viewer-1' })).toBe(false)
    })

    it('should deny editor from creating enrollments', () => {
      expect(enrollmentsAccess.canCreate(editorCtx, { studentId: 'viewer-1' })).toBe(false)
    })

    it('should deny guest from creating enrollments', () => {
      expect(enrollmentsAccess.canCreate(guestCtx, { studentId: 'viewer-1' })).toBe(false)
    })
  })

  describe('canRead', () => {
    it('should allow viewer to read their own enrollment', () => {
      expect(enrollmentsAccess.canRead(viewerCtx, { studentId: 'viewer-1' })).toBe(true)
    })

    it('should allow admin to read any enrollment', () => {
      expect(enrollmentsAccess.canRead(adminCtx, { studentId: 'viewer-1' })).toBe(true)
    })

    it('should allow editor to read enrollments', () => {
      expect(enrollmentsAccess.canRead(editorCtx, { studentId: 'viewer-1' })).toBe(true)
    })

    it('should deny viewer from reading others enrollments', () => {
      expect(enrollmentsAccess.canRead(viewerCtx, { studentId: 'other-viewer-1' })).toBe(false)
    })
  })

  describe('canUpdate', () => {
    it('should allow viewer to update their own enrollment', () => {
      expect(enrollmentsAccess.canUpdate(viewerCtx, { studentId: 'viewer-1' })).toBe(true)
    })

    it('should allow admin to update any enrollment', () => {
      expect(enrollmentsAccess.canUpdate(adminCtx, { studentId: 'viewer-1' })).toBe(true)
    })

    it('should allow editor to update enrollments', () => {
      expect(enrollmentsAccess.canUpdate(editorCtx, { studentId: 'viewer-1' })).toBe(true)
    })

    it('should deny viewer from updating others enrollments', () => {
      expect(enrollmentsAccess.canUpdate(viewerCtx, { studentId: 'other-viewer-1' })).toBe(false)
    })
  })

  describe('canDelete', () => {
    it('should allow admin to delete enrollments', () => {
      expect(enrollmentsAccess.canDelete(adminCtx, { studentId: 'viewer-1' })).toBe(true)
    })

    it('should deny viewer from deleting their own enrollment', () => {
      expect(enrollmentsAccess.canDelete(viewerCtx, { studentId: 'viewer-1' })).toBe(false)
    })

    it('should deny editor from deleting enrollments', () => {
      expect(enrollmentsAccess.canDelete(editorCtx, { studentId: 'viewer-1' })).toBe(false)
    })
  })

  describe('canListForCourse', () => {
    it('should allow admin to list enrollments for any course', () => {
      expect(enrollmentsAccess.canListForCourse(adminCtx)).toBe(true)
    })

    it('should allow editor to list enrollments for their course', () => {
      expect(enrollmentsAccess.canListForCourse(editorCtx, 'editor-1')).toBe(true)
    })

    it('should deny editor from listing enrollments for others course', () => {
      expect(enrollmentsAccess.canListForCourse(editorCtx, 'other-editor')).toBe(false)
    })

    it('should deny viewer from listing all course enrollments', () => {
      expect(enrollmentsAccess.canListForCourse(viewerCtx)).toBe(false)
    })
  })

  describe('canListForStudent', () => {
    it('should allow viewer to list their own enrollments', () => {
      expect(enrollmentsAccess.canListForStudent(viewerCtx, 'viewer-1')).toBe(true)
    })

    it('should allow admin to list any student enrollments', () => {
      expect(enrollmentsAccess.canListForStudent(adminCtx, 'viewer-1')).toBe(true)
    })

    it('should deny viewer from listing others enrollments', () => {
      expect(enrollmentsAccess.canListForStudent(viewerCtx, 'other-viewer-1')).toBe(false)
    })
  })

  describe('canMarkComplete', () => {
    it('should allow editor to mark enrollment complete', () => {
      expect(enrollmentsAccess.canMarkComplete(editorCtx, { studentId: 'viewer-1' })).toBe(true)
    })

    it('should allow admin to mark any enrollment complete', () => {
      expect(enrollmentsAccess.canMarkComplete(adminCtx, { studentId: 'viewer-1' })).toBe(true)
    })

    it('should deny viewer from marking enrollment complete', () => {
      expect(enrollmentsAccess.canMarkComplete(viewerCtx, { studentId: 'viewer-1' })).toBe(false)
    })
  })

  describe('canDrop', () => {
    it('should allow viewer to drop their own enrollment', () => {
      expect(enrollmentsAccess.canDrop(viewerCtx, { studentId: 'viewer-1' })).toBe(true)
    })

    it('should allow admin to drop any enrollment', () => {
      expect(enrollmentsAccess.canDrop(adminCtx, { studentId: 'viewer-1' })).toBe(true)
    })

    it('should deny viewer from dropping others enrollment', () => {
      expect(enrollmentsAccess.canDrop(viewerCtx, { studentId: 'other-viewer-1' })).toBe(false)
    })
  })

  describe('canReadEnrollmentField', () => {
    it('should allow admin to read any field', () => {
      expect(canReadEnrollmentField(adminCtx, 'completedLessons')).toBe(true)
    })

    it('should allow owner to read their own fields', () => {
      expect(canReadEnrollmentField(viewerCtx, 'status', 'viewer-1')).toBe(true)
    })

    it('should allow editor to read enrollment fields', () => {
      expect(canReadEnrollmentField(editorCtx, 'student')).toBe(true)
      expect(canReadEnrollmentField(editorCtx, 'completedLessons')).toBe(true)
    })
  })

  describe('canWriteEnrollmentField', () => {
    it('should allow admin to write any field', () => {
      expect(canWriteEnrollmentField(adminCtx, 'status')).toBe(true)
      expect(canWriteEnrollmentField(adminCtx, 'completedLessons')).toBe(true)
    })

    it('should allow viewer to update their own status', () => {
      expect(canWriteEnrollmentField(viewerCtx, 'status', 'viewer-1')).toBe(true)
    })

    it('should allow editor to update enrollment fields', () => {
      expect(canWriteEnrollmentField(editorCtx, 'status')).toBe(true)
      expect(canWriteEnrollmentField(editorCtx, 'completedLessons')).toBe(true)
    })
  })

  describe('canAddEnrollment', () => {
    it('should allow when no max enrollment set', () => {
      expect(canAddEnrollment({}, 100)).toBe(true)
    })

    it('should allow when under max', () => {
      expect(canAddEnrollment({ maxEnrollments: 10 }, 5)).toBe(true)
    })

    it('should deny when at max', () => {
      expect(canAddEnrollment({ maxEnrollments: 10 }, 10)).toBe(false)
    })

    it('should deny when over max', () => {
      expect(canAddEnrollment({ maxEnrollments: 10 }, 15)).toBe(false)
    })
  })

  describe('isAlreadyEnrolled', () => {
    const enrollments = [
      { studentId: 'viewer-1' },
      { studentId: 'viewer-2' },
    ]

    it('should return true if already enrolled', () => {
      expect(isAlreadyEnrolled(enrollments, 'viewer-1')).toBe(true)
    })

    it('should return false if not enrolled', () => {
      expect(isAlreadyEnrolled(enrollments, 'viewer-3')).toBe(false)
    })

    it('should return false for empty enrollments', () => {
      expect(isAlreadyEnrolled([], 'viewer-1')).toBe(false)
    })
  })
})
