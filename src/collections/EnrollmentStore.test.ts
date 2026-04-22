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

  describe('setCapacity', () => {
    it('should set a positive capacity for a course', () => {
      store.setCapacity('course-1', 30)
      expect(store.getCapacity('course-1')).toBe(30)
    })

    it('should allow setting capacity to zero', () => {
      store.setCapacity('course-1', 0)
      expect(store.getCapacity('course-1')).toBe(0)
    })

    it('should allow setting capacity to null (unlimited)', () => {
      store.setCapacity('course-1', null)
      expect(store.getCapacity('course-1')).toBe(null)
    })

    it('should overwrite an existing capacity', () => {
      store.setCapacity('course-1', 10)
      store.setCapacity('course-1', 25)
      expect(store.getCapacity('course-1')).toBe(25)
    })

    it('should throw if capacity is negative', () => {
      expect(() => store.setCapacity('course-1', -1)).toThrow('Capacity cannot be negative')
    })
  })

  describe('getCapacity', () => {
    it('should return null for a course with no capacity set (backward compat)', () => {
      expect(store.getCapacity('course-1')).toBe(null)
    })

    it('should return the set capacity', () => {
      store.setCapacity('course-1', 50)
      expect(store.getCapacity('course-1')).toBe(50)
    })
  })

  describe('getEnrolledCount', () => {
    it('should return 0 for a course with no enrollments', () => {
      expect(store.getEnrolledCount('course-1')).toBe(0)
    })

    it('should return the correct count after enrollments', () => {
      store.enroll('user-1', 'course-1')
      store.enroll('user-2', 'course-1')
      store.enroll('user-3', 'course-1')
      expect(store.getEnrolledCount('course-1')).toBe(3)
    })

    it('should not count enrollments for other courses', () => {
      store.enroll('user-1', 'course-1')
      store.enroll('user-2', 'course-2')
      expect(store.getEnrolledCount('course-1')).toBe(1)
      expect(store.getEnrolledCount('course-2')).toBe(1)
    })

    it('should reflect unenrollments', () => {
      store.enroll('user-1', 'course-1')
      store.enroll('user-2', 'course-1')
      store.unenroll('user-1', 'course-1')
      expect(store.getEnrolledCount('course-1')).toBe(1)
    })

    it('should return correct count when capacity is null', () => {
      store.setCapacity('course-1', null)
      store.enroll('user-1', 'course-1')
      expect(store.getEnrolledCount('course-1')).toBe(1)
    })
  })
})
