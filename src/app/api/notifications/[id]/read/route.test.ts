import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { PATCH } from './route'

// Mock getPayloadInstance
const mockPayload = {
  find: vi.fn(),
  update: vi.fn(),
}

const mockGetUnread = vi.fn()
const mockMarkRead = vi.fn()
const mockMarkAllRead = vi.fn()

vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(() => mockPayload),
}))

vi.mock('@/services/notifications', () => ({
  NotificationService: vi.fn().mockImplementation(function() {
    return {
      getUnread: mockGetUnread,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
    }
  }),
}))

// Mock withAuth
vi.mock('@/auth/withAuth', () => ({
  withAuth: (handler: (req: NextRequest, context: { user?: { id: string; role: string } }, routeParams?: { params: Promise<{ id: string }> }) => Promise<Response>) => {
    return async (req: NextRequest, routeParams?: { params: Promise<{ id: string }> }) => {
      const user = (global as { testUser?: { id: string; role: string } }).testUser
      const params = routeParams?.params
      return handler(req, { user }, { params })
    }
  },
}))

describe('PATCH /api/notifications/:id/read', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when id parameter is missing', async () => {
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }

    const request = new NextRequest('http://localhost/api/notifications//read', {
      method: 'PATCH',
    })
    const response = await PATCH(request, undefined as unknown as { params: Promise<{ id: string }> })

    expect(response.status).toBe(400)
  })

  it('marks notification as read successfully', async () => {
    mockMarkRead.mockResolvedValue({
      id: 'notif-1',
      title: 'Test',
      isRead: true,
    })

    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }

    const request = new NextRequest('http://localhost/api/notifications/notif-1/read', {
      method: 'PATCH',
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'notif-1' }) })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')

    const body = await response.json()
    expect(body).toHaveProperty('notification')
    expect(body.notification).toHaveProperty('isRead', true)
  })
})
