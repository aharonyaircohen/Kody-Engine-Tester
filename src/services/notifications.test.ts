import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NotificationService } from './notifications'

describe('NotificationService', () => {
  let service: NotificationService
  let mockPayload: any

  beforeEach(() => {
    mockPayload = {
      create: vi.fn(),
      find: vi.fn(),
      update: vi.fn(),
    }
    service = new NotificationService(mockPayload)
  })

  describe('notify', () => {
    it('should create a notification via payload', async () => {
      mockPayload.create.mockResolvedValue({ id: '1', title: 'Test' })

      const result = await service.notify('user-1', 'enrollment', 'Enrolled!', 'You enrolled in CS101', '/courses/cs101')

      expect(mockPayload.create).toHaveBeenCalledWith({
        collection: 'notifications',
        data: {
          recipient: 'user-1',
          type: 'enrollment',
          title: 'Enrolled!',
          message: 'You enrolled in CS101',
          link: '/courses/cs101',
          isRead: false,
        },
      })
      expect(result).toEqual({ id: '1', title: 'Test' })
    })

    it('should create notification without optional link', async () => {
      mockPayload.create.mockResolvedValue({ id: '2' })

      await service.notify('user-1', 'grade', 'Graded', 'Your assignment was graded')

      expect(mockPayload.create).toHaveBeenCalledWith({
        collection: 'notifications',
        data: expect.objectContaining({ link: undefined }),
      })
    })
  })

  describe('getUnread', () => {
    it('should query payload for unread notifications for user', async () => {
      mockPayload.find.mockResolvedValue({ docs: [{ id: '1', isRead: false }] })

      const result = await service.getUnread('user-1')

      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'notifications',
        where: {
          recipient: { equals: 'user-1' },
          isRead: { equals: false },
        },
        sort: '-createdAt',
        limit: 50,
      })
      expect(result).toEqual([{ id: '1', isRead: false }])
    })
  })

  describe('markRead', () => {
    it('should update notification isRead to true', async () => {
      mockPayload.update.mockResolvedValue({ id: 'n1', isRead: true })

      const result = await service.markRead('n1')

      expect(mockPayload.update).toHaveBeenCalledWith({
        collection: 'notifications',
        id: 'n1',
        data: { isRead: true },
      })
      expect(result).toEqual({ id: 'n1', isRead: true })
    })
  })

  describe('markAllRead', () => {
    it('should update all unread notifications for user', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [{ id: 'n1' }, { id: 'n2' }],
      })
      mockPayload.update.mockResolvedValue({})

      await service.markAllRead('user-1')

      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'notifications',
        where: {
          recipient: { equals: 'user-1' },
          isRead: { equals: false },
        },
        limit: 0,
      })
      expect(mockPayload.update).toHaveBeenCalledWith({
        collection: 'notifications',
        where: {
          recipient: { equals: 'user-1' },
          isRead: { equals: false },
        },
        data: { isRead: true },
      })
    })
  })
})
