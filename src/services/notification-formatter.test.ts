import { describe, it, expect } from 'vitest'
import { formatNotification, type NotificationType } from './notification-formatter'

describe('NotificationFormatter', () => {
  describe('formatNotification', () => {
    describe('enrollment', () => {
      it('should format enrollment notification with course name', () => {
        const result = formatNotification('enrollment', {
          courseName: 'CS101',
          courseId: 'cs101-id',
        })

        expect(result.subject).toBe('You have been enrolled in CS101')
        expect(result.body).toBe('Congratulations! You are now enrolled in CS101. Course ID: cs101-id')
      })

      it('should format enrollment notification without course id', () => {
        const result = formatNotification('enrollment', { courseName: 'Mathematics 201' })

        expect(result.subject).toBe('You have been enrolled in Mathematics 201')
        expect(result.body).toBe('Congratulations! You are now enrolled in Mathematics 201.')
      })

      it('should format enrollment notification with missing course name', () => {
        const result = formatNotification('enrollment', { courseId: 'xyz' })

        expect(result.subject).toBe('You have been enrolled in a course')
        expect(result.body).toBe('Congratulations! You are now enrolled in the course. Course ID: xyz')
      })
    })

    describe('grade', () => {
      it('should format grade notification with all fields', () => {
        const result = formatNotification('grade', {
          assignmentName: 'Final Project',
          courseName: 'CS101',
          grade: 'A',
        })

        expect(result.subject).toBe('Your assignment "Final Project" has been graded')
        expect(result.body).toBe(
          'Your assignment "Final Project" in CS101 has been graded.\n\nGrade: A',
        )
      })

      it('should format grade notification without assignment name', () => {
        const result = formatNotification('grade', {
          courseName: 'Physics 101',
          grade: 'B+',
        })

        expect(result.subject).toBe('Your assignment "assignment" has been graded')
        expect(result.body).toBe('Your assignment "assignment" in Physics 101 has been graded.\n\nGrade: B+')
      })

      it('should format grade notification with missing grade', () => {
        const result = formatNotification('grade', {
          assignmentName: 'Quiz 1',
          courseName: 'Chemistry',
        })

        expect(result.body).toContain('Grade: N/A')
      })
    })

    describe('reminder', () => {
      it('should format reminder notification with due date', () => {
        const result = formatNotification('reminder', {
          reminderText: 'Assignment deadline approaching',
          dueDate: '2026-04-15',
        })

        expect(result.subject).toBe('Reminder: Assignment deadline approaching')
        expect(result.body).toBe('Assignment deadline approaching. Due date: 2026-04-15')
      })

      it('should format reminder notification without due date', () => {
        const result = formatNotification('reminder', {
          reminderText: 'Complete your profile',
        })

        expect(result.subject).toBe('Reminder: Complete your profile')
        expect(result.body).toBe('Complete your profile.')
      })

      it('should format reminder notification with missing reminder text', () => {
        const result = formatNotification('reminder', { dueDate: '2026-04-20' })

        expect(result.subject).toBe('Reminder: You have a pending task')
        expect(result.body).toBe('You have a pending task. Due date: 2026-04-20')
      })
    })

    describe('error handling', () => {
      it('should throw error for unknown notification type', () => {
        expect(() => formatNotification('unknown' as NotificationType, {})).toThrow(
          'Unknown notification type: unknown',
        )
      })
    })
  })
})
