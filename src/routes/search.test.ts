import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the dependencies before importing
vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(),
}))

vi.mock('@/services/searchService', () => ({
  SearchService: vi.fn().mockImplementation(function () {
    return {
      search: vi.fn().mockResolvedValue({
        data: [{ id: '1', title: 'Test', collection: 'courses' }],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      }),
    }
  }),
}))

vi.mock('@/auth/withAuth', () => ({
  withAuth: (handler: (req: NextRequest, context: { user?: unknown }) => Promise<Response>) => {
    return async (req: NextRequest) => {
      return handler(req, { user: { id: 'user-1', role: 'admin' } })
    }
  },
}))

// Import after mocks are set up
import { GET } from './search'

describe('search route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('returns search results for valid query', async () => {
      const request = new NextRequest('http://localhost:3000/api/search?q=typescript')

      const response = await GET(request)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.data).toHaveLength(1)
      expect(body.meta.total).toBe(1)
    })

    it('returns 200 with results when mock provides data', async () => {
      const request = new NextRequest('http://localhost:3000/api/search?q=nonexistent')

      const response = await GET(request)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.data).toHaveLength(1)
      expect(body.meta.total).toBe(1)
    })

    it('parses pagination parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/search?q=test&page=2&limit=20')

      const response = await GET(request)
      const body = await response.json()

      expect(response.status).toBe(200)
    })

    it('handles missing query parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/search')

      const response = await GET(request)
      const body = await response.json()

      expect(response.status).toBe(200)
    })
  })
})
