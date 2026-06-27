import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

// Mock getPayloadInstance
const mockPayload = {
  find: vi.fn(),
  findByID: vi.fn(),
}

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

// Mock withAuth - properly handles roles
vi.mock('@/auth/withAuth', () => ({
  withAuth: (handler: (req: NextRequest, context: { user?: { id: string; role: string } }, routeParams?: { params: Promise<{ id: string }> }) => Promise<Response>, options?: { roles?: string[] }) => {
    return async (req: NextRequest, routeParams?: { params: Promise<{ id: string }> }) => {
      const user = (global as { testUser?: { id: string; role: string } }).testUser

      // Check roles if specified
      if (options?.roles && user) {
        const allowedRoles = options.roles
        if (!allowedRoles.includes(user.role)) {
          return Response.json({ error: 'Forbidden' }, { status: 403 })
        }
      }

      const params = routeParams?.params
      return handler(req, { user }, { params })
    }
  },
}))

describe('GET /api/gradebook/course/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when id parameter is missing', async () => {
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'editor-1', role: 'editor' }

    const request = new NextRequest('http://localhost/api/gradebook/course/')
    const response = await GET(request, undefined as unknown as { params: Promise<{ id: string }> })

    expect(response.status).toBe(400)
  })

  it('returns 404 when course is not found', async () => {
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'editor-1', role: 'editor' }
    mockPayload.findByID.mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/gradebook/course/nonexistent')
    const response = await GET(request, { params: Promise.resolve({ id: 'nonexistent' }) })

    expect(response.status).toBe(404)
  })

  it('returns 403 when user is not the course editor or admin', async () => {
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'other-editor', role: 'editor' }
    mockPayload.findByID.mockResolvedValue({
      id: 'course-1',
      instructor: { id: 'editor-1' },
    })

    const request = new NextRequest('http://localhost/api/gradebook/course/course-1')
    const response = await GET(request, { params: Promise.resolve({ id: 'course-1' }) })

    expect(response.status).toBe(403)
  })

  it('allows admin to access any course gradebook', async () => {
    mockGetCourseGradebook.mockResolvedValue({
      courseId: 'course-1',
      students: [],
    })
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'admin-1', role: 'admin' }
    mockPayload.findByID.mockResolvedValue({
      id: 'course-1',
      instructor: { id: 'editor-1' },
    })

    const request = new NextRequest('http://localhost/api/gradebook/course/course-1')
    const response = await GET(request, { params: Promise.resolve({ id: 'course-1' }) })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('courseId', 'course-1')
  })

  it('allows course editor to access their course gradebook', async () => {
    mockGetCourseGradebook.mockResolvedValue({
      courseId: 'course-1',
      students: [{ studentId: 'student-1', grade: 90 }],
    })
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'editor-1', role: 'editor' }
    mockPayload.findByID.mockResolvedValue({
      id: 'course-1',
      instructor: { id: 'editor-1' },
    })

    const request = new NextRequest('http://localhost/api/gradebook/course/course-1')
    const response = await GET(request, { params: Promise.resolve({ id: 'course-1' }) })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('courseId', 'course-1')
    expect(body).toHaveProperty('students')
  })

  it('handles string instructor ID', async () => {
    mockGetCourseGradebook.mockResolvedValue({
      courseId: 'course-1',
      students: [],
    })
    ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'editor-1', role: 'editor' }
    mockPayload.findByID.mockResolvedValue({
      id: 'course-1',
      instructor: 'editor-1', // String instructor ID
    })

    const request = new NextRequest('http://localhost/api/gradebook/course/course-1')
    const response = await GET(request, { params: Promise.resolve({ id: 'course-1' }) })

    expect(response.status).toBe(200)
  })
})
