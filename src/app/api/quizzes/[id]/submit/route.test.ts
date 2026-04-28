import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

// Mock Payload
const mockPayload = {
  findByID: vi.fn(),
  find: vi.fn(),
  create: vi.fn(),
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

describe('POST /api/quizzes/:id/submit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when user is not authenticated', async () => {
    ;(global as { testUser?: null }).testUser = null

    const request = new NextRequest('http://localhost/api/quizzes/quiz-1/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: [] }),
    })
    const response = await POST(request, undefined as unknown as { params: Promise<{ id: string }> })

    expect(response.status).toBe(401)
  })

  it('returns 400 when id parameter is missing', async () => {
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }

    const request = new NextRequest('http://localhost/api/quizzes//submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: [] }),
    })
    const response = await POST(request, undefined as unknown as { params: Promise<{ id: string }> })

    expect(response.status).toBe(400)
  })

  it('returns 400 when answers is not an array', async () => {
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }

    const request = new NextRequest('http://localhost/api/quizzes/quiz-1/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: 'not-an-array' }),
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'quiz-1' }) })

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toEqual({ error: 'answers array is required' })
  })

  it('returns 404 when quiz is not found', async () => {
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }
    mockPayload.findByID.mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/quizzes/nonexistent/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: [] }),
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'nonexistent' }) })

    expect(response.status).toBe(404)
  })

  it('returns 403 when max attempts exceeded', async () => {
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }

    mockPayload.findByID.mockResolvedValue({
      id: 'quiz-1',
      title: 'Test Quiz',
      passingScore: 70,
      maxAttempts: 3,
      questions: [],
    })
    mockPayload.find.mockResolvedValue({ totalDocs: 3 }) // Already at max

    const request = new NextRequest('http://localhost/api/quizzes/quiz-1/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: [] }),
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'quiz-1' }) })

    expect(response.status).toBe(403)
    const body = await response.json()
    expect(body).toHaveProperty('error', 'Maximum attempts exceeded')
  })

  it('returns 200 with quiz results on successful submission', async () => {
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }

    mockPayload.findByID.mockResolvedValue({
      id: 'quiz-1',
      title: 'Test Quiz',
      passingScore: 70,
      maxAttempts: 3,
      questions: [
        {
          text: 'What is 2+2?',
          type: 'multiple-choice' as const,
          options: [
            { text: '4', isCorrect: true },
            { text: '5', isCorrect: false },
          ],
          points: 10,
        },
      ],
    })
    mockPayload.find.mockResolvedValue({ totalDocs: 0 })
    mockPayload.create.mockResolvedValue({ id: 'attempt-1' })

    const request = new NextRequest('http://localhost/api/quizzes/quiz-1/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: [{ questionIndex: 0, answer: '4' }],
      }),
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'quiz-1' }) })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')

    const body = await response.json()
    expect(body).toHaveProperty('score')
    expect(body).toHaveProperty('passed')
    expect(body).toHaveProperty('totalPoints')
  })
})
