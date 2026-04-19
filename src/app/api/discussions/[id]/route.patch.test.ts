import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { handlePatch } from './route'
import { discussionsStore } from '@/collections/Discussions'
import { clearStore, TEST_USER } from '../discussions.shared'

// Mock the auth module so all requests pass auth
vi.mock('@/auth/auth-service', () => ({
  getAuthService: vi.fn(() => ({
    verifyAccessToken: vi.fn(() => ({ user: TEST_USER })),
  })),
}))

const RICH_TEXT = { root: { children: [{ text: 'Original content' }] } }
const RICH_TEXT_UPDATED = { root: { children: [{ text: 'Updated content' }] } }

function makePatchRequest(
  id: string,
  body: Record<string, unknown>
): NextRequest {
  return new NextRequest(`http://localhost/api/discussions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('PATCH /api/discussions/[id]', () => {
  let existingPostId: string

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-19T10:00:00Z'))
    clearStore()
    existingPostId = discussionsStore.create({
      lesson: 'lesson-patch',
      author: 'author-x',
      content: RICH_TEXT,
    }).id
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('happy path', () => {
    it('updates content and returns 200', async () => {
      const request = makePatchRequest(existingPostId, { content: RICH_TEXT_UPDATED })
      const response = await handlePatch(request, { user: TEST_USER }, { params: Promise.resolve({ id: existingPostId }) })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.data.content).toEqual(RICH_TEXT_UPDATED)
    })

    it('updates isPinned to true', async () => {
      const request = makePatchRequest(existingPostId, { isPinned: true })
      const response = await handlePatch(request, { user: TEST_USER }, { params: Promise.resolve({ id: existingPostId }) })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.data.isPinned).toBe(true)
    })

    it('updates isResolved to true', async () => {
      const request = makePatchRequest(existingPostId, { isResolved: true })
      const response = await handlePatch(request, { user: TEST_USER }, { params: Promise.resolve({ id: existingPostId }) })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.data.isResolved).toBe(true)
    })

    it('updates multiple fields at once', async () => {
      const request = makePatchRequest(existingPostId, {
        content: RICH_TEXT_UPDATED,
        isPinned: true,
        isResolved: true,
      })
      const response = await handlePatch(request, { user: TEST_USER }, { params: Promise.resolve({ id: existingPostId }) })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.data.content).toEqual(RICH_TEXT_UPDATED)
      expect(body.data.isPinned).toBe(true)
      expect(body.data.isResolved).toBe(true)
    })

    it('persists the update in the store', async () => {
      const request = makePatchRequest(existingPostId, { isPinned: true })
      await handlePatch(request, { user: TEST_USER }, { params: Promise.resolve({ id: existingPostId }) })

      const post = discussionsStore.getById(existingPostId)
      expect(post?.isPinned).toBe(true)
    })
  })

  describe('error paths', () => {
    it('returns 401 when no auth token is provided', async () => {
      const request = makePatchRequest(existingPostId, { isPinned: true })
      // Pass empty context to simulate unauthenticated call
      const response = await handlePatch(request, {}, { params: Promise.resolve({ id: existingPostId }) })

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.success).toBe(false)
    })

    it('returns 400 when id parameter is missing', async () => {
      const request = makePatchRequest(existingPostId, { isPinned: true })
      const response = await handlePatch(request, { user: TEST_USER }, { params: Promise.resolve({ id: '' }) })

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toContain('id')
    })

    it('returns 400 when body is not a JSON object', async () => {
      const badRequest = new NextRequest(`http://localhost/api/discussions/${existingPostId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: 'not-json',
      })
      const response = await handlePatch(badRequest, { user: TEST_USER }, { params: Promise.resolve({ id: existingPostId }) })

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toContain('JSON')
    })

    it('returns 400 when isPinned is not a boolean', async () => {
      const request = makePatchRequest(existingPostId, { isPinned: 'yes' })
      const response = await handlePatch(request, { user: TEST_USER }, { params: Promise.resolve({ id: existingPostId }) })

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toContain('isPinned')
    })

    it('returns 400 when isResolved is not a boolean', async () => {
      const request = makePatchRequest(existingPostId, { isResolved: 1 })
      const response = await handlePatch(request, { user: TEST_USER }, { params: Promise.resolve({ id: existingPostId }) })

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toContain('isResolved')
    })

    it('returns 400 when content is not a valid RichTextContent object', async () => {
      const request = makePatchRequest(existingPostId, { content: { wrong: 'shape' } })
      const response = await handlePatch(request, { user: TEST_USER }, { params: Promise.resolve({ id: existingPostId }) })

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toContain('content')
    })

    it('returns 400 when no update fields are provided', async () => {
      const request = makePatchRequest(existingPostId, { lesson: 'changed' })
      const response = await handlePatch(request, { user: TEST_USER }, { params: Promise.resolve({ id: existingPostId }) })

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toContain('At least one')
    })

    it('returns 404 when the post does not exist', async () => {
      const request = makePatchRequest('non-existent-id', { isPinned: true })
      const response = await handlePatch(request, { user: TEST_USER }, { params: Promise.resolve({ id: 'non-existent-id' }) })

      expect(response.status).toBe(404)
      const body = await response.json()
      expect(body.success).toBe(false)
      expect(body.error).toContain('not found')
    })
  })
})
