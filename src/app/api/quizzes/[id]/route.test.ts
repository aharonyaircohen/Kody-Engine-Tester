import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

// Mock Payload
const mockPayload = {
  findByID: vi.fn(),
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

describe('GET /api/quizzes/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when id parameter is missing', async () => {
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }

    const request = new NextRequest('http://localhost/api/quizzes/')
    const response = await GET(request, undefined as unknown as { params: Promise<{ id: string }> })

    expect(response.status).toBe(400)
  })

  it('returns 404 when quiz is not found', async () => {
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }
    mockPayload.findByID.mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/quizzes/nonexistent')
    const response = await GET(request, { params: Promise.resolve({ id: 'nonexistent' }) })

    expect(response.status).toBe(404)
  })

  it('returns quiz metadata and questions', async () => {
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }

    mockPayload.findByID.mockResolvedValue({
      id: 'quiz-1',
      title: 'Test Quiz',
      module: 'module-1',
      order: 1,
      passingScore: 70,
      timeLimit: 3600,
      maxAttempts: 3,
      questions: [
        {
          text: 'Question 1',
          type: 'multiple-choice',
          options: [
            { text: 'A', isCorrect: true },
            { text: 'B', isCorrect: false },
          ],
        },
      ],
    })

    const request = new NextRequest('http://localhost/api/quizzes/quiz-1')
    const response = await GET(request, { params: Promise.resolve({ id: 'quiz-1' }) })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')

    const body = await response.json()
    expect(body).toHaveProperty('id', 'quiz-1')
    expect(body).toHaveProperty('title', 'Test Quiz')
    expect(body).toHaveProperty('passingScore', 70)
    expect(body).toHaveProperty('questions')
    expect(body.questions.length).toBe(1)
    // Should not reveal correct answers
    expect(body.questions[0]).not.toHaveProperty('isCorrect')
  })

  it('hides correct answers from questions', async () => {
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }

    mockPayload.findByID.mockResolvedValue({
      id: 'quiz-1',
      title: 'Secret Quiz',
      questions: [
        {
          text: 'What is 2+2?',
          type: 'multiple-choice',
          options: [
            { text: '4', isCorrect: true },
            { text: '5', isCorrect: false },
          ],
          correctAnswer: '4',
          points: 10,
        },
      ],
    })

    const request = new NextRequest('http://localhost/api/quizzes/quiz-1')
    const response = await GET(request, { params: Promise.resolve({ id: 'quiz-1' }) })

    expect(response.status).toBe(200)
    const body = await response.json()

    expect(body.questions[0]).not.toHaveProperty('isCorrect')
    expect(body.questions[0]).not.toHaveProperty('correctAnswer')
  })
})
