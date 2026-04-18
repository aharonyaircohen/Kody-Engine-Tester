import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'
import { notificationsRouter } from './notifications'

// Mock withAuth so it passes through the handler without JWT validation
vi.mock('@/auth/withAuth', () => ({
  withAuth: vi.fn((handler) => handler),
}))

// Mock the notification service
vi.mock('@/services/notificationService', () => ({
  createNotificationService: vi.fn(() => ({
    send: vi.fn((data) => ({
      ok: true,
      val: {
        id: 'test-id-123',
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        read: false,
        createdAt: new Date('2026-01-01'),
      },
    })),
    getUserNotifications: vi.fn((userId) => ({
      ok: true,
      val: [
        {
          id: 'n1',
          userId,
          type: 'info',
          title: 'Test',
          message: 'Hello',
          read: false,
          createdAt: new Date('2026-01-01'),
        },
      ],
    })),
    markRead: vi.fn(() => ({ ok: true, val: undefined })),
    delete: vi.fn(() => ({ ok: true, val: undefined })),
  })),
}))

// Mock Zod to bypass validation in tests
vi.mock('zod', () => ({
  z: {
    object: vi.fn(() => ({
      safeParse: vi.fn((data) => ({ success: true, data })),
    })),
  },
}))

function makeNextRequest(partial: Partial<NextRequest> & { body?: unknown; params?: Record<string, string> }): NextRequest {
  return {
    json: vi.fn(async () => partial.body ?? {}),
    ...partial,
  } as unknown as NextRequest
}

const mockUser = { id: 'user-1', email: 'test@test.com', role: 'admin' as const }

describe('notificationsRouter handlers', () => {
  describe('GET — getUserNotifications', () => {
    it('returns 200 with notifications for user', async () => {
      const handler = notificationsRouter['handlers'].getUser
      const req = makeNextRequest({ params: { userId: 'u1' } })
      const response = await handler(req, { user: mockUser }, { params: { userId: 'u1' } })
      expect(response.status).toBe(200)
    })

    it('returns 400 when service returns err', async () => {
      const { createNotificationService } = await import('@/services/notificationService')
      ;(createNotificationService as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        getUserNotifications: vi.fn(() => ({ ok: false, err: 'Service error' })),
      })
      const handler = notificationsRouter['handlers'].getUser
      const req = makeNextRequest({ params: { userId: 'u1' } })
      const response = await handler(req, { user: mockUser }, { params: { userId: 'u1' } })
      expect(response.status).toBe(400)
    })
  })

  describe('POST — createNotification', () => {
    it('returns 201 with notification on valid input', async () => {
      const handler = notificationsRouter['handlers'].post
      const req = makeNextRequest({
        body: { userId: 'u1', type: 'info', title: 'Hello', message: 'World' },
      })
      const response = await handler(req, { user: mockUser })
      expect(response.status).toBe(201)
    })

    it('returns 400 when service returns err', async () => {
      const { createNotificationService } = await import('@/services/notificationService')
      ;(createNotificationService as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        send: vi.fn(() => ({ ok: false, err: 'Validation failed' })),
      })
      const handler = notificationsRouter['handlers'].post
      const req = makeNextRequest({
        body: { userId: 'u1', type: 'info', title: 'Hello', message: 'World' },
      })
      const response = await handler(req, { user: mockUser })
      expect(response.status).toBe(400)
    })
  })

  describe('PATCH — markRead', () => {
    it('returns 200 when markRead succeeds', async () => {
      const handler = notificationsRouter['handlers'].markRead
      const req = makeNextRequest({ params: { id: 'test-id' } })
      const response = await handler(req, { user: mockUser }, { params: { id: 'test-id' } })
      expect(response.status).toBe(200)
    })

    it('returns 404 when notification not found', async () => {
      const { createNotificationService } = await import('@/services/notificationService')
      ;(createNotificationService as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        markRead: vi.fn(() => ({ ok: false, err: 'Notification not found' })),
      })
      const handler = notificationsRouter['handlers'].markRead
      const req = makeNextRequest({ params: { id: 'unknown-id' } })
      const response = await handler(req, { user: mockUser }, { params: { id: 'unknown-id' } })
      expect(response.status).toBe(404)
    })
  })

  describe('DELETE — deleteNotification', () => {
    it('returns 204 when delete succeeds', async () => {
      const handler = notificationsRouter['handlers'].delete
      const req = makeNextRequest({ params: { id: 'test-id' } })
      const response = await handler(req, { user: mockUser }, { params: { id: 'test-id' } })
      expect(response.status).toBe(204)
    })

    it('returns 404 when notification not found', async () => {
      const { createNotificationService } = await import('@/services/notificationService')
      ;(createNotificationService as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        delete: vi.fn(() => ({ ok: false, err: 'Notification not found' })),
      })
      const handler = notificationsRouter['handlers'].delete
      const req = makeNextRequest({ params: { id: 'unknown-id' } })
      const response = await handler(req, { user: mockUser }, { params: { id: 'unknown-id' } })
      expect(response.status).toBe(404)
    })
  })
})
