import { describe, it, expect } from 'vitest'
import { formatNotification } from './notification-formatter'

describe('formatNotification', () => {
  describe('enrollment', () => {
    it('returns correct subject and body with all data', () => {
      const result = formatNotification('enrollment', {
        courseName: 'Math 101',
        studentName: 'Alice',
      })

      expect(result.subject).toBe("You've been enrolled in Math 101")
      expect(result.body).toBe(
        'Dear Alice, you have been successfully enrolled in Math 101. You can now access all course materials.',
      )
    })

    it('uses fallback values when data is missing', () => {
      const result = formatNotification('enrollment', {})

      expect(result.subject).toBe("You've been enrolled in a course")
      expect(result.body).toBe(
        'Dear Student, you have been successfully enrolled in the course. You can now access all course materials.',
      )
    })
  })

  describe('grade', () => {
    it('returns correct subject and body with all data', () => {
      const result = formatNotification('grade', {
        courseName: 'Physics 201',
        assignmentName: 'Midterm Exam',
        grade: '85',
        totalPoints: '100',
      })

      expect(result.subject).toBe('Your grade for Midterm Exam')
      expect(result.body).toBe(
        'You received 85/100 on Midterm Exam in Physics 201.',
      )
    })

    it('uses fallback values when data is missing', () => {
      const result = formatNotification('grade', {})

      expect(result.subject).toBe('Your grade for an assignment')
      expect(result.body).toBe(
        'You received 0/0 on the assignment in the course.',
      )
    })
  })

  describe('reminder', () => {
    it('returns correct subject and body with all data', () => {
      const result = formatNotification('reminder', {
        courseName: 'Chemistry 101',
        assignmentName: 'Lab Report',
        dueDate: 'April 15, 2026',
      })

      expect(result.subject).toBe('Reminder: Lab Report is due soon')
      expect(result.body).toBe(
        'This is a reminder that Lab Report in Chemistry 101 is due on April 15, 2026.',
      )
    })

    it('uses fallback values when data is missing', () => {
      const result = formatNotification('reminder', {})

      expect(result.subject).toBe('Reminder: an assignment is due soon')
      expect(result.body).toBe(
        'This is a reminder that the assignment in the course is due on the specified date.',
      )
    })
  })

  describe('unknown type', () => {
    it('returns fallback notification when type is not recognized', () => {
      const result = formatNotification('unknown', { key: 'value' })

      expect(result.subject).toBe('Notification')
      expect(result.body).toBe('No template found for notification type: unknown')
    })
  })
})
