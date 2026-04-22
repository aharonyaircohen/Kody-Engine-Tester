import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'
import { RecommendationService } from '@/services/recommendations'
import type { Payload } from 'payload'

// ---------------------------------------------------------------------------
// Mock state
// ---------------------------------------------------------------------------

// Mutable ref so tests can override auth outcome per-call
let mockAuthOutcome: { user?: { id: string; role: string }; error?: string } = {}

function setMockAuth(user: { id: string; role: string } | null) {
  mockAuthOutcome = user === null ? { error: 'Unauthorized' } : { user: user ?? undefined }
}

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/auth/withAuth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/auth/withAuth')>()
  return {
    ...actual,
    withAuth: (
      handler: (
        req: NextRequest,
        ctx: { user?: { id: string; role: string }; error?: string },
        routeParams?: unknown,
      ) => Promise<Response>,
    ) =>
      (req: NextRequest, routeParams?: unknown) => {
        if (mockAuthOutcome.error) {
          return Response.json({ error: mockAuthOutcome.error }, { status: 401 })
        }
        return handler(req, mockAuthOutcome as { user?: { id: string; role: string } }, routeParams)
      },
  }
})

vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(),
}))

vi.mock('@/services/recommendations', () => ({
  RecommendationService: vi.fn(),
}))

let mockUserContext: { user?: { id: string; role: string } } = {}
let mockPayloadFind: ReturnType<typeof vi.fn>
let mockServiceRecommend: ReturnType<typeof vi.fn>

const MOCK_RESULT = {
  items: [
    {
      course: { id: 'c1', title: 'TypeScript Mastery', status: 'published' },
      score: 0.75,
      reasons: ['shared-tag:typescript', 'popular-among-cohort'],
    },
  ],
  userId: 'user-1',
  generatedAt: '2026-04-22T12:00:00.000Z',
}

function createMockPayload() {
  mockPayloadFind = vi.fn()
  return { find: mockPayloadFind } as unknown as Payload
}

function createMockService() {
  mockServiceRecommend = vi.fn()
  return class MockRecommendationService {
    constructor() {}
    recommend = mockServiceRecommend
  }
}

