import { describe, it, expect } from 'vitest'
import { coursesAccess, canReadCourseField, canWriteCourseField, canEnrollInCourse } from './courses'
import type { AccessContext } from './index'

describe('Courses Access Control', () => {
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
    it('should allow instructor to create courses', () => {
      expect(coursesAccess.canCreate(instructorCtx)).toBe(true)
    })

    it('should allow admin to create courses', () => {
      expect(coursesAccess.canCreate(adminCtx)).toBe(true)
    })

    it('should deny student from creating courses', () => {
      expect(coursesAccess.canCreate(studentCtx)).toBe(false)
    })

    it('should deny guest from creating courses', () => {
      expect(coursesAccess.canCreate(guestCtx)).toBe(false)
    })
  })

  describe('canRead', () => {
    const publishedCourse = { id: 'course-1', status: 'published', instructor: { id: 'instructor-1' } }
    const draftCourse = { id: 'course-2', status: 'draft', instructor: { id: 'instructor-1' } }

    it('should allow anyone to read published courses', () => {
      expect(coursesAccess.canRead(guestCtx, publishedCourse)).toBe(true)
      expect(coursesAccess.canRead(studentCtx, publishedCourse)).toBe(true)
    })

    it('should allow admin to read any course', () => {
      expect(coursesAccess.canRead(adminCtx, draftCourse)).toBe(true)
    })

    it('should allow instructor to read their own courses', () => {
      expect(coursesAccess.canRead(instructorCtx, draftCourse)).toBe(true)
    })

    it('should deny student from reading draft courses', () => {
      expect(coursesAccess.canRead(studentCtx, draftCourse)).toBe(false)
    })
  })

  describe('canUpdate', () => {
    const ownCourse = { id: 'course-1', instructor: { id: 'instructor-1' } }
    const otherCourse = { id: 'course-2', instructor: { id: 'other-instructor' } }

    it('should allow admin to update any course', () => {
      expect(coursesAccess.canUpdate(adminCtx, ownCourse)).toBe(true)
      expect(coursesAccess.canUpdate(adminCtx, otherCourse)).toBe(true)
    })

    it('should allow instructor to update their own courses', () => {
      expect(coursesAccess.canUpdate(instructorCtx, ownCourse)).toBe(true)
    })

    it('should deny instructor from updating others courses', () => {
      expect(coursesAccess.canUpdate(instructorCtx, otherCourse)).toBe(false)
    })

    it('should deny student from updating courses', () => {
      expect(coursesAccess.canUpdate(studentCtx, ownCourse)).toBe(false)
    })
  })

  describe('canDelete', () => {
    it('should allow admin to delete courses', () => {
      expect(coursesAccess.canDelete(adminCtx, { id: 'course-1' })).toBe(true)
    })

    it('should deny instructor from deleting courses', () => {
      expect(coursesAccess.canDelete(instructorCtx, { id: 'course-1' })).toBe(false)
    })

    it('should deny student from deleting courses', () => {
      expect(coursesAccess.canDelete(studentCtx, { id: 'course-1' })).toBe(false)
    })
  })

  describe('canPublish', () => {
    const ownCourse = { instructor: { id: 'instructor-1' } }
    const otherCourse = { instructor: { id: 'other-instructor' } }

    it('should allow admin to publish any course', () => {
      expect(coursesAccess.canPublish(adminCtx, ownCourse)).toBe(true)
      expect(coursesAccess.canPublish(adminCtx, otherCourse)).toBe(true)
    })

    it('should allow instructor to publish their own course', () => {
      expect(coursesAccess.canPublish(instructorCtx, ownCourse)).toBe(true)
    })

    it('should deny instructor from publishing others course', () => {
      expect(coursesAccess.canPublish(instructorCtx, otherCourse)).toBe(false)
    })
  })

  describe('canArchive', () => {
    const ownCourse = { instructor: { id: 'instructor-1' } }

    it('should allow admin to archive any course', () => {
      expect(coursesAccess.canArchive(adminCtx, ownCourse)).toBe(true)
    })

    it('should allow instructor to archive their own course', () => {
      expect(coursesAccess.canArchive(instructorCtx, ownCourse)).toBe(true)
    })
  })

  describe('canReadCourseField', () => {
    it('should allow admin to read any field', () => {
      expect(canReadCourseField(adminCtx, 'secretField')).toBe(true)
    })

    it('should allow authenticated users to read public fields', () => {
      expect(canReadCourseField(studentCtx, 'title')).toBe(true)
      expect(canReadCourseField(instructorCtx, 'description')).toBe(true)
    })

    it('should deny guest from reading fields', () => {
      expect(canReadCourseField(guestCtx, 'title')).toBe(false)
    })
  })

  describe('canWriteCourseField', () => {
    it('should allow admin to write any field', () => {
      expect(canWriteCourseField(adminCtx, 'title')).toBe(true)
      expect(canWriteCourseField(adminCtx, 'instructor')).toBe(true)
    })

    it('should allow instructor to write specific fields for their course', () => {
      expect(canWriteCourseField(instructorCtx, 'title', 'instructor-1')).toBe(true)
      expect(canWriteCourseField(instructorCtx, 'description', 'instructor-1')).toBe(true)
    })

    it('should deny instructor from writing fields of others courses', () => {
      expect(canWriteCourseField(instructorCtx, 'title', 'other-instructor')).toBe(false)
    })
  })

  describe('canEnrollInCourse', () => {
    const publishedCourse = { status: 'published', maxEnrollments: 10 }
    const draftCourse = { status: 'draft' }

    it('should allow student to enroll in published course', () => {
      expect(canEnrollInCourse(studentCtx, publishedCourse, 5)).toBe(true)
    })

    it('should allow admin to enroll in published course', () => {
      expect(canEnrollInCourse(adminCtx, publishedCourse, 5)).toBe(true)
    })

    it('should deny student from enrolling in draft course', () => {
      expect(canEnrollInCourse(studentCtx, draftCourse)).toBe(false)
    })

    it('should deny instructor from enrolling', () => {
      expect(canEnrollInCourse(instructorCtx, publishedCourse)).toBe(false)
    })

    it('should deny guest from enrolling', () => {
      expect(canEnrollInCourse(guestCtx, publishedCourse)).toBe(false)
    })

    it('should deny when max enrollments reached', () => {
      expect(canEnrollInCourse(studentCtx, publishedCourse, 10)).toBe(false)
    })
  })
})
