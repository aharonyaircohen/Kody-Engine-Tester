import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createNotificationService } from './notificationService'
import type { NotificationStore } from '@/models/notification'

describe('NotificationService', () => {
  let mockStore: NotificationStore

  beforeEach(() => {
    mockStore = {
      notifications: [],
      create: vi.fn((data) => ({
        id: 'generated-id',
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        read: false,
        createdAt: new Date(),
      })),
      getByUserId: vi.fn((userId) =>
        mockStore.notifications.filter(n => n.userId === userId)
      ),
      markRead: vi.fn(() => true),
      delete: vi.fn(() => true),
    } as unknown as NotificationStore
  })

  describe('send', () => {
    it('returns ok result with notification on valid input', () => {
      const service = createNotificationService({ store: mockStore })
      const result = service.send({ userId: 'u1', type: 'info', title: 'Hi', message: 'There' })
      expect(result.ok).toBe(true)
      expect(result.val).toBeDefined()
      expect(result.val?.userId).toBe('u1')
      expect(result.val?.type).toBe('info')
    })

    it('calls store.create with correct data', () => {
      const service = createNotificationService({ store: mockStore })
      service.send({ userId: 'u1', type: 'warning', title: 'Warn', message: 'Check' })
      expect(mockStore.create).toHaveBeenCalledWith({
        userId: 'u1',
        type: 'warning',
        title: 'Warn',
        message: 'Check',
      })
    })
  })

  describe('getUserNotifications', () => {
    it('returns ok result with all notifications for a user', () => {
      const n1 = { id: 'n1', userId: 'u1', type: 'info' as const, title: 'A', message: 'B', read: false, createdAt: new Date() }
      const n2 = { id: 'n2', userId: 'u1', type: 'warning' as const, title: 'C', message: 'D', read: false, createdAt: new Date() }
      mockStore.notifications = [n1, n2]
      ;(mockStore.getByUserId as ReturnType<typeof vi.fn>).mockReturnValue([n1, n2])

      const service = createNotificationService({ store: mockStore })
      const result = service.getUserNotifications('u1')
      expect(result.ok).toBe(true)
      expect(result.val).toHaveLength(2)
    })

    it('returns ok with empty array for unknown user', () => {
      ;(mockStore.getByUserId as ReturnType<typeof vi.fn>).mockReturnValue([])
      const service = createNotificationService({ store: mockStore })
      const result = service.getUserNotifications('ghost-user')
      expect(result.ok).toBe(true)
      expect(result.val).toHaveLength(0)
    })
  })

  describe('markRead', () => {
    it('returns ok for existing notification id', () => {
      ;(mockStore.markRead as ReturnType<typeof vi.fn>).mockReturnValue(true)
      const service = createNotificationService({ store: mockStore })
      const result = service.markRead('existing-id')
      expect(result.ok).toBe(true)
    })

    it('returns err for unknown notification id', () => {
      ;(mockStore.markRead as ReturnType<typeof vi.fn>).mockReturnValue(false)
      const service = createNotificationService({ store: mockStore })
      const result = service.markRead('fake-id')
      expect(result.ok).toBe(false)
      expect(result.err).toBe('Notification not found')
    })
  })

  describe('delete', () => {
    it('returns ok for existing notification id', () => {
      ;(mockStore.delete as ReturnType<typeof vi.fn>).mockReturnValue(true)
      const service = createNotificationService({ store: mockStore })
      const result = service.delete('existing-id')
      expect(result.ok).toBe(true)
    })

    it('returns err for unknown notification id', () => {
      ;(mockStore.delete as ReturnType<typeof vi.fn>).mockReturnValue(false)
      const service = createNotificationService({ store: mockStore })
      const result = service.delete('fake-id')
      expect(result.ok).toBe(false)
      expect(result.err).toBe('Notification not found')
    })
  })

  describe('uses default store when no deps provided', () => {
    it('works without passing a store', () => {
      const service = createNotificationService()
      const result = service.send({ userId: 'u1', type: 'info', title: 'T', message: 'M' })
      expect(result.ok).toBe(true)
    })
  })
})
