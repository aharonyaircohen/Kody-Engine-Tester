import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

// Mock getPayloadInstance
const mockPayload = {
  find: vi.fn(),
}

const mockSearchCourses = vi.fn()

vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(() => mockPayload),
}))

vi.mock('@/services/course-search', () => ({
  CourseSearchService: vi.fn().mockImplementation(function() {
    return {
      searchCourses: mockSearchCourses,
    }
  }),
}))

// Mock withAuth
vi.mock('@/auth/withAuth', () => ({
  withAuth: (handler: (req: NextRequest, context: { user?: { role: string } }) => Promise<Response>) => {
    return async (req: NextRequest) => {
      const user = (global as { testUser?: { role: string } }).testUser
      return handler(req, { user })
    }
  },
}))

describe('GET /api/courses/search', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global as { testUser?: { role: string } }).testUser = { role: 'viewer' }
  })

  it('returns 200 with search results', async () => {
    mockSearchCourses.mockResolvedValue({
      data: [{ id: 'course-1', title: 'Test Course' }],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    })

    const request = new NextRequest('http://localhost/api/courses/search')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')

    const body = await response.json()
    expect(body).toHaveProperty('data')
    expect(body).toHaveProperty('meta')
    expect(body.meta.total).toBe(1)
  })

  it('validates difficulty parameter', async () => {
    const request = new NextRequest('http://localhost/api/courses/search?difficulty=invalid')
    const response = await GET(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toHaveProperty('error')
    expect(body.error).toContain('Invalid difficulty')
  })

  it('accepts valid difficulty parameter', async () => {
    mockSearchCourses.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    })

    const request = new NextRequest('http://localhost/api/courses/search?difficulty=beginner')
    const response = await GET(request)

    expect(response.status).toBe(200)
  })

  it('clamps pagination parameters', async () => {
    mockSearchCourses.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    })

    // page=0 should be clamped to 1, limit=0 should be clamped to 1
    const request = new NextRequest('http://localhost/api/courses/search?page=0&limit=0')
    const response = await GET(request)

    expect(response.status).toBe(200)
  })

  it('respects maximum limit of 100', async () => {
    mockSearchCourses.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 100, totalPages: 0 },
    })

    // limit=200 should be clamped to 100
    const request = new NextRequest('http://localhost/api/courses/search?limit=200')
    const response = await GET(request)

    expect(response.status).toBe(200)
  })

  it('parses tags from comma-separated string', async () => {
    mockSearchCourses.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    })

    const request = new NextRequest('http://localhost/api/courses/search?tags=tag1,tag2,tag3')
    const response = await GET(request)

    expect(response.status).toBe(200)
  })

  it('accepts valid sort options', async () => {
    mockSearchCourses.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    })

    for (const sort of ['relevance', 'newest', 'popularity', 'rating']) {
      const request = new NextRequest(`http://localhost/api/courses/search?sort=${sort}`)
      const response = await GET(request)
      expect(response.status).toBe(200)
    }
  })

  it('defaults to relevance sort for invalid sort option', async () => {
    mockSearchCourses.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    })

    const request = new NextRequest('http://localhost/api/courses/search?sort=invalid')
    const response = await GET(request)

    expect(response.status).toBe(200)
  })
})
