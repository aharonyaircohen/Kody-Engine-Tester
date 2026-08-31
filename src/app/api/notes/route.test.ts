import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from './route'

// Mock getPayloadInstance
const mockPayload = {
  find: vi.fn(),
  create: vi.fn(),
}

vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(() => mockPayload),
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

describe('Notes API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/notes', () => {
    it('returns 200 with notes list', async () => {
      ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }

      mockPayload.find.mockResolvedValue({
        docs: [
          {
            id: 'note-1',
            title: 'Note 1',
            content: 'Content 1',
            tags: ['tag1'],
            createdAt: '2026-04-05T12:00:00.000Z',
            updatedAt: '2026-04-05T12:00:00.000Z',
          },
        ],
      })

      const request = new NextRequest('http://localhost/api/notes')
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('application/json')

      const body = await response.json()
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBe(1)
      expect(body[0]).toHaveProperty('title', 'Note 1')
    })

    it('returns empty array when no notes exist', async () => {
      ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }

      mockPayload.find.mockResolvedValue({ docs: [] })

      const request = new NextRequest('http://localhost/api/notes')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBe(0)
    })

    it('uses search query when provided', async () => {
      ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }

      mockPayload.find.mockResolvedValue({ docs: [] })

      const request = new NextRequest('http://localhost/api/notes?q=test')
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(mockPayload.find).toHaveBeenCalled()
    })
  })

  describe('POST /api/notes', () => {
    it('returns 401 when user is not authenticated', async () => {
      ;(global as { testUser?: null }).testUser = null

      const request = new NextRequest('http://localhost/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Note', content: 'Content' }),
      })
      const response = await POST(request)

      expect(response.status).toBe(401)
    })

    it('returns 403 when user is not admin or editor', async () => {
      ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }

      const request = new NextRequest('http://localhost/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Note', content: 'Content' }),
      })
      const response = await POST(request)

      expect(response.status).toBe(403)
    })

    it('allows admin to create notes', async () => {
      ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'admin-1', role: 'admin' }

      mockPayload.create.mockResolvedValue({
        id: 'note-new',
        title: 'New Note',
        content: 'Content',
        tags: [],
        createdAt: '2026-04-05T12:00:00.000Z',
        updatedAt: '2026-04-05T12:00:00.000Z',
      })

      const request = new NextRequest('http://localhost/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Note', content: 'Content' }),
      })
      const response = await POST(request)

      expect(response.status).toBe(201)
      const body = await response.json()
      expect(body).toHaveProperty('title', 'New Note')
    })

    it('allows editor to create notes', async () => {
      ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'editor-1', role: 'editor' }

      mockPayload.create.mockResolvedValue({
        id: 'note-new',
        title: 'Editor Note',
        content: 'Content',
        tags: ['tag1', 'tag2'],
        createdAt: '2026-04-05T12:00:00.000Z',
        updatedAt: '2026-04-05T12:00:00.000Z',
      })

      const request = new NextRequest('http://localhost/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Editor Note', content: 'Content', tags: ['tag1', 'tag2'] }),
      })
      const response = await POST(request)

      expect(response.status).toBe(201)
    })

    it('returns 400 when title is missing', async () => {
      ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'admin-1', role: 'admin' }

      const request = new NextRequest('http://localhost/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Content' }),
      })
      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('returns 400 when content is missing', async () => {
      ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'admin-1', role: 'admin' }

      const request = new NextRequest('http://localhost/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Title' }),
      })
      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('handles tags array', async () => {
      ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'admin-1', role: 'admin' }

      mockPayload.create.mockResolvedValue({
        id: 'note-new',
        title: 'Tagged Note',
        content: 'Content',
        tags: ['work', 'important'],
        createdAt: '2026-04-05T12:00:00.000Z',
        updatedAt: '2026-04-05T12:00:00.000Z',
      })

      const request = new NextRequest('http://localhost/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Tagged Note',
          content: 'Content',
          tags: ['work', 'important'],
        }),
      })
      const response = await POST(request)

      expect(response.status).toBe(201)
    })
  })
})
