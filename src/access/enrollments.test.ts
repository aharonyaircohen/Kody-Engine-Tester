import { describe, it, expect } from 'vitest'
import { enrollmentsAccess, canReadEnrollmentField, canWriteEnrollmentField, canAddEnrollment, isAlreadyEnrolled } from './enrollments'
import type { AccessContext } from './index'

describe('Enrollments Access Control', () => {
  const adminCtx: AccessContext = {
    user: { id: 'admin-1', email: 'admin@test.com', role: 'admin' } as never,
  }

  const instructorCtx: AccessContext = {
    user: { id: 'instructor-1', email: 'instructor@test.com', role: 'instructor' } as never,
  }

  const studentCtx: AccessContext = {
    user: { id: 'student-1', email: 'student@test.com', role: 'student' } as never,
  }

  const otherStudentCtx: AccessContext = {
    user: { id: 'other-student-1', email: 'other@test.com', role: 'student' } as never,
  }

  const guestCtx: AccessContext = {
    user: undefined,
  }

  describe('canCreate', () => {
    it('should allow student to create enrollment for themselves', () => {
      expect(enrollmentsAccess.canCreate(studentCtx, { studentId: 'student-1' })).toBe(true)
    })

    it('should allow admin to create enrollment for any student', () => {
      expect(enrollmentsAccess.canCreate(adminCtx, { studentId: 'student-1' })).toBe(true)
    })

    it('should deny student from creating enrollment for others', () => {
      expect(enrollmentsAccess.canCreate(studentCtx, { studentId: 'other-student-1' })).toBe(false)
    })

    it('should deny instructor from creating enrollments', () => {
      expect(enrollmentsAccess.canCreate(instructorCtx, { studentId: 'student-1' })).toBe(false)
    })

    it('should deny guest from creating enrollments', () => {
      expect(enrollmentsAccess.canCreate(guestCtx, { studentId: 'student-1' })).toBe(false)
    })
  })

  describe('canRead', () => {
    it('should allow student to read their own enrollment', () => {
      expect(enrollmentsAccess.canRead(studentCtx, { studentId: 'student-1' })).toBe(true)
    })

    it('should allow admin to read any enrollment', () => {
      expect(enrollmentsAccess.canRead(adminCtx, { studentId: 'student-1' })).toBe(true)
    })

    it('should allow instructor to read enrollments', () => {
      expect(enrollmentsAccess.canRead(instructorCtx, { studentId: 'student-1' })).toBe(true)
    })

    it('should deny student from reading others enrollments', () => {
      expect(enrollmentsAccess.canRead(studentCtx, { studentId: 'other-student-1' })).toBe(false)
    })
  })

  describe('canUpdate', () => {
    it('should allow student to update their own enrollment', () => {
      expect(enrollmentsAccess.canUpdate(studentCtx, { studentId: 'student-1' })).toBe(true)
    })

    it('should allow admin to update any enrollment', () => {
      expect(enrollmentsAccess.canUpdate(adminCtx, { studentId: 'student-1' })).toBe(true)
    })

    it('should allow instructor to update enrollments', () => {
      expect(enrollmentsAccess.canUpdate(instructorCtx, { studentId: 'student-1' })).toBe(true)
    })

    it('should deny student from updating others enrollments', () => {
      expect(enrollmentsAccess.canUpdate(studentCtx, { studentId: 'other-student-1' })).toBe(false)
    })
  })

  describe('canDelete', () => {
    it('should allow admin to delete enrollments', () => {
      expect(enrollmentsAccess.canDelete(adminCtx, { studentId: 'student-1' })).toBe(true)
    })

    it('should deny student from deleting their own enrollment', () => {
      expect(enrollmentsAccess.canDelete(studentCtx, { studentId: 'student-1' })).toBe(false)
    })

    it('should deny instructor from deleting enrollments', () => {
      expect(enrollmentsAccess.canDelete(instructorCtx, { studentId: 'student-1' })).toBe(false)
    })
  })

  describe('canListForCourse', () => {
    it('should allow admin to list enrollments for any course', () => {
      expect(enrollmentsAccess.canListForCourse(adminCtx)).toBe(true)
    })

    it('should allow instructor to list enrollments for their course', () => {
      expect(enrollmentsAccess.canListForCourse(instructorCtx, 'instructor-1')).toBe(true)
    })

    it('should deny instructor from listing enrollments for others course', () => {
      expect(enrollmentsAccess.canListForCourse(instructorCtx, 'other-instructor')).toBe(false)
    })

    it('should deny student from listing all course enrollments', () => {
      expect(enrollmentsAccess.canListForCourse(studentCtx)).toBe(false)
    })
  })

  describe('canListForStudent', () => {
    it('should allow student to list their own enrollments', () => {
      expect(enrollmentsAccess.canListForStudent(studentCtx, 'student-1')).toBe(true)
    })

    it('should allow admin to list any student enrollments', () => {
      expect(enrollmentsAccess.canListForStudent(adminCtx, 'student-1')).toBe(true)
    })

    it('should deny student from listing others enrollments', () => {
      expect(enrollmentsAccess.canListForStudent(studentCtx, 'other-student-1')).toBe(false)
    })
  })

  describe('canMarkComplete', () => {
    it('should allow student to mark their own enrollment complete', () => {
      expect(enrollmentsAccess.canMarkComplete(studentCtx, { studentId: 'student-1' })).toBe(true)
    })

    it('should allow admin to mark any enrollment complete', () => {
      expect(enrollmentsAccess.canMarkComplete(adminCtx, { studentId: 'student-1' })).toBe(true)
    })

    it('should deny student from marking others complete', () => {
      expect(enrollmentsAccess.canMarkComplete(studentCtx, { studentId: 'other-student-1' })).toBe(false)
    })
  })

  describe('canDrop', () => {
    it('should allow student to drop their own enrollment', () => {
      expect(enrollmentsAccess.canDrop(studentCtx, { studentId: 'student-1' })).toBe(true)
    })

    it('should allow admin to drop any enrollment', () => {
      expect(enrollmentsAccess.canDrop(adminCtx, { studentId: 'student-1' })).toBe(true)
    })

    it('should deny student from dropping others enrollment', () => {
      expect(enrollmentsAccess.canDrop(studentCtx, { studentId: 'other-student-1' })).toBe(false)
    })
  })

  describe('canReadEnrollmentField', () => {
    it('should allow admin to read any field', () => {
      expect(canReadEnrollmentField(adminCtx, 'completedLessons')).toBe(true)
    })

    it('should allow owner to read their own fields', () => {
      expect(canReadEnrollmentField(studentCtx, 'status', 'student-1')).toBe(true)
    })

    it('should allow instructor to read enrollment fields', () => {
      expect(canReadEnrollmentField(instructorCtx, 'student')).toBe(true)
      expect(canReadEnrollmentField(instructorCtx, 'completedLessons')).toBe(true)
    })
  })

  describe('canWriteEnrollmentField', () => {
    it('should allow admin to write any field', () => {
      expect(canWriteEnrollmentField(adminCtx, 'status')).toBe(true)
      expect(canWriteEnrollmentField(adminCtx, 'completedLessons')).toBe(true)
    })

    it('should allow student to update their own status', () => {
      expect(canWriteEnrollmentField(studentCtx, 'status', 'student-1')).toBe(true)
    })

    it('should allow instructor to update enrollment fields', () => {
      expect(canWriteEnrollmentField(instructorCtx, 'status')).toBe(true)
      expect(canWriteEnrollmentField(instructorCtx, 'completedLessons')).toBe(true)
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
      { studentId: 'student-1' },
      { studentId: 'student-2' },
    ]

    it('should return true if already enrolled', () => {
      expect(isAlreadyEnrolled(enrollments, 'student-1')).toBe(true)
    })

    it('should return false if not enrolled', () => {
      expect(isAlreadyEnrolled(enrollments, 'student-3')).toBe(false)
    })

    it('should return false for empty enrollments', () => {
      expect(isAlreadyEnrolled([], 'student-1')).toBe(false)
    })
  })
})
