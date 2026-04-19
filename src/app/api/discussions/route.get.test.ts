import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'
import { discussionsStore } from '@/collections/Discussions'
import { clearStore, TEST_USER } from './discussions.shared'

// Mock the auth module so all requests pass auth
vi.mock('@/auth/auth-service', () => ({
  getAuthService: vi.fn(() => ({
    verifyAccessToken: vi.fn(() => ({ user: TEST_USER })),
  })),
}))

const RICH_TEXT = { root: { children: [{ text: 'Hello world' }] } }

describe('GET /api/discussions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-19T10:00:00Z'))
    clearStore()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns 200 with an empty array when no posts exist for the lesson', async () => {
    const request = new NextRequest('http://localhost/api/discussions?lesson=lesson-abc')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({ success: true, data: [] })
  })

  it('returns posts for a lesson sorted newest first', async () => {
    // Create two posts with known timestamps
    discussionsStore.create({
      lesson: 'lesson-xyz',
      author: 'author-1',
      content: RICH_TEXT,
    })
    vi.advanceTimersByTime(1000)

    discussionsStore.create({
      lesson: 'lesson-xyz',
      author: 'author-2',
      content: RICH_TEXT,
    })

    const request = new NextRequest('http://localhost/api/discussions?lesson=lesson-xyz')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data).toHaveLength(2)
    // Newest first
    expect(new Date(body.data[0].createdAt) > new Date(body.data[1].createdAt)).toBe(true)
  })

  it('does not return posts for a different lesson', async () => {
    discussionsStore.create({
      lesson: 'lesson-alpha',
      author: 'author-1',
      content: RICH_TEXT,
    })

    const request = new NextRequest('http://localhost/api/discussions?lesson=lesson-beta')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data).toHaveLength(0)
  })

  it('returns 400 when lesson query parameter is missing', async () => {
    const request = new NextRequest('http://localhost/api/discussions')
    const response = await GET(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toEqual({
      success: false,
      error: 'Missing required query parameter: lesson',
    })
  })

  it('returns posts with serialized dates (ISO string, not Date object)', async () => {
    discussionsStore.create({
      lesson: 'lesson-serial',
      author: 'author-1',
      content: RICH_TEXT,
    })

    const request = new NextRequest('http://localhost/api/discussions?lesson=lesson-serial')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    const post = body.data[0]
    expect(typeof post.createdAt).toBe('string')
    expect(typeof post.updatedAt).toBe('string')
    expect(new Date(post.createdAt).toString()).not.toBe('Invalid Date')
  })
})
