import { describe, it, expect } from 'vitest'
import { formatNotification } from './notification-formatter'

describe('formatNotification', () => {
  describe('enrollment', () => {
    it('should format enrollment notification with course name', () => {
      const result = formatNotification('enrollment', { courseName: 'CS101' })

      expect(result.subject).toBe('You have been enrolled')
      expect(result.body).toBe('You have been enrolled in CS101.')
    })

    it('should format enrollment notification with instructor', () => {
      const result = formatNotification('enrollment', {
        courseName: 'CS101',
        instructorName: 'Dr. Smith',
      })

      expect(result.subject).toBe('You have been enrolled')
      expect(result.body).toBe('You have been enrolled in CS101. Your instructor is Dr. Smith.')
    })
  })

  describe('grade', () => {
    it('should format grade notification with assignment and grade', () => {
      const result = formatNotification('grade', {
        assignmentName: 'Midterm Exam',
        grade: 'A',
      })

      expect(result.subject).toBe('Your assignment has been graded')
      expect(result.body).toBe('Your grade for Midterm Exam is A.')
    })

    it('should format grade notification with course name', () => {
      const result = formatNotification('grade', {
        assignmentName: 'Midterm Exam',
        grade: 'A',
        courseName: 'Introduction to Computer Science',
      })

      expect(result.subject).toBe('Your assignment has been graded')
      expect(result.body).toBe(
        'Your grade for Midterm Exam is A. Course: Introduction to Computer Science.',
      )
    })
  })

  describe('reminder', () => {
    it('should format reminder notification with message', () => {
      const result = formatNotification('reminder', { message: 'Complete your homework' })

      expect(result.subject).toBe('Reminder')
      expect(result.body).toBe('Complete your homework')
    })

    it('should format reminder notification with due date', () => {
      const result = formatNotification('reminder', {
        message: 'Complete your homework',
        dueDate: '2026-04-15',
      })

      expect(result.subject).toBe('Reminder')
      expect(result.body).toBe('Complete your homework Due date: 2026-04-15.')
    })
  })

  describe('error handling', () => {
    it('should throw error for unknown notification type', () => {
      expect(() => formatNotification('unknown' as any, { courseName: 'test' })).toThrow(
        'Unknown notification type: unknown',
      )
    })
  })
})
