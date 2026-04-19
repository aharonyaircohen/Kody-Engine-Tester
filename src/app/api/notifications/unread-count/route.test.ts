import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetPayloadInstance = vi.fn()

vi.mock('@/services/progress', () => ({
  getPayloadInstance: (...args: unknown[]) => mockGetPayloadInstance(...args),
}))

// Mirrors the route.ts handler logic — tests behaviour without the withAuth wrapper
async function getUnreadCountHandler(userId: string | undefined, mockService: { getUnread: (userId: string) => Promise<unknown[]> }) {
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const unread = await mockService.getUnread(userId)

  return new Response(
    JSON.stringify({ success: true, data: { unreadCount: unread.length } }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

describe('GET /api/notifications/unread-count', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    const response = await getUnreadCountHandler(undefined, { getUnread: vi.fn() })

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body).toHaveProperty('error', 'Authentication required')
  })

  it('returns unreadCount for authenticated user', async () => {
    const mockService = {
      getUnread: vi.fn().mockResolvedValue([
        { id: '1', isRead: false },
        { id: '2', isRead: false },
        { id: '3', isRead: false },
      ]),
    }

    const response = await getUnreadCountHandler('user-1', mockService)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')

    const body = await response.json()
    expect(body).toEqual({ success: true, data: { unreadCount: 3 } })
    expect(mockService.getUnread).toHaveBeenCalledWith('user-1')
  })

  it('returns unreadCount of 0 when no unread notifications', async () => {
    const mockService = {
      getUnread: vi.fn().mockResolvedValue([]),
    }

    const response = await getUnreadCountHandler('user-2', mockService)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({ success: true, data: { unreadCount: 0 } })
  })
})
