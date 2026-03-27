import { describe, it, expect, beforeEach } from 'vitest'
import { EnrollmentStore } from './EnrollmentStore'

describe('EnrollmentStore', () => {
  let store: EnrollmentStore

  beforeEach(() => {
    store = new EnrollmentStore()
  })

  describe('enroll', () => {
    it('should enroll a user in a course', () => {
      const enrollment = store.enroll('user-1', 'course-1')
      expect(enrollment.userId).toBe('user-1')
      expect(enrollment.courseId).toBe('course-1')
      expect(enrollment.enrolledAt).toBeInstanceOf(Date)
    })

    it('should allow enrolling the same user in multiple courses', () => {
      store.enroll('user-1', 'course-1')
      const e2 = store.enroll('user-1', 'course-2')
      expect(store.isEnrolled('user-1', 'course-1')).toBe(true)
      expect(store.isEnrolled('user-1', 'course-2')).toBe(true)
      expect(e2.courseId).toBe('course-2')
    })
  })

  describe('isEnrolled', () => {
    it('should return true for enrolled user', () => {
      store.enroll('user-1', 'course-1')
      expect(store.isEnrolled('user-1', 'course-1')).toBe(true)
    })

    it('should return false for unenrolled user', () => {
      expect(store.isEnrolled('user-1', 'course-1')).toBe(false)
    })

    it('should return false when enrolled in a different course', () => {
      store.enroll('user-1', 'course-1')
      expect(store.isEnrolled('user-1', 'course-2')).toBe(false)
    })
  })

  describe('unenroll', () => {
    it('should unenroll a user from a course', () => {
      store.enroll('user-1', 'course-1')
      expect(store.unenroll('user-1', 'course-1')).toBe(true)
      expect(store.isEnrolled('user-1', 'course-1')).toBe(false)
    })

    it('should return false when unenrolling a non-enrolled user', () => {
      expect(store.unenroll('user-1', 'course-1')).toBe(false)
    })
  })

  describe('getEnrollmentsForUser', () => {
    it('should return all enrollments for a user', () => {
      store.enroll('user-1', 'course-1')
      store.enroll('user-1', 'course-2')
      store.enroll('user-2', 'course-1')

      const results = store.getEnrollmentsForUser('user-1')
      expect(results).toHaveLength(2)
      expect(results.every((e) => e.userId === 'user-1')).toBe(true)
    })

    it('should return empty array for user with no enrollments', () => {
      expect(store.getEnrollmentsForUser('ghost')).toEqual([])
    })
  })

  describe('getEnrollmentsForCourse', () => {
    it('should return all enrollments for a course', () => {
      store.enroll('user-1', 'course-1')
      store.enroll('user-2', 'course-1')
      store.enroll('user-3', 'course-2')

      const results = store.getEnrollmentsForCourse('course-1')
      expect(results).toHaveLength(2)
      expect(results.every((e) => e.courseId === 'course-1')).toBe(true)
    })

    it('should return empty array for course with no enrollments', () => {
      expect(store.getEnrollmentsForCourse('nonexistent')).toEqual([])
    })
  })
})
