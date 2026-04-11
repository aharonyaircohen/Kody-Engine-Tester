import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { extractBearerToken } from '@/auth/_auth'

// Mock Payload - must use importOriginal to preserve buildConfig
vi.mock('payload', async (importOriginal) => {
  const actual = await importOriginal<typeof import('payload')>()
  return {
    ...actual,
    getPayload: vi.fn(() => Promise.resolve({
      findByID: vi.fn().mockResolvedValue({
        id: '123',
        title: 'Test Quiz',
        module: 'module-1',
        order: 1,
        passingScore: 70,
        timeLimit: null,
        maxAttempts: 3,
        questions: [],
      }),
      find: vi.fn().mockResolvedValue({ docs: [] }),
      update: vi.fn().mockResolvedValue({}),
    })),
  }
})

// Mock the withAuth to simulate authentication behavior
vi.mock('@/auth/withAuth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/auth/withAuth')>()
  return {
    ...actual,
    withAuth: (handler: (req: NextRequest, context: unknown, routeParams?: unknown) => Promise<Response>) => {
      return async (req: NextRequest, routeParams?: unknown) => {
        const authHeader = req.headers.get('authorization')
        const token = extractBearerToken(authHeader)

        // If no token, reject
        if (!token) {
          return Response.json(
            { error: 'Missing or invalid Authorization header' },
            { status: 401 }
          )
        }

        // Check for specific test tokens
        if (token === 'invalid-token' || token === 'expired-token') {
          return Response.json({ error: 'Invalid token' }, { status: 401 })
        }

        if (token === 'valid-token') {
          return handler(req, { user: { id: '1', email: 'test@example.com', role: 'admin' as const, isActive: true } }, routeParams)
        }

        return Response.json({ error: 'Invalid token' }, { status: 401 })
      }
    },
  }
})

// Import after mocking
import { GET as getQuiz } from '@/app/api/quizzes/[id]/route'
import { POST as markAllRead } from '@/app/api/notifications/read-all/route'

describe('Protected Routes Integration Tests', () => {
  describe('Authentication Required', () => {
    it('returns 401 when no token provided to protected route', async () => {
      const request = new NextRequest('http://localhost/api/quizzes/123', {
        method: 'GET',
      })
      const response = await getQuiz(request, { params: Promise.resolve({ id: '123' }) })
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Missing or invalid Authorization header')
    })

    it('returns 401 for invalid token on protected route', async () => {
      const request = new NextRequest('http://localhost/api/quizzes/123', {
        method: 'GET',
        headers: {
          authorization: 'Bearer invalid-token',
        },
      })
      const response = await getQuiz(request, { params: Promise.resolve({ id: '123' }) })
      expect(response.status).toBe(401)
    })

    it('returns 401 for expired token on protected route', async () => {
      const request = new NextRequest('http://localhost/api/quizzes/123', {
        method: 'GET',
        headers: {
          authorization: 'Bearer expired-token',
        },
      })
      const response = await getQuiz(request, { params: Promise.resolve({ id: '123' }) })
      expect(response.status).toBe(401)
    })

    it('returns 401 when no token provided to POST protected route', async () => {
      const request = new NextRequest('http://localhost/api/notifications/read-all', {
        method: 'POST',
      })
      const response = await markAllRead(request)
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Missing or invalid Authorization header')
    })

    it('accepts authenticated request and returns data', async () => {
      const request = new NextRequest('http://localhost/api/quizzes/123', {
        method: 'GET',
        headers: {
          authorization: 'Bearer valid-token',
        },
      })
      const response = await getQuiz(request, { params: Promise.resolve({ id: '123' }) })
      // The mock Payload returns a quiz, so we should get 200
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.id).toBe('123')
      expect(body.title).toBe('Test Quiz')
    })
  })
})