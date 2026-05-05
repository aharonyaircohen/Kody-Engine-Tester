import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

// Mock Payload
const mockPayload = {
  findByID: vi.fn(),
}

vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(() => mockPayload),
}))

// Mock withAuth to bypass authentication and pass through to handler
vi.mock('@/auth/withAuth', () => ({
  withAuth: (handler: (req: NextRequest, context: { user?: unknown }) => Promise<Response>) => {
    return async (req: NextRequest) => {
      // Simulate authenticated user
      const mockUser = { id: 1, email: 'test@example.com', role: 'viewer' }
      return handler(req, { user: mockUser })
    }
  },
}))

describe('GET /api/greeting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('returns correct greeting based on locale', () => {
    it('returns Hola for locale=es', async () => {
      mockPayload.findByID.mockResolvedValue({ id: 1, locale: 'es' })

      const request = new NextRequest('http://localhost/api/greeting')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.greeting).toBe('Hola')
    })

    it('returns Bonjour for locale=fr', async () => {
      mockPayload.findByID.mockResolvedValue({ id: 1, locale: 'fr' })

      const request = new NextRequest('http://localhost/api/greeting')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.greeting).toBe('Bonjour')
    })

    it('returns Hello for locale=en', async () => {
      mockPayload.findByID.mockResolvedValue({ id: 1, locale: 'en' })

      const request = new NextRequest('http://localhost/api/greeting')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.greeting).toBe('Hello')
    })

    it('returns Hello when locale is undefined', async () => {
      mockPayload.findByID.mockResolvedValue({ id: 1 })

      const request = new NextRequest('http://localhost/api/greeting')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.greeting).toBe('Hello')
    })
  })
})
