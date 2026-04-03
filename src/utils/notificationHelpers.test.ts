import { describe, it, expect } from 'vitest'
import {
  getNotificationTypeLabel,
  getNotificationIcon,
  formatNotificationTitle,
  truncateMessage,
  filterByType,
  filterByTypes,
  getUnread,
  getRead,
  sortByDate,
  groupByType,
  getNotificationCounts,
  isStale,
  filterStale,
  type Notification,
} from './notificationHelpers'

const createNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: '1',
  recipient: 'user-1',
  type: 'enrollment',
  title: 'Enrolled!',
  message: 'You enrolled in CS101',
  link: '/courses/cs101',
  isRead: false,
  createdAt: new Date().toISOString(),
  ...overrides,
})

describe('notificationHelpers', () => {
  describe('getNotificationTypeLabel', () => {
    it('returns label for enrollment type', () => {
      expect(getNotificationTypeLabel('enrollment')).toBe('Enrollment')
    })

    it('returns label for grade type', () => {
      expect(getNotificationTypeLabel('grade')).toBe('Grade')
    })

    it('returns label for deadline type', () => {
      expect(getNotificationTypeLabel('deadline')).toBe('Deadline')
    })

    it('returns label for discussion type', () => {
      expect(getNotificationTypeLabel('discussion')).toBe('Discussion')
    })

    it('returns label for announcement type', () => {
      expect(getNotificationTypeLabel('announcement')).toBe('Announcement')
    })
  })

  describe('getNotificationIcon', () => {
    it('returns emoji for enrollment', () => {
      expect(getNotificationIcon('enrollment')).toBe('🎓')
    })

    it('returns emoji for grade', () => {
      expect(getNotificationIcon('grade')).toBe('📝')
    })

    it('returns emoji for deadline', () => {
      expect(getNotificationIcon('deadline')).toBe('⏰')
    })

    it('returns emoji for discussion', () => {
      expect(getNotificationIcon('discussion')).toBe('💬')
    })

    it('returns emoji for announcement', () => {
      expect(getNotificationIcon('announcement')).toBe('📢')
    })
  })

  describe('formatNotificationTitle', () => {
    it('combines icon and title', () => {
      const notification = createNotification({ type: 'enrollment', title: 'Enrolled!' })
      expect(formatNotificationTitle(notification)).toBe('🎓 Enrolled!')
    })
  })

  describe('truncateMessage', () => {
    it('returns message unchanged when under maxLen', () => {
      expect(truncateMessage('Hello', 10)).toBe('Hello')
    })

    it('truncates message longer than maxLen with ellipsis', () => {
      expect(truncateMessage('Hello World', 8)).toBe('Hello...')
    })

    it('uses custom maxLen', () => {
      expect(truncateMessage('Hello World', 5)).toBe('He...')
    })

    it('handles empty string', () => {
      expect(truncateMessage('', 10)).toBe('')
    })
  })

  describe('filterByType', () => {
    it('filters notifications by type', () => {
      const notifications = [
        createNotification({ id: '1', type: 'enrollment' }),
        createNotification({ id: '2', type: 'grade' }),
        createNotification({ id: '3', type: 'enrollment' }),
      ]
      const result = filterByType(notifications, 'enrollment')
      expect(result).toHaveLength(2)
      expect(result.every((n) => n.type === 'enrollment')).toBe(true)
    })

    it('returns empty array when no matches', () => {
      const notifications = [createNotification({ type: 'grade' })]
      expect(filterByType(notifications, 'enrollment')).toHaveLength(0)
    })
  })

  describe('filterByTypes', () => {
    it('filters notifications by multiple types', () => {
      const notifications = [
        createNotification({ id: '1', type: 'enrollment' }),
        createNotification({ id: '2', type: 'grade' }),
        createNotification({ id: '3', type: 'deadline' }),
      ]
      const result = filterByTypes(notifications, ['enrollment', 'grade'])
      expect(result).toHaveLength(2)
    })
  })

  describe('getUnread', () => {
    it('returns only unread notifications', () => {
      const notifications = [
        createNotification({ id: '1', isRead: false }),
        createNotification({ id: '2', isRead: true }),
        createNotification({ id: '3', isRead: false }),
      ]
      expect(getUnread(notifications)).toHaveLength(2)
    })
  })

  describe('getRead', () => {
    it('returns only read notifications', () => {
      const notifications = [
        createNotification({ id: '1', isRead: false }),
        createNotification({ id: '2', isRead: true }),
      ]
      expect(getRead(notifications)).toHaveLength(1)
    })
  })

  describe('sortByDate', () => {
    it('sorts notifications by date descending by default', () => {
      const notifications = [
        createNotification({ id: '1', createdAt: '2024-01-01T00:00:00Z' }),
        createNotification({ id: '2', createdAt: '2024-01-03T00:00:00Z' }),
        createNotification({ id: '3', createdAt: '2024-01-02T00:00:00Z' }),
      ]
      const result = sortByDate(notifications)
      expect(result[0].id).toBe('2')
      expect(result[1].id).toBe('3')
      expect(result[2].id).toBe('1')
    })

    it('sorts notifications by date ascending when specified', () => {
      const notifications = [
        createNotification({ id: '1', createdAt: '2024-01-01T00:00:00Z' }),
        createNotification({ id: '2', createdAt: '2024-01-03T00:00:00Z' }),
      ]
      const result = sortByDate(notifications, false)
      expect(result[0].id).toBe('1')
      expect(result[1].id).toBe('2')
    })

    it('does not mutate original array', () => {
      const notifications = [
        createNotification({ id: '1', createdAt: '2024-01-01T00:00:00Z' }),
        createNotification({ id: '2', createdAt: '2024-01-02T00:00:00Z' }),
      ]
      const original = [...notifications]
      sortByDate(notifications)
      expect(notifications[0].id).toBe(original[0].id)
    })
  })

  describe('groupByType', () => {
    it('groups notifications by type', () => {
      const notifications = [
        createNotification({ id: '1', type: 'enrollment' }),
        createNotification({ id: '2', type: 'grade' }),
        createNotification({ id: '3', type: 'enrollment' }),
      ]
      const result = groupByType(notifications)
      expect(result.enrollment).toHaveLength(2)
      expect(result.grade).toHaveLength(1)
    })

    it('returns empty arrays for types with no notifications', () => {
      const notifications = [createNotification({ type: 'enrollment' })]
      const result = groupByType(notifications)
      expect(result.grade).toHaveLength(0)
    })
  })

  describe('getNotificationCounts', () => {
    it('counts total and by type', () => {
      const notifications = [
        createNotification({ id: '1', type: 'enrollment', isRead: false }),
        createNotification({ id: '2', type: 'grade', isRead: true }),
        createNotification({ id: '3', type: 'enrollment', isRead: false }),
      ]
      const counts = getNotificationCounts(notifications)
      expect(counts.total).toBe(3)
      expect(counts.unread).toBe(2)
      expect(counts.byType.enrollment).toBe(2)
      expect(counts.byType.grade).toBe(1)
    })

    it('initializes all type counts to zero', () => {
      const counts = getNotificationCounts([])
      expect(counts.byType.deadline).toBe(0)
      expect(counts.byType.discussion).toBe(0)
      expect(counts.byType.announcement).toBe(0)
    })
  })

  describe('isStale', () => {
    it('returns false for recent notifications', () => {
      const notification = createNotification({
        createdAt: new Date().toISOString(),
      })
      expect(isStale(notification)).toBe(false)
    })

    it('returns true for old notifications', () => {
      const notification = createNotification({
        createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
      })
      expect(isStale(notification)).toBe(true)
    })

    it('respects custom days threshold', () => {
      const notification = createNotification({
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      })
      expect(isStale(notification, 5)).toBe(true)
      expect(isStale(notification, 15)).toBe(false)
    })
  })

  describe('filterStale', () => {
    it('removes stale notifications', () => {
      const notifications = [
        createNotification({ id: '1', createdAt: new Date().toISOString() }),
        createNotification({
          id: '2',
          createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      ]
      expect(filterStale(notifications)).toHaveLength(1)
      expect(filterStale(notifications)[0].id).toBe('1')
    })

    it('respects custom days threshold', () => {
      const notifications = [
        createNotification({
          id: '1',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      ]
      expect(filterStale(notifications, 5)).toHaveLength(0)
      expect(filterStale(notifications, 15)).toHaveLength(1)
    })
  })
})
