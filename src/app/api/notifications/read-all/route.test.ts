import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

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
  withAuth: (handler: (req: NextRequest, context: { user?: { id: string; role: string } }) => Promise<Response>) => {
    return async (req: NextRequest) => {
      const user = (global as { testUser?: { id: string; role: string } }).testUser
      return handler(req, { user })
    }
  },
}))

describe('POST /api/notifications/read-all', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when user is not authenticated', async () => {
    ;(global as { testUser?: null }).testUser = null

    const request = new NextRequest('http://localhost/api/notifications/read-all', {
      method: 'POST',
    })
    const response = await POST(request)

    expect(response.status).toBe(401)
  })

  it('marks all notifications as read successfully', async () => {
    mockMarkAllRead.mockResolvedValue(undefined)

    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }

    const request = new NextRequest('http://localhost/api/notifications/read-all', {
      method: 'POST',
    })
    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')

    const body = await response.json()
    expect(body).toHaveProperty('success', true)
  })
})
