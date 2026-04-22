import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

// Mock the progress service (provides getPayloadInstance)
vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn().mockResolvedValue({
    find: vi.fn().mockResolvedValue({
      docs: [
        {
          id: 'c1',
          title: 'TypeScript Fundamentals',
          shortDescription: 'Learn TS from scratch',
          status: 'published',
          difficulty: 'beginner',
          instructor: { id: 'u1', displayName: 'Alice Smith' },
        },
      ],
      totalDocs: 1,
      totalPages: 1,
      page: 1,
    }),
  }),
}))

describe('GET /api/courses/search', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with SearchResult shape', async () => {
    const request = new NextRequest('http://localhost/api/courses/search?q=typescript')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')

    const body = await response.json()
    expect(body).toHaveProperty('items')
    expect(Array.isArray(body.items)).toBe(true)
    expect(body).toHaveProperty('total')
    expect(body).toHaveProperty('page')
    expect(body).toHaveProperty('pageSize')
    expect(body).toHaveProperty('totalPages')
  })

  it('returns items with expected course fields', async () => {
    const request = new NextRequest('http://localhost/api/courses/search')
    const response = await GET(request)

    const body = await response.json()
    expect(body.items[0]).toMatchObject({
      id: 'c1',
      title: 'TypeScript Fundamentals',
      status: 'published',
      difficulty: 'beginner',
    })
  })

  it('returns 400 when difficulty is invalid', async () => {
    const request = new NextRequest('http://localhost/api/courses/search?difficulty=expert')
    const response = await GET(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toHaveProperty('error')
    expect(body.error).toContain('Invalid difficulty')
  })

  it('returns 400 for partially invalid difficulty', async () => {
    const request = new NextRequest('http://localhost/api/courses/search?difficulty=intermedia')
    const response = await GET(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBeDefined()
  })

  it('passes q, instructor, and difficulty query params to the search service', async () => {
    const request = new NextRequest(
      'http://localhost/api/courses/search?q=react&instructor=alice&difficulty=intermediate',
    )
    await GET(request)

    const { getPayloadInstance } = await import('@/services/progress')
    const mockFind = (await getPayloadInstance()).find as ReturnType<typeof vi.fn>
    const call = mockFind.mock.calls[0][0]

    expect(call.where).toBeDefined()
    const whereStr = JSON.stringify(call.where)
    expect(whereStr).toContain('react')
    expect(whereStr).toContain('published')
    expect(whereStr).toContain('intermediate')
  })

  it('passes page and pageSize to the search service', async () => {
    const request = new NextRequest('http://localhost/api/courses/search?page=2&pageSize=5')
    await GET(request)

    const { getPayloadInstance } = await import('@/services/progress')
    const mockFind = (await getPayloadInstance()).find as ReturnType<typeof vi.fn>
    const call = mockFind.mock.calls[0][0]

    expect(call.page).toBe(2)
    expect(call.limit).toBe(5)
  })

  it('handles empty search (no query params)', async () => {
    const request = new NextRequest('http://localhost/api/courses/search')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.items).toBeDefined()
    expect(Array.isArray(body.items)).toBe(true)
  })

  it('returns 200 for valid difficulty values', async () => {
    for (const diff of ['beginner', 'intermediate', 'advanced']) {
      const request = new NextRequest(`http://localhost/api/courses/search?difficulty=${diff}`)
      const response = await GET(request)
      expect(response.status).toBe(200)
    }
  })
})
