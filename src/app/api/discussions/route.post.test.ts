import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { discussionsStore } from '@/collections/Discussions'
import { clearStore, TEST_USER } from './discussions.shared'

// Mock withAuth so we can control the user context directly in tests
vi.mock('@/auth/withAuth', () => ({
  withAuth: vi.fn((handler: (req: NextRequest, context: { user: typeof TEST_USER }) => Promise<Response>) => {
    return async (req: NextRequest) => handler(req, { user: TEST_USER })
  }),
}))

// Import after mocking so the module uses the mock
import { POST } from './route'

const RICH_TEXT = { root: { children: [{ text: 'A discussion post' }] } }

function buildPostBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    lesson: 'lesson-new',
    content: RICH_TEXT,
    ...overrides,
  }
}

function makePostRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/discussions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/discussions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-19T10:00:00Z'))
    clearStore()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('happy path', () => {
    it('returns 201 with the created post on success', async () => {
      const request = makePostRequest(buildPostBody())
      const response = await POST(request)

      expect(response.status).toBe(201)
      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.data).toMatchObject({
        id: expect.any(String),
        lesson: 'lesson-new',
        author: TEST_USER.id,
        isPinned: false,
        isResolved: false,
        parentPost: null,
      })
      expect(body.data.createdAt).toBe('2026-04-19T10:00:00.000Z')
      expect(body.data.updatedAt).toBe('2026-04-19T10:00:00.000Z')
    })

    it('creates the post in the store', async () => {
      const req = makePostRequest(buildPostBody())
      await POST(req)

      const posts = discussionsStore.getByLesson('lesson-new')
      expect(posts).toHaveLength(1)
      expect(posts[0].author).toBe(TEST_USER.id)
    })

    it('accepts an optional parentPost field', async () => {
      // First create a parent post
      const parent = discussionsStore.create({
        lesson: 'lesson-thread',
        author: 'author-x',
        content: RICH_TEXT,
      })

      const request = makePostRequest(
        buildPostBody({ lesson: 'lesson-thread', parentPost: parent.id })
      )
      const response = await POST(request)

      expect(response.status).toBe(201)
      const body = await response.json()
      expect(body.data.parentPost).toBe(parent.id)
    })
  })

  describe('error paths', () => {
    it('returns 400 when lesson is missing', async () => {
      const request = makePostRequest(buildPostBody({ lesson: undefined }))
      const response = await POST(request)

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toContain('lesson')
    })

    it('returns 400 when content is missing', async () => {
      const request = makePostRequest(buildPostBody({ content: undefined }))
      const response = await POST(request)

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toContain('content')
    })

    it('returns 400 when content is not a valid RichTextContent object', async () => {
      const request = makePostRequest(buildPostBody({ content: 'just a string' }))
      const response = await POST(request)

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toContain('RichTextContent')
    })

    it('returns 400 when parentPost is neither string nor null', async () => {
      const request = makePostRequest(buildPostBody({ parentPost: 123 }))
      const response = await POST(request)

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toContain('parentPost')
    })
  })
})
