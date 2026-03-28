import { describe, it, expect, vi } from 'vitest'
import { NotificationService } from './notification-service'
import { CreateNotificationInput, Notification } from '../collections/notifications'

// ─── Test helpers ─────────────────────────────────────────────────────────────

function makeDeps() {
  const notifications: Notification[] = []
  const createNotification = (input: CreateNotificationInput): Notification => {
    const notification: Notification = {
      id: crypto.randomUUID(),
      type: input.type,
      title: input.title,
      message: input.message,
      read: false,
      createdAt: new Date(),
      expiresAt: input.expiresAt,
      actionUrl: input.actionUrl,
      category: input.category,
    }
    notifications.push(notification)
    return notification
  }
  return { notifications, createNotification }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('NotificationService', () => {
  describe('dispatch', () => {
    it('creates a notification when an enrollment event is dispatched', async () => {
      const { notifications, createNotification } = makeDeps()
      const svc = new NotificationService({ createNotification })

      await svc.dispatch({
        type: 'enrollment',
        payload: {
          studentId: 's1',
          studentName: 'Alice',
          courseId: 'c1',
          courseName: 'Intro to React',
        },
      })

      expect(notifications).toHaveLength(1)
      expect(notifications[0].type).toBe('success')
      expect(notifications[0].title).toBe('Enrolled in course')
      expect(notifications[0].category).toBe('system')
    })

    it('creates a notification when a grade-posted event is dispatched', async () => {
      const { notifications, createNotification } = makeDeps()
      const svc = new NotificationService({ createNotification })

      await svc.dispatch({
        type: 'grade-posted',
        payload: {
          studentId: 's1',
          studentName: 'Bob',
          courseId: 'c1',
          courseName: 'Advanced TypeScript',
          assignmentTitle: 'Final Project',
          grade: 85,
          maxScore: 100,
        },
      })

      expect(notifications).toHaveLength(1)
      expect(notifications[0].type).toBe('info')
      expect(notifications[0].title).toBe('Grade posted')
      expect(notifications[0].category).toBe('task')
    })

    it('creates a notification when a certificate-issued event is dispatched', async () => {
      const { notifications, createNotification } = makeDeps()
      const svc = new NotificationService({ createNotification })

      await svc.dispatch({
        type: 'certificate-issued',
        payload: {
          studentId: 's1',
          studentName: 'Carol',
          courseId: 'c1',
          courseName: 'Full-Stack Development',
          certificateId: 'cert-abc123',
        },
      })

      expect(notifications).toHaveLength(1)
      expect(notifications[0].type).toBe('success')
      expect(notifications[0].title).toBe('Certificate issued')
      expect(notifications[0].category).toBe('system')
    })

    it('silently ignores unknown event types without throwing', async () => {
      const { notifications, createNotification } = makeDeps()
      const svc = new NotificationService({ createNotification })

      await expect(
        svc.dispatch({
          // @ts-expect-error — testing runtime handling of unknown events
          type: 'unknown-event',
          // @ts-expect-error — payload validated at runtime only
          payload: { someField: 'value' },
        }),
      ).resolves.not.toThrow()

      expect(notifications).toHaveLength(0)
    })

    it('notifies all subscribers when an event is dispatched', async () => {
      const { createNotification } = makeDeps()
      const svc = new NotificationService({ createNotification })

      const calls: string[] = []
      const unsub1 = svc.subscribe(() => { calls.push('subscriber-1') })
      const unsub2 = svc.subscribe(() => { calls.push('subscriber-2') })

      await svc.dispatch({
        type: 'enrollment',
        payload: {
          studentId: 's1',
          studentName: 'Dave',
          courseId: 'c1',
          courseName: 'Node.js Basics',
        },
      })

      unsub1()
      unsub2()

      expect(calls).toEqual(['subscriber-1', 'subscriber-2'])
    })

    it('passes event payload through correctly to the notification body', async () => {
      const { notifications, createNotification } = makeDeps()
      const svc = new NotificationService({ createNotification })

      await svc.dispatch({
        type: 'grade-posted',
        payload: {
          studentId: 's2',
          studentName: 'Eve',
          courseId: 'c3',
          courseName: 'GraphQL Fundamentals',
          assignmentTitle: 'Schema Design',
          grade: 72,
          maxScore: 80,
        },
      })

      const notif = notifications[0]
      expect(notif.message).toContain('Eve')
      expect(notif.message).toContain('Schema Design')
      expect(notif.message).toContain('GraphQL Fundamentals')
      expect(notif.message).toContain('72/80')
      expect(notif.message).toContain('90') // 72/80 = 90%
    })
  })
})
