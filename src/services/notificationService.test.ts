import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NotificationService } from './notificationService'

/**
 * Tests for the notificationService re-export module.
 * Verifies that NotificationService is correctly re-exported from the
 * underlying implementation in '@/services/notifications'.
 */
describe('notificationService', () => {
  describe('module export', () => {
    it('should export NotificationService class', () => {
      expect(NotificationService).toBeDefined()
      expect(typeof NotificationService).toBe('function')
    })
  })

  describe('NotificationService integration', () => {
    let mockPayload: any
    let service: NotificationService

    beforeEach(() => {
      mockPayload = {
        create: vi.fn(),
        find: vi.fn(),
        update: vi.fn(),
      }
      service = new NotificationService(mockPayload)
    })

    describe('notify', () => {
      it('should create a notification with all required fields', async () => {
        mockPayload.create.mockResolvedValue({ id: 'n1', title: 'New enrollment' })

        const result = await service.notify(
          'user-42',
          'enrollment',
          'Enrolled!',
          'You have been enrolled in CS101',
          '/courses/cs101',
        )

        expect(mockPayload.create).toHaveBeenCalledWith({
          collection: 'notifications',
          data: {
            recipient: 'user-42',
            type: 'enrollment',
            title: 'Enrolled!',
            message: 'You have been enrolled in CS101',
            link: '/courses/cs101',
            isRead: false,
          },
        })
        expect(result).toEqual({ id: 'n1', title: 'New enrollment' })
      })

      it('should omit link when not provided', async () => {
        mockPayload.create.mockResolvedValue({ id: 'n2' })

        await service.notify('user-42', 'grade', 'Graded', 'Your quiz was graded')

        expect(mockPayload.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ link: undefined }),
          }),
        )
      })

      it('should set isRead to false by default', async () => {
        mockPayload.create.mockResolvedValue({ id: 'n3' })

        await service.notify('user-1', 'announcement', 'Announcement', 'Site update')

        expect(mockPayload.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ isRead: false }),
          }),
        )
      })
    })

    describe('getUnread', () => {
      it('should query unread notifications sorted by createdAt desc', async () => {
        mockPayload.find.mockResolvedValue({
          docs: [{ id: 'n1', isRead: false }, { id: 'n2', isRead: false }],
        })

        const result = await service.getUnread('user-42')

        expect(mockPayload.find).toHaveBeenCalledWith({
          collection: 'notifications',
          where: {
            recipient: { equals: 'user-42' },
            isRead: { equals: false },
          },
          sort: '-createdAt',
          limit: 50,
        })
        expect(result).toHaveLength(2)
      })

      it('should return empty array when no unread notifications', async () => {
        mockPayload.find.mockResolvedValue({ docs: [] })

        const result = await service.getUnread('user-99')

        expect(result).toEqual([])
      })
    })

    describe('markRead', () => {
      it('should update isRead to true for a notification', async () => {
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
      it('should mark all unread notifications for user as read', async () => {
        mockPayload.find.mockResolvedValue({ docs: [{ id: 'n1' }, { id: 'n2' }] })
        mockPayload.update.mockResolvedValue({})

        await service.markAllRead('user-42')

        // find is called first to get unread ids (limit: 0 is sufficient)
        expect(mockPayload.find).toHaveBeenCalledWith({
          collection: 'notifications',
          where: {
            recipient: { equals: 'user-42' },
            isRead: { equals: false },
          },
          limit: 0,
        })
        // update then marks them all read
        expect(mockPayload.update).toHaveBeenCalledWith({
          collection: 'notifications',
          where: {
            recipient: { equals: 'user-42' },
            isRead: { equals: false },
          },
          data: { isRead: true },
        })
      })

      it('should handle no unread notifications gracefully', async () => {
        mockPayload.find.mockResolvedValue({ docs: [] })
        mockPayload.update.mockResolvedValue({})

        await service.markAllRead('user-99')

        expect(mockPayload.update).toHaveBeenCalled()
      })
    })
  })
})
