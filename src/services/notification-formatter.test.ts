import { describe, it, expect } from 'vitest'
import { formatNotification } from './notification-formatter'

describe('formatNotification', () => {
  describe('enrollment', () => {
    it('should format enrollment notification with course name', () => {
      const result = formatNotification('enrollment', { courseName: 'CS101' })

      expect(result.subject).toBe('CS101 enrollment')
      expect(result.body).toBe('You have been enrolled in CS101. Happy learning!')
    })

    it('should handle missing course name gracefully', () => {
      const result = formatNotification('enrollment', {})

      expect(result.subject).toBe(' enrollment')
      expect(result.body).toBe('You have been enrolled in . Happy learning!')
    })
  })

  describe('grade', () => {
    it('should format grade notification with grade and course name', () => {
      const result = formatNotification('grade', {
        grade: 'A',
        courseName: 'CS101',
      })

      expect(result.subject).toBe(' grade posted for CS101')
      expect(result.body).toBe('Your grade of A has been posted for CS101. Keep up the great work!')
    })

    it('should handle missing grade and course name', () => {
      const result = formatNotification('grade', {})

      expect(result.subject).toBe(' grade posted for ')
      expect(result.body).toBe('Your grade of  has been posted for . Keep up the great work!')
    })
  })

  describe('reminder', () => {
    it('should format reminder notification with lesson name and due date', () => {
      const result = formatNotification('reminder', {
        lessonName: 'Assignment 1',
        dueDate: '2026-04-15',
      })

      expect(result.subject).toBe('Reminder: Assignment 1')
      expect(result.body).toBe('Reminder: Assignment 1 is due on 2026-04-15.')
    })

    it('should include custom message in reminder', () => {
      const result = formatNotification('reminder', {
        lessonName: 'Assignment 1',
        dueDate: '2026-04-15',
        message: 'Please submit on time.',
      })

      expect(result.body).toBe('Reminder: Assignment 1 is due on 2026-04-15. Please submit on time.')
    })

    it('should handle missing lesson name gracefully', () => {
      const result = formatNotification('reminder', {})

      expect(result.subject).toBe('Reminder: ')
      expect(result.body).toBe('Reminder:  is due on .')
    })
  })

  describe('unknown type', () => {
    it('should return default notification for unknown type', () => {
      const result = formatNotification('unknown', {})

      expect(result.subject).toBe('Notification')
      expect(result.body).toBe('You have a new notification.')
    })

    it('should use message from data for unknown type', () => {
      const result = formatNotification('unknown', { message: 'Custom message' })

      expect(result.body).toBe('Custom message')
    })
  })
})