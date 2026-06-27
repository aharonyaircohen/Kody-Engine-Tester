import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, PUT, DELETE } from './route'

// Mock getPayloadInstance
const mockPayload = {
  findByID: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(() => mockPayload),
}))

// Mock withAuth - properly handles roles
vi.mock('@/auth/withAuth', () => ({
  withAuth: (handler: (req: NextRequest, context: { user?: { id: string; role: string } }, routeParams?: { params: Promise<{ id: string }> }) => Promise<Response>, options?: { roles?: string[] }) => {
    return async (req: NextRequest, routeParams?: { params: Promise<{ id: string }> }) => {
      const user = (global as { testUser?: { id: string; role: string } }).testUser

      // Check roles if specified
      if (options?.roles && user) {
        const allowedRoles = options.roles
        if (!allowedRoles.includes(user.role)) {
          return Response.json({ error: 'Forbidden' }, { status: 403 })
        }
      }

      const params = routeParams?.params
      return handler(req, { user }, { params })
    }
  },
}))

describe('Notes [id] API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/notes/:id', () => {
    it('returns 400 when id is missing', async () => {
      ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }

      const request = new NextRequest('http://localhost/api/notes/')
      const response = await GET(request, undefined as unknown as { params: Promise<{ id: string }> })

      expect(response.status).toBe(400)
    })

    it('returns 200 with note when found', async () => {
      ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }

      mockPayload.findByID.mockResolvedValue({
        id: 'note-1',
        title: 'Test Note',
        content: 'Test Content',
        tags: ['test'],
        createdAt: '2026-04-05T12:00:00.000Z',
        updatedAt: '2026-04-05T12:00:00.000Z',
      })

      const request = new NextRequest('http://localhost/api/notes/note-1')
      const response = await GET(request, { params: Promise.resolve({ id: 'note-1' }) })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toHaveProperty('title', 'Test Note')
      expect(body).toHaveProperty('content', 'Test Content')
    })

    it('returns 404 when note is not found', async () => {
      ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }

      mockPayload.findByID.mockRejectedValue(new Error('Not found'))

      const request = new NextRequest('http://localhost/api/notes/nonexistent')
      const response = await GET(request, { params: Promise.resolve({ id: 'nonexistent' }) })

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/notes/:id', () => {
    it('returns 400 when id is missing', async () => {
      ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'admin-1', role: 'admin' }

      const request = new NextRequest('http://localhost/api/notes/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated' }),
      })
      const response = await PUT(request, undefined as unknown as { params: Promise<{ id: string }> })

      expect(response.status).toBe(400)
    })

    it('allows admin to update note', async () => {
      ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'admin-1', role: 'admin' }

      mockPayload.update.mockResolvedValue({
        id: 'note-1',
        title: 'Updated Title',
        content: 'Updated Content',
        tags: [],
        createdAt: '2026-04-05T12:00:00.000Z',
        updatedAt: '2026-04-05T13:00:00.000Z',
      })

      const request = new NextRequest('http://localhost/api/notes/note-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Title', content: 'Updated Content' }),
      })
      const response = await PUT(request, { params: Promise.resolve({ id: 'note-1' }) })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toHaveProperty('title', 'Updated Title')
    })

    it('allows editor to update note', async () => {
      ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'editor-1', role: 'editor' }

      mockPayload.update.mockResolvedValue({
        id: 'note-1',
        title: 'Editor Updated',
        content: 'Content',
        tags: [],
        createdAt: '2026-04-05T12:00:00.000Z',
        updatedAt: '2026-04-05T13:00:00.000Z',
      })

      const request = new NextRequest('http://localhost/api/notes/note-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Editor Updated' }),
      })
      const response = await PUT(request, { params: Promise.resolve({ id: 'note-1' }) })

      expect(response.status).toBe(200)
    })

    it('returns 404 when note to update is not found', async () => {
      ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'admin-1', role: 'admin' }

      mockPayload.update.mockRejectedValue(new Error('Not found'))

      const request = new NextRequest('http://localhost/api/notes/nonexistent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated' }),
      })
      const response = await PUT(request, { params: Promise.resolve({ id: 'nonexistent' }) })

      expect(response.status).toBe(404)
    })

    it('updates only provided fields', async () => {
      ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'admin-1', role: 'admin' }

      mockPayload.update.mockResolvedValue({
        id: 'note-1',
        title: 'Original Title',
        content: 'Updated Content',
        tags: [],
        createdAt: '2026-04-05T12:00:00.000Z',
        updatedAt: '2026-04-05T13:00:00.000Z',
      })

      const request = new NextRequest('http://localhost/api/notes/note-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Updated Content' }), // Only content
      })
      const response = await PUT(request, { params: Promise.resolve({ id: 'note-1' }) })

      expect(response.status).toBe(200)
    })
  })

  describe('DELETE /api/notes/:id', () => {
    it('returns 400 when id is missing', async () => {
      ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'admin-1', role: 'admin' }

      const request = new NextRequest('http://localhost/api/notes/', {
        method: 'DELETE',
      })
      const response = await DELETE(request, undefined as unknown as { params: Promise<{ id: string }> })

      expect(response.status).toBe(400)
    })

    it('allows admin to delete note', async () => {
      ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'admin-1', role: 'admin' }

      mockPayload.delete.mockResolvedValue({ id: 'note-1' })

      const request = new NextRequest('http://localhost/api/notes/note-1', {
        method: 'DELETE',
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'note-1' }) })

      expect(response.status).toBe(204)
    })

    it('returns 404 when note to delete is not found', async () => {
      ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'admin-1', role: 'admin' }

      mockPayload.delete.mockRejectedValue(new Error('Not found'))

      const request = new NextRequest('http://localhost/api/notes/nonexistent', {
        method: 'DELETE',
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'nonexistent' }) })

      expect(response.status).toBe(404)
    })

    it('returns 403 for non-admin users', async () => {
      ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'editor-1', role: 'editor' }

      const request = new NextRequest('http://localhost/api/notes/note-1', {
        method: 'DELETE',
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'note-1' }) })

      expect(response.status).toBe(403)
    })
  })
})
