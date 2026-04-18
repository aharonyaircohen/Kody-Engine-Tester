import { describe, it, expect } from 'vitest'
import {
  formatNotification,
  filterNotifications,
  getUnreadCount,
  sortBySeverity,
  formatNotificationMessage,
  groupNotificationsByType,
  isUnread,
  buildNotificationPayload,
} from './notificationHelpers'
import type { Notification, NotificationRecord } from '@/models/notification'

const mockNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: '1',
  recipient: 'user-1',
  type: 'enrollment',
  severity: 'info',
  title: 'Test',
  message: 'Test message',
  isRead: false,
  createdAt: new Date(),
  ...overrides,
})

describe('notificationHelpers', () => {
  // Original helpers (use Notification type with recipient, severity, isRead)
  describe('formatNotification', () => {
    it('should format notification with severity prefix', () => {
      const n = mockNotification({ severity: 'error', title: 'Error occurred' })
      expect(formatNotification(n)).toBe('[ERROR] Error occurred: Test message')
    })

    it('should format info notification', () => {
      const n = mockNotification({ severity: 'info', title: 'Info message' })
      expect(formatNotification(n)).toBe('[INFO] Info message: Test message')
    })

    it('should format warning notification', () => {
      const n = mockNotification({ severity: 'warning', title: 'Warning message' })
      expect(formatNotification(n)).toBe('[WARNING] Warning message: Test message')
    })
  })

  describe('filterNotifications', () => {
    it('should filter by severity', () => {
      const notifications = [
        mockNotification({ id: '1', severity: 'info' }),
        mockNotification({ id: '2', severity: 'error' }),
      ]
      expect(filterNotifications(notifications, { severity: 'error' })).toHaveLength(1)
      expect(filterNotifications(notifications, { severity: 'error' })[0].id).toBe('2')
    })

    it('should filter by isRead status', () => {
      const notifications = [
        mockNotification({ id: '1', isRead: true }),
        mockNotification({ id: '2', isRead: false }),
      ]
      expect(filterNotifications(notifications, { isRead: false })).toHaveLength(1)
      expect(filterNotifications(notifications, { isRead: false })[0].id).toBe('2')
    })

    it('should filter by recipientId', () => {
      const notifications = [
        mockNotification({ id: '1', recipient: 'user-1' }),
        mockNotification({ id: '2', recipient: 'user-2' }),
      ]
      expect(filterNotifications(notifications, { recipientId: 'user-2' })).toHaveLength(1)
      expect(filterNotifications(notifications, { recipientId: 'user-2' })[0].id).toBe('2')
    })

    it('should combine multiple filters', () => {
      const notifications = [
        mockNotification({ id: '1', severity: 'error', isRead: false }),
        mockNotification({ id: '2', severity: 'error', isRead: true }),
        mockNotification({ id: '3', severity: 'info', isRead: false }),
      ]
      const filtered = filterNotifications(notifications, { severity: 'error', isRead: false })
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('1')
    })

    it('should return all notifications when no filter provided', () => {
      const notifications = [mockNotification({ id: '1' }), mockNotification({ id: '2' })]
      expect(filterNotifications(notifications, {})).toHaveLength(2)
    })
  })

  describe('getUnreadCount', () => {
    it('should count unread notifications', () => {
      const notifications = [
        mockNotification({ id: '1', isRead: false }),
        mockNotification({ id: '2', isRead: true }),
        mockNotification({ id: '3', isRead: false }),
      ]
      expect(getUnreadCount(notifications)).toBe(2)
    })

    it('should return 0 when all notifications are read', () => {
      const notifications = [
        mockNotification({ id: '1', isRead: true }),
        mockNotification({ id: '2', isRead: true }),
      ]
      expect(getUnreadCount(notifications)).toBe(0)
    })

    it('should return 0 for empty array', () => {
      expect(getUnreadCount([])).toBe(0)
    })
  })

  describe('sortBySeverity', () => {
    it('should sort error > warning > info', () => {
      const notifications = [
        mockNotification({ id: '1', severity: 'info' }),
        mockNotification({ id: '2', severity: 'error' }),
        mockNotification({ id: '3', severity: 'warning' }),
      ]
      const sorted = sortBySeverity(notifications)
      expect(sorted[0].severity).toBe('error')
      expect(sorted[1].severity).toBe('warning')
      expect(sorted[2].severity).toBe('info')
    })

    it('should not mutate original array', () => {
      const notifications = [
        mockNotification({ id: '1', severity: 'info' }),
        mockNotification({ id: '2', severity: 'error' }),
      ]
      const original = [...notifications]
      sortBySeverity(notifications)
      expect(notifications[0].id).toBe(original[0].id)
      expect(notifications[1].id).toBe(original[1].id)
    })
  })

  // New helpers (use NotificationRecord type with userId, type, read)
  describe('formatNotificationMessage', () => {
    it('returns title by default', () => {
      const n: NotificationRecord = {
        id: 'n1', userId: 'u1', type: 'info', title: 'Test', message: 'Test message',
        read: false, createdAt: new Date(),
      }
      expect(formatNotificationMessage(n)).toBe('Test')
    })

    it('returns title when no mention pattern found', () => {
      const n: NotificationRecord = {
        id: 'n1', userId: 'u1', type: 'info', title: 'Greeting', message: 'Hello world',
        read: false, createdAt: new Date(),
      }
      expect(formatNotificationMessage(n)).toBe('Greeting')
    })
  })

  describe('groupNotificationsByType', () => {
    it('groups notifications by type', () => {
      const notifications: NotificationRecord[] = [
        { id: '1', userId: 'u1', type: 'info', title: 'T', message: 'M', read: false, createdAt: new Date() },
        { id: '2', userId: 'u1', type: 'warning', title: 'T', message: 'M', read: false, createdAt: new Date() },
        { id: '3', userId: 'u1', type: 'info', title: 'T', message: 'M', read: false, createdAt: new Date() },
        { id: '4', userId: 'u1', type: 'error', title: 'T', message: 'M', read: false, createdAt: new Date() },
        { id: '5', userId: 'u1', type: 'success', title: 'T', message: 'M', read: false, createdAt: new Date() },
      ]
      const grouped = groupNotificationsByType(notifications)
      expect(grouped.info).toHaveLength(2)
      expect(grouped.warning).toHaveLength(1)
      expect(grouped.error).toHaveLength(1)
      expect(grouped.success).toHaveLength(1)
    })

    it('returns empty arrays for missing types', () => {
      const notifications: NotificationRecord[] = [
        { id: '1', userId: 'u1', type: 'info', title: 'T', message: 'M', read: false, createdAt: new Date() },
      ]
      const grouped = groupNotificationsByType(notifications)
      expect(grouped.warning).toHaveLength(0)
      expect(grouped.error).toHaveLength(0)
      expect(grouped.success).toHaveLength(0)
    })

    it('does not mutate original array', () => {
      const notifications: NotificationRecord[] = [
        { id: '1', userId: 'u1', type: 'info', title: 'T', message: 'M', read: false, createdAt: new Date() },
      ]
      const original = [...notifications]
      groupNotificationsByType(notifications)
      expect(notifications[0].id).toBe(original[0].id)
    })
  })

  describe('isUnread', () => {
    it('returns true for unread notifications', () => {
      const n: NotificationRecord = {
        id: 'n1', userId: 'u1', type: 'info', title: 'T', message: 'M',
        read: false, createdAt: new Date(),
      }
      expect(isUnread(n)).toBe(true)
    })

    it('returns false for read notifications', () => {
      const n: NotificationRecord = {
        id: 'n1', userId: 'u1', type: 'info', title: 'T', message: 'M',
        read: true, createdAt: new Date(),
      }
      expect(isUnread(n)).toBe(false)
    })
  })

  describe('buildNotificationPayload', () => {
    it('builds payload with info type and read=false by default', () => {
      const payload = buildNotificationPayload({ userId: 'u1', title: 'T', message: 'M' })
      expect(payload.type).toBe('info')
      expect(payload.read).toBe(false)
      expect(payload.userId).toBe('u1')
      expect(payload.title).toBe('T')
      expect(payload.message).toBe('M')
    })

    it('allows override of type', () => {
      const payload = buildNotificationPayload({ userId: 'u1', title: 'T', message: 'M', type: 'error' })
      expect(payload.type).toBe('error')
      expect(payload.read).toBe(false)
    })

    it('does not include id or createdAt', () => {
      const payload = buildNotificationPayload({ userId: 'u1', title: 'T', message: 'M' })
      expect('id' in payload).toBe(false)
      expect('createdAt' in payload).toBe(false)
    })
  })
})
