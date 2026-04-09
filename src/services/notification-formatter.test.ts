import { describe, it, expect } from 'vitest'
import { formatNotification } from './notification-formatter'

describe('formatNotification', () => {
  describe('enrollment', () => {
    it('returns correct subject and body with all fields', () => {
      const result = formatNotification('enrollment', {
        studentName: 'Alice',
        courseName: 'CS101',
      })

      expect(result).toEqual({
        subject: 'You have been enrolled in CS101',
        body: 'Dear Alice,\n\nYou have successfully enrolled in CS101.\n\nWe look forward to seeing you in class!',
      })
    })

    it('uses defaults when optional fields are missing', () => {
      const result = formatNotification('enrollment', {})

      expect(result).toEqual({
        subject: 'You have been enrolled in a course',
        body: 'Dear Student,\n\nYou have successfully enrolled in the requested course.\n\nWe look forward to seeing you in class!',
      })
    })
  })

  describe('grade', () => {
    it('returns correct subject and body with all fields', () => {
      const result = formatNotification('grade', {
        studentName: 'Bob',
        assignmentName: 'Final Project',
        grade: '95/100',
      })

      expect(result).toEqual({
        subject: 'Your assignment "Final Project" has been graded',
        body: 'Dear Bob,\n\nYour assignment "Final Project" has been graded.\n\nGrade: 95/100\n\nCheck your gradebook for full details.',
      })
    })

    it('uses defaults when optional fields are missing', () => {
      const result = formatNotification('grade', {})

      expect(result).toEqual({
        subject: 'Your assignment "assignment" has been graded',
        body: 'Dear Student,\n\nYour assignment "" has been graded.\n\nGrade: N/A\n\nCheck your gradebook for full details.',
      })
    })
  })

  describe('reminder', () => {
    it('returns correct subject and body with all fields', () => {
      const result = formatNotification('reminder', {
        studentName: 'Carol',
        assignmentName: 'Quiz 3',
        dueDate: 'April 15, 2026',
      })

      expect(result).toEqual({
        subject: 'Reminder: "Quiz 3" is due soon',
        body: 'Dear Carol,\n\nThis is a reminder that "Quiz 3" is due on April 15, 2026.\n\nPlease submit your work before the deadline.',
      })
    })

    it('uses defaults when optional fields are missing', () => {
      const result = formatNotification('reminder', {})

      expect(result).toEqual({
        subject: 'Reminder: "assignment" is due soon',
        body: 'Dear Student,\n\nThis is a reminder that "an assignment" is due on the specified date.\n\nPlease submit your work before the deadline.',
      })
    })
  })

  describe('unknown type', () => {
    it('returns null for unrecognized notification type', () => {
      const result = formatNotification('unknown' as any, { studentName: 'Dave' })
      expect(result).toBeNull()
    })

    it('returns null for empty type', () => {
      const result = formatNotification('', {})
      expect(result).toBeNull()
    })
  })
})
