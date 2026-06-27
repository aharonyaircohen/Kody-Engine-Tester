import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

// Mock Payload
const mockPayload = {
  find: vi.fn(),
}

vi.mock('payload', () => ({
  getPayload: vi.fn(() => mockPayload),
}))

vi.mock('@payload-config', () => ({
  default: {},
}))

// Mock withAuth
vi.mock('@/auth/withAuth', () => ({
  withAuth: (handler: (req: NextRequest, context: { user?: { id: string; role: string } }, routeParams?: { params: Promise<{ id: string }> }) => Promise<Response>) => {
    return async (req: NextRequest, routeParams?: { params: Promise<{ id: string }> }) => {
      const user = (global as { testUser?: { id: string; role: string } }).testUser
      const params = routeParams?.params
      return handler(req, { user }, { params })
    }
  },
}))

describe('GET /api/quizzes/:id/attempts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when user is not authenticated', async () => {
    ;(global as { testUser?: null }).testUser = null

    const request = new NextRequest('http://localhost/api/quizzes/quiz-1/attempts')
    const response = await GET(request, undefined as unknown as { params: Promise<{ id: string }> })

    expect(response.status).toBe(401)
  })

  it('returns 400 when id parameter is missing', async () => {
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }

    const request = new NextRequest('http://localhost/api/quizzes//attempts')
    const response = await GET(request, undefined as unknown as { params: Promise<{ id: string }> })

    expect(response.status).toBe(400)
  })

  it('returns 200 with user attempts', async () => {
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }

    mockPayload.find.mockResolvedValue({
      docs: [
        {
          id: 'attempt-1',
          score: 80,
          passed: true,
          answers: [{ questionIndex: 0, answer: '4' }],
          completedAt: '2026-04-05T12:00:00.000Z',
        },
        {
          id: 'attempt-2',
          score: 60,
          passed: false,
          answers: [{ questionIndex: 0, answer: '5' }],
          completedAt: '2026-04-04T12:00:00.000Z',
        },
      ],
      totalDocs: 2,
    })

    const request = new NextRequest('http://localhost/api/quizzes/quiz-1/attempts')
    const response = await GET(request, { params: Promise.resolve({ id: 'quiz-1' }) })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')

    const body = await response.json()
    expect(body).toHaveProperty('attempts')
    expect(body).toHaveProperty('total', 2)
    expect(body.attempts.length).toBe(2)
    expect(body.attempts[0]).toHaveProperty('id', 'attempt-1')
    expect(body.attempts[0]).toHaveProperty('score', 80)
    expect(body.attempts[0]).toHaveProperty('passed', true)
    // Should not include sensitive data
    expect(body.attempts[0]).not.toHaveProperty('quiz')
  })

  it('returns empty attempts array when none exist', async () => {
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }

    mockPayload.find.mockResolvedValue({
      docs: [],
      totalDocs: 0,
    })

    const request = new NextRequest('http://localhost/api/quizzes/quiz-1/attempts')
    const response = await GET(request, { params: Promise.resolve({ id: 'quiz-1' }) })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('attempts')
    expect(body.attempts).toEqual([])
    expect(body).toHaveProperty('total', 0)
  })
})
