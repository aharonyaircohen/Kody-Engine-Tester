import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from './route'

const mockPosts = new Map()

vi.mock('@/collections/Discussions', () => ({
  discussionsStore: {
    getByLesson: vi.fn((lessonId: string) =>
      Array.from(mockPosts.values())
        .filter((p: any) => p.lesson === lessonId)
        .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime()),
    ),
    create: vi.fn((input: any) => {
      const post = {
        id: `post-${Date.now()}`,
        lesson: input.lesson,
        author: input.author,
        content: input.content,
        parentPost: input.parentPost ?? null,
        isPinned: false,
        isResolved: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockPosts.set(post.id, post)
      return post
    }),
  },
}))

beforeEach(() => {
  mockPosts.clear()
  vi.clearAllMocks()
})

const validRichText = { root: { children: [{ text: 'Hello world' }] } }

describe('GET /api/discussions', () => {
  it('returns posts for a given lesson, newest first', async () => {
    // seed two posts directly into the map
    const older = { id: 'p1', lesson: 'lesson-a', author: 'alice', content: validRichText, parentPost: null, isPinned: false, isResolved: false, createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-01') }
    const newer = { id: 'p2', lesson: 'lesson-a', author: 'bob', content: validRichText, parentPost: null, isPinned: false, isResolved: false, createdAt: new Date('2026-01-02'), updatedAt: new Date('2026-01-02') }
    mockPosts.set('p1', older)
    mockPosts.set('p2', newer)

    const request = new NextRequest('http://localhost/api/discussions?lesson=lesson-a')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toMatchObject({ success: true })
    expect(body.data).toHaveLength(2)
    expect(body.data[0].id).toBe('p2') // newest first
    expect(body.data[1].id).toBe('p1')
  })

  it('returns 400 when lesson query param is missing', async () => {
    const request = new NextRequest('http://localhost/api/discussions')
    const response = await GET(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toMatchObject({ success: false })
    expect(body.error).toContain('lesson')
  })
})

describe('POST /api/discussions', () => {
  it('creates a post and returns 201', async () => {
    const request = new NextRequest('http://localhost/api/discussions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lesson: 'lesson-1',
        author: 'alice',
        content: validRichText,
      }),
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body).toMatchObject({ success: true })
    expect(body.data.lesson).toBe('lesson-1')
    expect(body.data.author).toBe('alice')
    expect(body.data.isPinned).toBe(false)
    expect(body.data.isResolved).toBe(false)
    expect(body.data.id).toBeTruthy()
  })

  it('returns 400 when lesson is missing', async () => {
    const request = new NextRequest('http://localhost/api/discussions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: 'alice', content: validRichText }),
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toMatchObject({ success: false })
    expect(body.error).toContain('lesson')
  })

  it('returns 400 when content is not RichTextContent', async () => {
    const request = new NextRequest('http://localhost/api/discussions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lesson: 'lesson-1', author: 'alice', content: 'plain string' }),
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toMatchObject({ success: false })
    expect(body.error).toContain('content')
  })
})
