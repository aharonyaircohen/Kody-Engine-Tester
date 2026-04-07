import { describe, it, expect } from 'vitest'
import { formatNotification } from './notification-formatter'

describe('notificationFormatter', () => {
  describe('enrollment', () => {
    it('should format enrollment notification with all fields', () => {
      const result = formatNotification('enrollment', {
        courseName: 'Mathematics 101',
        studentName: 'Alice',
      })

      expect(result.subject).toBe('You have been enrolled in Mathematics 101')
      expect(result.body).toContain('Dear Alice')
      expect(result.body).toContain('Mathematics 101')
      expect(result.body).toContain('successfully enrolled')
    })

    it('should format enrollment notification with missing studentName', () => {
      const result = formatNotification('enrollment', { courseName: 'Physics 201' })

      expect(result.subject).toBe('You have been enrolled in Physics 201')
      expect(result.body).toContain('Dear Student')
    })

    it('should format enrollment notification with missing courseName', () => {
      const result = formatNotification('enrollment', { studentName: 'Bob' })

      expect(result.subject).toBe('You have been enrolled in a course')
      expect(result.body).toContain('Bob')
    })

    it('should format enrollment notification with empty data', () => {
      const result = formatNotification('enrollment', {})

      expect(result.subject).toBe('You have been enrolled in a course')
      expect(result.body).toContain('Dear Student')
    })
  })

  describe('grade', () => {
    it('should format grade notification with all fields', () => {
      const result = formatNotification('grade', {
        assignmentName: 'Final Exam',
        courseName: 'Chemistry',
        studentName: 'Charlie',
        grade: '95',
        maxGrade: '100',
      })

      expect(result.subject).toBe('Your grade for Final Exam has been posted')
      expect(result.body).toContain('Dear Charlie')
      expect(result.body).toContain('Final Exam')
      expect(result.body).toContain('Chemistry')
      expect(result.body).toContain('Grade: 95 / 100')
    })

    it('should format grade notification with missing fields', () => {
      const result = formatNotification('grade', {
        studentName: 'Diana',
        grade: '78',
      })

      expect(result.subject).toBe('Your grade for an assignment has been posted')
      expect(result.body).toContain('Dear Diana')
      expect(result.body).toContain('Grade: 78 / N/A')
    })

    it('should format grade notification with empty data', () => {
      const result = formatNotification('grade', {})

      expect(result.subject).toBe('Your grade for an assignment has been posted')
      expect(result.body).toContain('N/A')
    })

    it('should display grade as N/A when grade is missing but maxGrade is provided', () => {
      const result = formatNotification('grade', { maxGrade: '100' })

      expect(result.body).toContain('Grade: N/A / 100')
    })
  })

  describe('reminder', () => {
    it('should format reminder notification with all fields', () => {
      const result = formatNotification('reminder', {
        taskName: 'Submit Project Report',
        dueDate: 'March 15, 2026',
        studentName: 'Eve',
      })

      expect(result.subject).toBe('Reminder: Submit Project Report is due March 15, 2026')
      expect(result.body).toContain('Dear Eve')
      expect(result.body).toContain('Submit Project Report')
      expect(result.body).toContain('March 15, 2026')
      expect(result.body).toContain('submit your work')
    })

    it('should format reminder notification with missing studentName', () => {
      const result = formatNotification('reminder', {
        taskName: 'Complete Quiz',
        dueDate: 'Tomorrow',
      })

      expect(result.subject).toBe('Reminder: Complete Quiz is due Tomorrow')
      expect(result.body).toContain('Dear Student')
    })

    it('should format reminder notification with missing dueDate', () => {
      const result = formatNotification('reminder', {
        taskName: 'Read Chapter 5',
        studentName: 'Frank',
      })

      expect(result.subject).toBe('Reminder: Read Chapter 5 is due soon')
      expect(result.body).toContain('Frank')
    })

    it('should format reminder notification with empty data', () => {
      const result = formatNotification('reminder', {})

      expect(result.subject).toBe('Reminder: Task is due soon')
      expect(result.body).toContain('Dear Student')
    })
  })

  describe('unknown type', () => {
    it('should return generic notification for unknown type', () => {
      const result = formatNotification('payment', { amount: '100' })

      expect(result.subject).toBe('Notification: payment')
      expect(result.body).toContain('payment')
    })

    it('should return generic notification for empty type', () => {
      const result = formatNotification('', {})

      expect(result.subject).toBe('Notification: ')
      expect(result.body).toBe('You have received a notification of type: ')
    })

    it('should return generic notification for undefined-like type', () => {
      const result = formatNotification('custom_notification' as any, {})

      expect(result.subject).toBe('Notification: custom_notification')
      expect(result.body).toContain('custom_notification')
    })
  })

  describe('edge cases', () => {
    it('should handle special characters in data', () => {
      const result = formatNotification('enrollment', {
        courseName: 'Math & "Advanced" <Calculus>',
        studentName: "O'Connor",
      })

      expect(result.body).toContain('O\'Connor')
      expect(result.body).toContain('Math & "Advanced" <Calculus>')
    })

    it('should handle very long course names', () => {
      const longName = 'A'.repeat(200)
      const result = formatNotification('enrollment', { courseName: longName })

      expect(result.subject).toContain(longName)
    })

    it('should not mutate input data', () => {
      const input = Object.freeze({ courseName: 'Test' })
      expect(() => formatNotification('enrollment', input as any)).not.toThrow()
    })

    it('should return object with correct shape', () => {
      const result = formatNotification('enrollment', { courseName: 'Test' })

      expect(result).toHaveProperty('subject')
      expect(result).toHaveProperty('body')
      expect(typeof result.subject).toBe('string')
      expect(typeof result.body).toBe('string')
    })
  })
})