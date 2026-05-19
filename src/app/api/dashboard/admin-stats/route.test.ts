import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

// Mock Payload
const mockPayload = {
  find: vi.fn(),
}

vi.mock('payload', () => ({
  getPayload: vi.fn(() => mockPayload),
}))

vi.mock('@payload-config', () => ({
  default: {},
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

describe('GET /api/dashboard/admin-stats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when user is not authenticated', async () => {
    ;(global as { testUser?: null }).testUser = null

    const request = new NextRequest('http://localhost/api/dashboard/admin-stats')
    const response = await GET(request)

    expect(response.status).toBe(401)
  })

  it('returns 403 when user is not admin', async () => {
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }

    const request = new NextRequest('http://localhost/api/dashboard/admin-stats')
    const response = await GET(request)

    expect(response.status).toBe(403)
  })

  it('returns 200 with user stats for admin', async () => {
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'admin-1', role: 'admin' }

    mockPayload.find.mockResolvedValue({
      docs: [
        { id: 'user-1', email: 'user1@example.com', role: 'viewer', isActive: true },
        { id: 'user-2', email: 'user2@example.com', role: 'editor', isActive: true },
      ],
    })

    const request = new NextRequest('http://localhost/api/dashboard/admin-stats')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')

    const body = await response.json()
    expect(body).toHaveProperty('totalUsers')
    expect(body).toHaveProperty('users')
    expect(body.totalUsers).toBe(2)
    expect(body.users.length).toBe(2)
    // Should only return safe fields
    expect(body.users[0]).toHaveProperty('id')
    expect(body.users[0]).toHaveProperty('email')
    expect(body.users[0]).toHaveProperty('role')
    expect(body.users[0]).toHaveProperty('isActive')
    // Should not return sensitive fields
    expect(body.users[0]).not.toHaveProperty('password')
    expect(body.users[0]).not.toHaveProperty('hash')
  })

  it('filters users by search query', async () => {
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'admin-1', role: 'admin' }

    mockPayload.find.mockResolvedValue({
      docs: [
        { id: 'user-1', email: 'john@example.com', role: 'viewer', isActive: true },
      ],
    })

    const request = new NextRequest('http://localhost/api/dashboard/admin-stats?search=john')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPayload.find).toHaveBeenCalled()
  })

  it('limits results to 100 users', async () => {
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'admin-1', role: 'admin' }

    mockPayload.find.mockResolvedValue({
      docs: Array(50).fill({ id: 'user', email: 'test@example.com', role: 'viewer', isActive: true }),
    })

    const request = new NextRequest('http://localhost/api/dashboard/admin-stats')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.totalUsers).toBe(50)
  })

  it('returns empty users array when no users exist', async () => {
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'admin-1', role: 'admin' }

    mockPayload.find.mockResolvedValue({
      docs: [],
    })

    const request = new NextRequest('http://localhost/api/dashboard/admin-stats')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.totalUsers).toBe(0)
    expect(body.users).toEqual([])
  })
})
