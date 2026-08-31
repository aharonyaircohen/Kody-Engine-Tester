import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

// Mock getPayloadInstance
const mockPayload = {
  find: vi.fn(),
  findByID: vi.fn(),
}

// Mock PayloadGradebookService - use mockReturnValue to control behavior
const mockGetStudentGradebook = vi.fn()
const mockGetCourseGradebook = vi.fn()

vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(() => mockPayload),
}))

vi.mock('@/services/gradebook-payload', () => ({
  PayloadGradebookService: vi.fn().mockImplementation(function() {
    return {
      getStudentGradebook: mockGetStudentGradebook,
      getCourseGradebook: mockGetCourseGradebook,
    }
  }),
}))

// Mock withAuth
vi.mock('@/auth/withAuth', () => ({
  withAuth: (handler: (req: NextRequest, context: { user?: { id: string; role: string } }) => Promise<Response>) => {
    return async (req: NextRequest) => {
      const user = (global as { testUser?: { id: string; role: string } }).testUser
      return handler(req, { user })
    }
  },
}))

describe('GET /api/gradebook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when user is not authenticated', async () => {
    ;(global as { testUser?: null }).testUser = null

    const request = new NextRequest('http://localhost/api/gradebook')
    const response = await GET(request)

    expect(response.status).toBe(401)
  })

  it('returns 200 with gradebook data for authenticated viewer', async () => {
    mockGetStudentGradebook.mockResolvedValue({
      courses: [],
      overallGrade: null,
    })
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }

    const request = new NextRequest('http://localhost/api/gradebook')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')

    const body = await response.json()
    expect(body).toHaveProperty('courses')
    expect(body).toHaveProperty('overallGrade')
  })

  it('returns 200 with gradebook data for admin', async () => {
    mockGetStudentGradebook.mockResolvedValue({
      courses: [{ courseId: 'course-1', grade: 85 }],
      overallGrade: 85,
    })
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'admin-1', role: 'admin' }

    const request = new NextRequest('http://localhost/api/gradebook')
    const response = await GET(request)

    expect(response.status).toBe(200)
  })

  it('returns 200 with gradebook data for editor', async () => {
    mockGetStudentGradebook.mockResolvedValue({
      courses: [],
      overallGrade: null,
    })
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'editor-1', role: 'editor' }

    const request = new NextRequest('http://localhost/api/gradebook')
    const response = await GET(request)

    expect(response.status).toBe(200)
  })
})
