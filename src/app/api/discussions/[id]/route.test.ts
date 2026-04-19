import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { PATCH, DELETE } from './route'

const mockPosts = new Map()

vi.mock('@/collections/Discussions', () => ({
  discussionsStore: {
    update: vi.fn((id: string, input: any) => {
      const post = mockPosts.get(id)
      if (!post) throw new Error(`Discussion post with id "${id}" not found`)
      const updated = { ...post, ...input, updatedAt: new Date() }
      mockPosts.set(id, updated)
      return updated
    }),
    delete: vi.fn((id: string) => {
      if (!mockPosts.has(id)) return false
      mockPosts.delete(id)
      return true
    }),
  },
}))

beforeEach(() => {
  mockPosts.clear()
  vi.clearAllMocks()
  // seed one post
  mockPosts.set('post-existing', {
    id: 'post-existing',
    lesson: 'lesson-1',
    author: 'alice',
    content: { root: { children: [{ text: 'hello' }] } },
    parentPost: null,
    isPinned: false,
    isResolved: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
})

const validRichText = { root: { children: [{ text: 'updated' }] } }

describe('PATCH /api/discussions/[id]', () => {
  it('updates isPinned and returns 200', async () => {
    const request = new NextRequest('http://localhost/api/discussions/post-existing', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPinned: true }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'post-existing' }) })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toMatchObject({ success: true })
    expect(body.data.isPinned).toBe(true)
  })

  it('returns 400 when id param is missing', async () => {
    const request = new NextRequest('http://localhost/api/discussions/post-existing', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPinned: true }),
    })
    const response = await PATCH(request, { params: Promise.resolve({}) as Promise<{ id: string }> })

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toMatchObject({ success: false })
    expect(body.error).toContain('id')
  })

  it('returns 404 when post does not exist', async () => {
    const request = new NextRequest('http://localhost/api/discussions/nonexistent', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isResolved: true }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'nonexistent' }) })

    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body).toMatchObject({ success: false })
    expect(body.error).toContain('not found')
  })

  it('returns 400 when isResolved is not a boolean', async () => {
    const request = new NextRequest('http://localhost/api/discussions/post-existing', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isResolved: 'yes' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'post-existing' }) })

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toMatchObject({ success: false })
    expect(body.error).toContain('isResolved')
  })

  it('returns 400 when no fields are provided', async () => {
    const request = new NextRequest('http://localhost/api/discussions/post-existing', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'post-existing' }) })

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toMatchObject({ success: false })
    expect(body.error).toContain('At least one field')
  })
})

describe('DELETE /api/discussions/[id]', () => {
  it('deletes an existing post and returns 200', async () => {
    const request = new NextRequest('http://localhost/api/discussions/post-existing', {
      method: 'DELETE',
    })
    const response = await DELETE(request, { params: Promise.resolve({ id: 'post-existing' }) })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toMatchObject({ success: true, data: null })
  })

  it('returns 400 when id param is missing', async () => {
    const request = new NextRequest('http://localhost/api/discussions/post-existing', {
      method: 'DELETE',
    })
    const response = await DELETE(request, { params: Promise.resolve({}) as Promise<{ id: string }> })

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toMatchObject({ success: false })
    expect(body.error).toContain('id')
  })

  it('returns 404 when post does not exist', async () => {
    const request = new NextRequest('http://localhost/api/discussions/nonexistent', {
      method: 'DELETE',
    })
    const response = await DELETE(request, { params: Promise.resolve({ id: 'nonexistent' }) })

    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body).toMatchObject({ success: false })
    expect(body.error).toContain('not found')
  })
})
