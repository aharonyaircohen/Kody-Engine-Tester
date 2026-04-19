import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { handleDelete } from './route'
import { discussionsStore } from '@/collections/Discussions'
import { clearStore, TEST_USER } from '../discussions.shared'

// Mock the auth module so all requests pass auth
vi.mock('@/auth/auth-service', () => ({
  getAuthService: vi.fn(() => ({
    verifyAccessToken: vi.fn(() => ({ user: TEST_USER })),
  })),
}))

const RICH_TEXT = { root: { children: [{ text: 'Post to delete' }] } }

function makeDeleteRequest(id: string): NextRequest {
  return new NextRequest(`http://localhost/api/discussions/${id}`, {
    method: 'DELETE',
  })
}

describe('DELETE /api/discussions/[id]', () => {
  let existingPostId: string

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-19T10:00:00Z'))
    clearStore()
    existingPostId = discussionsStore.create({
      lesson: 'lesson-delete',
      author: 'author-x',
      content: RICH_TEXT,
    }).id
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('happy path', () => {
    it('returns 204 on successful deletion', async () => {
      const request = makeDeleteRequest(existingPostId)
      const response = await handleDelete(
        request,
        { user: TEST_USER },
        { params: Promise.resolve({ id: existingPostId }) }
      )

      expect(response.status).toBe(204)
    })

    it('removes the post from the store', async () => {
      const request = makeDeleteRequest(existingPostId)
      await handleDelete(request, { user: TEST_USER }, { params: Promise.resolve({ id: existingPostId }) })

      expect(discussionsStore.getById(existingPostId)).toBeNull()
    })
  })

  describe('error paths', () => {
    it('returns 401 when no auth token is provided', async () => {
      const request = makeDeleteRequest(existingPostId)
      // Pass empty context to simulate unauthenticated call
      const response = await handleDelete(request, {}, { params: Promise.resolve({ id: existingPostId }) })

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.success).toBe(false)
    })

    it('returns 400 when id parameter is missing', async () => {
      const request = makeDeleteRequest(existingPostId)
      const response = await handleDelete(
        request,
        { user: TEST_USER },
        { params: Promise.resolve({ id: '' }) }
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toContain('id')
    })

    it('returns 404 when the post does not exist', async () => {
      const request = makeDeleteRequest('non-existent-id')
      const response = await handleDelete(
        request,
        { user: TEST_USER },
        { params: Promise.resolve({ id: 'non-existent-id' }) }
      )

      expect(response.status).toBe(404)
      const body = await response.json()
      expect(body.success).toBe(false)
      expect(body.error).toContain('not found')
    })
  })
})
