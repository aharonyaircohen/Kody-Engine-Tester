import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import type { Payload } from 'payload'

const mockPayload = {
  find: vi.fn(),
} as unknown as Payload

const mockListVisibleUsers = vi.fn()

vi.mock('@/auth/withAuth', () => ({
  withAuth: (handler: unknown) => handler,
}))

vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(() => Promise.resolve(mockPayload)),
}))

vi.mock('@/auth/list-visible-users', () => ({
  ListVisibleUsersService: class {
    listVisibleUsers = mockListVisibleUsers
  },
}))

import { GET } from './route'

const sampleUser = {
  id: 2,
  email: 'editor@example.com',
  role: 'editor' as const,
  collection: 'users' as const,
  updatedAt: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  isActive: true,
}

describe('GET /api/users/visible', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockListVisibleUsers.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
    })
  })

  it('returns 200 with the visible-users result envelope on the happy path', async () => {
    mockListVisibleUsers.mockResolvedValueOnce({
      data: [sampleUser],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    })

    const request = new NextRequest('http://localhost/api/users/visible')
    const response = await GET(request, { user: sampleUser })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')

    const body = await response.json()
    expect(body.data).toHaveLength(1)
    expect(body.data[0].email).toBe('editor@example.com')
    expect(body.meta).toEqual({ total: 1, page: 1, limit: 20, totalPages: 1 })
    expect(mockListVisibleUsers).toHaveBeenCalledTimes(1)
  })

  it('parses page and limit query params and forwards them to the service', async () => {
    const request = new NextRequest('http://localhost/api/users/visible?page=3&limit=7')
    const response = await GET(request, { user: sampleUser })

    expect(response.status).toBe(200)
    expect(mockListVisibleUsers).toHaveBeenCalledWith(
      sampleUser,
      { page: 3, limit: 7 }
    )
  })

  it('falls back to defaults when page/limit are non-numeric', async () => {
    const request = new NextRequest('http://localhost/api/users/visible?page=abc&limit=xyz')
    const response = await GET(request, { user: sampleUser })

    expect(response.status).toBe(200)
    expect(mockListVisibleUsers).toHaveBeenCalledWith(sampleUser, { page: 1, limit: 20 })
  })

  it('clamps a negative page to 1', async () => {
    const request = new NextRequest('http://localhost/api/users/visible?page=-5&limit=20')
    await GET(request, { user: sampleUser })

    expect(mockListVisibleUsers).toHaveBeenCalledWith(sampleUser, { page: 1, limit: 20 })
  })

  it('caps an oversize limit at MAX_LIMIT (100)', async () => {
    const request = new NextRequest('http://localhost/api/users/visible?page=1&limit=9999')
    await GET(request, { user: sampleUser })

    expect(mockListVisibleUsers).toHaveBeenCalledWith(sampleUser, { page: 1, limit: 100 })
  })

  it('floors fractional page and limit values', async () => {
    const request = new NextRequest('http://localhost/api/users/visible?page=2.7&limit=12.9')
    await GET(request, { user: sampleUser })

    expect(mockListVisibleUsers).toHaveBeenCalledWith(sampleUser, { page: 2, limit: 12 })
  })
})
