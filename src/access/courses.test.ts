import { describe, it, expect } from 'vitest'
import { coursesAccess, canReadCourseField, canWriteCourseField, canEnrollInCourse } from './courses'
import type { AccessContext } from './index'

describe('Courses Access Control', () => {
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
    it('should allow editor to create courses', () => {
      expect(coursesAccess.canCreate(editorCtx)).toBe(true)
    })

    it('should allow admin to create courses', () => {
      expect(coursesAccess.canCreate(adminCtx)).toBe(true)
    })

    it('should deny viewer from creating courses', () => {
      expect(coursesAccess.canCreate(viewerCtx)).toBe(false)
    })

    it('should deny guest from creating courses', () => {
      expect(coursesAccess.canCreate(guestCtx)).toBe(false)
    })
  })

  describe('canRead', () => {
    const publishedCourse = { id: 'course-1', status: 'published', instructor: { id: 'editor-1' } }
    const draftCourse = { id: 'course-2', status: 'draft', instructor: { id: 'editor-1' } }

    it('should allow anyone to read published courses', () => {
      expect(coursesAccess.canRead(guestCtx, publishedCourse)).toBe(true)
      expect(coursesAccess.canRead(viewerCtx, publishedCourse)).toBe(true)
    })

    it('should allow admin to read any course', () => {
      expect(coursesAccess.canRead(adminCtx, draftCourse)).toBe(true)
    })

    it('should allow editor to read their own courses', () => {
      expect(coursesAccess.canRead(editorCtx, draftCourse)).toBe(true)
    })

    it('should deny viewer from reading draft courses', () => {
      expect(coursesAccess.canRead(viewerCtx, draftCourse)).toBe(false)
    })
  })

  describe('canUpdate', () => {
    const ownCourse = { id: 'course-1', instructor: { id: 'editor-1' } }
    const otherCourse = { id: 'course-2', instructor: { id: 'other-editor' } }

    it('should allow admin to update any course', () => {
      expect(coursesAccess.canUpdate(adminCtx, ownCourse)).toBe(true)
      expect(coursesAccess.canUpdate(adminCtx, otherCourse)).toBe(true)
    })

    it('should allow editor to update their own courses', () => {
      expect(coursesAccess.canUpdate(editorCtx, ownCourse)).toBe(true)
    })

    it('should deny editor from updating others courses', () => {
      expect(coursesAccess.canUpdate(editorCtx, otherCourse)).toBe(false)
    })

    it('should deny viewer from updating courses', () => {
      expect(coursesAccess.canUpdate(viewerCtx, ownCourse)).toBe(false)
    })
  })

  describe('canDelete', () => {
    it('should allow admin to delete courses', () => {
      expect(coursesAccess.canDelete(adminCtx, { id: 'course-1' })).toBe(true)
    })

    it('should deny editor from deleting courses', () => {
      expect(coursesAccess.canDelete(editorCtx, { id: 'course-1' })).toBe(false)
    })

    it('should deny viewer from deleting courses', () => {
      expect(coursesAccess.canDelete(viewerCtx, { id: 'course-1' })).toBe(false)
    })
  })

  describe('canPublish', () => {
    const ownCourse = { instructor: { id: 'editor-1' } }
    const otherCourse = { instructor: { id: 'other-editor' } }

    it('should allow admin to publish any course', () => {
      expect(coursesAccess.canPublish(adminCtx, ownCourse)).toBe(true)
      expect(coursesAccess.canPublish(adminCtx, otherCourse)).toBe(true)
    })

    it('should deny editor from publishing courses', () => {
      expect(coursesAccess.canPublish(editorCtx, ownCourse)).toBe(false)
    })
  })

  describe('canArchive', () => {
    const ownCourse = { instructor: { id: 'editor-1' } }

    it('should allow admin to archive any course', () => {
      expect(coursesAccess.canArchive(adminCtx, ownCourse)).toBe(true)
    })

    it('should deny editor from archiving courses', () => {
      expect(coursesAccess.canArchive(editorCtx, ownCourse)).toBe(false)
    })
  })

  describe('canReadCourseField', () => {
    it('should allow admin to read any field', () => {
      expect(canReadCourseField(adminCtx, 'secretField')).toBe(true)
    })

    it('should allow authenticated users to read public fields', () => {
      expect(canReadCourseField(viewerCtx, 'title')).toBe(true)
      expect(canReadCourseField(editorCtx, 'description')).toBe(true)
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

    it('should allow editor to write specific fields for their course', () => {
      expect(canWriteCourseField(editorCtx, 'title', 'editor-1')).toBe(true)
      expect(canWriteCourseField(editorCtx, 'description', 'editor-1')).toBe(true)
    })

    it('should deny editor from writing fields of others courses', () => {
      expect(canWriteCourseField(editorCtx, 'title', 'other-editor')).toBe(false)
    })
  })

  describe('canEnrollInCourse', () => {
    const publishedCourse = { status: 'published', maxEnrollments: 10 }
    const draftCourse = { status: 'draft' }

    it('should allow viewer to enroll in published course', () => {
      expect(canEnrollInCourse(viewerCtx, publishedCourse, 5)).toBe(true)
    })

    it('should allow admin to enroll in published course', () => {
      expect(canEnrollInCourse(adminCtx, publishedCourse, 5)).toBe(true)
    })

    it('should deny viewer from enrolling in draft course', () => {
      expect(canEnrollInCourse(viewerCtx, draftCourse)).toBe(false)
    })

    it('should allow editor to enroll in published course', () => {
      expect(canEnrollInCourse(editorCtx, publishedCourse)).toBe(true)
    })

    it('should deny guest from enrolling', () => {
      expect(canEnrollInCourse(guestCtx, publishedCourse)).toBe(false)
    })

    it('should deny when max enrollments reached', () => {
      expect(canEnrollInCourse(viewerCtx, publishedCourse, 10)).toBe(false)
    })
  })
})
