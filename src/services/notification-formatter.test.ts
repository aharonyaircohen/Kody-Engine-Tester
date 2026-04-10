import { describe, it, expect } from 'vitest'
import { formatNotification } from './notification-formatter'

describe('formatNotification', () => {
  describe('enrollment', () => {
    it('should format enrollment notification with all fields', () => {
      const result = formatNotification('enrollment', {
        courseName: 'CS101',
        userName: 'John',
      })

      expect(result.subject).toBe('Welcome to CS101!')
      expect(result.body).toBe(
        'Hi John, you have successfully enrolled in CS101. Your learning journey begins now!',
      )
    })

    it('should keep placeholder when userName is missing', () => {
      const result = formatNotification('enrollment', {
        courseName: 'CS101',
      })

      expect(result.subject).toBe('Welcome to CS101!')
      expect(result.body).toBe(
        'Hi {{userName}}, you have successfully enrolled in CS101. Your learning journey begins now!',
      )
    })
  })

  describe('grade', () => {
    it('should format grade notification with all fields', () => {
      const result = formatNotification('grade', {
        assignmentName: 'Quiz 1',
        grade: 'A',
        courseName: 'CS101',
        userName: 'Sarah',
      })

      expect(result.subject).toBe('Your assignment "Quiz 1" has been graded')
      expect(result.body).toBe(
        'Hi Sarah, you received a grade of A on your assignment "Quiz 1" in CS101.',
      )
    })

    it('should handle missing optional fields', () => {
      const result = formatNotification('grade', {
        assignmentName: 'Quiz 1',
        grade: 'B+',
      })

      expect(result.subject).toBe('Your assignment "Quiz 1" has been graded')
      expect(result.body).toBe(
        'Hi {{userName}}, you received a grade of B+ on your assignment "Quiz 1" in {{courseName}}.',
      )
    })
  })

  describe('reminder', () => {
    it('should format reminder notification with all fields', () => {
      const result = formatNotification('reminder', {
        assignmentName: 'Final Project',
        dueDate: 'December 15, 2024',
        courseName: 'CS101',
        userName: 'Mike',
      })

      expect(result.subject).toBe('Reminder: "Final Project" is due December 15, 2024')
      expect(result.body).toBe(
        "Hi Mike, this is a friendly reminder that \"Final Project\" in CS101 is due on December 15, 2024. Don't forget to submit!",
      )
    })

    it('should handle missing dueDate', () => {
      const result = formatNotification('reminder', {
        assignmentName: 'Final Project',
        courseName: 'CS101',
        userName: 'Mike',
      })

      expect(result.subject).toBe('Reminder: "Final Project" is due {{dueDate}}')
    })
  })

  describe('unknown type', () => {
    it('should return default notification for unknown type', () => {
      const result = formatNotification('unknown' as any, {})

      expect(result.subject).toBe('Notification')
      expect(result.body).toBe('You have a new notification.')
    })
  })

  describe('template interpolation', () => {
    it('should replace all placeholders with provided values', () => {
      const result = formatNotification('enrollment', {
        courseName: 'Advanced Math',
        userName: 'Alice',
      })

      expect(result.subject).not.toContain('{{')
      expect(result.body).not.toContain('{{')
    })

    it('should not modify text without placeholders', () => {
      const result = formatNotification('unknown' as any, {
        courseName: 'Test',
      })

      expect(result.body).toBe('You have a new notification.')
    })
  })
})
