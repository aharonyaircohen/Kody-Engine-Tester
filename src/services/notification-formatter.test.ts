import { describe, it, expect } from 'vitest'
import { formatNotification } from './notification-formatter'

describe('formatNotification', () => {
  describe('enrollment', () => {
    it('should format enrollment notification with subject and body', () => {
      const result = formatNotification('enrollment', {
        courseName: 'Introduction to TypeScript',
        instructorName: 'Prof. Smith',
      })

      expect(result.subject).toBe('Welcome to Introduction to TypeScript!')
      expect(result.body).toBe(
        'You have been enrolled in Introduction to TypeScript by Prof. Smith. Start learning now!',
      )
    })
  })

  describe('grade', () => {
    it('should format grade notification with subject and body', () => {
      const result = formatNotification('grade', {
        courseName: 'Data Structures',
        assignmentName: 'Final Exam',
        grade: 'A',
      })

      expect(result.subject).toBe('Your grade for Final Exam')
      expect(result.body).toBe(
        'You received a grade of A in Data Structures for Final Exam.',
      )
    })

    it('should format grade notification with different grade values', () => {
      const result = formatNotification('grade', {
        courseName: 'Algorithms',
        assignmentName: 'Problem Set 3',
        grade: 'B+',
      })

      expect(result.subject).toBe('Your grade for Problem Set 3')
      expect(result.body).toBe('You received a grade of B+ in Algorithms for Problem Set 3.')
    })
  })

  describe('reminder', () => {
    it('should format reminder notification with subject and body', () => {
      const result = formatNotification('reminder', {
        courseName: 'Web Development',
        assignmentName: 'Project Proposal',
        dueDate: 'April 15, 2026',
      })

      expect(result.subject).toBe('Reminder: Project Proposal due soon')
      expect(result.body).toBe(
        "Don't forget! Project Proposal in Web Development is due on April 15, 2026.",
      )
    })
  })

  describe('error handling', () => {
    it('should throw error for unknown notification type', () => {
      expect(() => formatNotification('unknown' as any, {})).toThrow(
        'Unknown notification type: unknown',
      )
    })
  })
})