beforeEach(async () => {
  vi.clearAllMocks()
  mockUserContext = {}

  const { getPayloadInstance } = await import('@/services/progress')
  ;(getPayloadInstance as ReturnType<typeof vi.fn>).mockResolvedValue(createMockPayload())

  const module = await import('@/services/recommendations')
  ;(module.RecommendationService as ReturnType<typeof vi.fn>).mockImplementation(createMockService())
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function makeRequest(url: string, user?: { id: string; role: string }) {
  setMockAuth(user ?? { id: 'user-1', role: 'viewer' })
  return new NextRequest(`http://localhost${url}`)
}

// ---------------------------------------------------------------------------
// Happy path
// ---------------------------------------------------------------------------

describe('GET /api/courses/recommendations — happy path', () => {
  it('returns 200 with valid RecommendationResult for own userId', async () => {
    mockServiceRecommend.mockResolvedValue(MOCK_RESULT)

    const req = makeRequest('/api/courses/recommendations?userId=user-1', { id: 'user-1', role: 'viewer' })
    const res = await GET(req)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('items')
    expect(body).toHaveProperty('userId')
    expect(body).toHaveProperty('generatedAt')
    expect(Array.isArray(body.items)).toBe(true)
  })

  it('returns 200 with expected shape and course data', async () => {
    mockServiceRecommend.mockResolvedValue(MOCK_RESULT)

    const req = makeRequest('/api/courses/recommendations?userId=user-1&limit=5&excludeCompleted=true', { id: 'user-1', role: 'viewer' })
    const res = await GET(req)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.items[0]).toHaveProperty('course')
    expect(body.items[0]).toHaveProperty('score')
    expect(body.items[0]).toHaveProperty('reasons')
    expect(typeof body.items[0].score).toBe('number')
    expect(body.items[0].score).toBeGreaterThanOrEqual(0)
    expect(body.items[0].score).toBeLessThanOrEqual(1)
  })

  it('calls RecommendationService with correct args', async () => {
    mockServiceRecommend.mockResolvedValue({ items: [], userId: 'user-1', generatedAt: new Date().toISOString() })

    const req = makeRequest('/api/courses/recommendations?userId=user-1&limit=10&excludeCompleted=false', { id: 'user-1', role: 'viewer' })
    await GET(req)

    expect(mockServiceRecommend).toHaveBeenCalledWith({
      userId: 'user-1',
      limit: 10,
      excludeCompleted: false,
    })
  })

  it('admin role can request recommendations for any userId', async () => {
    mockServiceRecommend.mockResolvedValue(MOCK_RESULT)

    const req = makeRequest('/api/courses/recommendations?userId=other-user', { id: 'admin-1', role: 'admin' })
    const res = await GET(req)

    expect(res.status).toBe(200)
  })

  it('editor role can request recommendations for any userId', async () => {
    mockServiceRecommend.mockResolvedValue(MOCK_RESULT)

    const req = makeRequest('/api/courses/recommendations?userId=other-user', { id: 'editor-1', role: 'editor' })
    const res = await GET(req)

    expect(res.status).toBe(200)
  })
})

// ---------------------------------------------------------------------------
// Validation failures
// ---------------------------------------------------------------------------

describe('GET /api/courses/recommendations — 400 validation', () => {
  it('returns 400 when userId is empty', async () => {
    const req = makeRequest('/api/courses/recommendations?userId=', { id: 'user-1', role: 'viewer' })
    const res = await GET(req)

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toHaveProperty('error')
    expect(body.error).toContain('userId')
  })

  it('returns 400 when userId is missing entirely', async () => {
    const req = makeRequest('/api/courses/recommendations?', { id: 'user-1', role: 'viewer' })
    const res = await GET(req)

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toHaveProperty('error')
  })

  it('returns 400 when limit exceeds 20', async () => {
    const req = makeRequest('/api/courses/recommendations?userId=user-1&limit=99', { id: 'user-1', role: 'viewer' })
    const res = await GET(req)

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toHaveProperty('error')
    expect(body.error).toContain('limit')
  })

  it('returns 400 when limit is zero', async () => {
    const req = makeRequest('/api/courses/recommendations?userId=user-1&limit=0', { id: 'user-1', role: 'viewer' })
    const res = await GET(req)

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toHaveProperty('error')
  })

  it('returns 400 when limit is negative', async () => {
    const req = makeRequest('/api/courses/recommendations?userId=user-1&limit=-5', { id: 'user-1', role: 'viewer' })
    const res = await GET(req)

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toHaveProperty('error')
  })
})

// ---------------------------------------------------------------------------
// Auth failures
// ---------------------------------------------------------------------------

describe('GET /api/courses/recommendations — auth / authz', () => {
  it('returns 401 when no user in context (no auth session)', async () => {
    setMockAuth(null)

    const req = new NextRequest('http://localhost/api/courses/recommendations?userId=user-1')
    const res = await GET(req)

    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body).toHaveProperty('error')
  })

  it('returns 403 when viewer tries to access another user\'s recommendations', async () => {
    const req = makeRequest('/api/courses/recommendations?userId=other-user', { id: 'viewer-1', role: 'viewer' })
    const res = await GET(req)

    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body).toHaveProperty('error')
    expect(body.error).toContain('Forbidden')
  })
})

// ---------------------------------------------------------------------------
// Error sanitization
// ---------------------------------------------------------------------------

describe('GET /api/courses/recommendations — error sanitization', () => {
  it('error response does not leak stack traces', async () => {
    mockServiceRecommend.mockRejectedValue(new Error('DB connection failed: host=localhost port=5432'))

    const req = makeRequest('/api/courses/recommendations?userId=user-1', { id: 'user-1', role: 'viewer' })
    const res = await GET(req)

    const text = await res.text()
    expect(text).not.toMatch(/stack|at |localhost|5432/i)
    expect(text).toMatch(/"error"/)
  })

  it('service throws non-Error value; error response is still sanitized', async () => {
    mockServiceRecommend.mockRejectedValue('string error not an Error')

    const req = makeRequest('/api/courses/recommendations?userId=user-1', { id: 'user-1', role: 'viewer' })
    const res = await GET(req)

    const text = await res.text()
    expect(res.status).toBe(500)
    expect(text).not.toMatch(/stack|at /i)
    expect(text).toMatch(/"error"/)
  })
})
