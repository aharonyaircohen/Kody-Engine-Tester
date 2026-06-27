import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

// Mock getPayloadInstance
const mockPayload = {
  find: vi.fn(),
  findByID: vi.fn(),
  create: vi.fn(),
}

vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(() => mockPayload),
}))

// Mock withAuth to bypass authentication
vi.mock('@/auth/withAuth', () => ({
  withAuth: (handler: (req: NextRequest, context: { user?: { id: string; role: string } }) => Promise<Response>) => {
    return async (req: NextRequest) => {
      // Simulate authenticated user based on test needs
      const user = (global as { testUser?: { id: string; role: string } }).testUser
      return handler(req, { user })
    }
  },
}))

describe('POST /api/enroll', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('authentication', () => {
    it('returns 401 when user is not authenticated', async () => {
      // Clear test user
      ;(global as { testUser?: null }).testUser = null

      const request = new NextRequest('http://localhost/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: 'course-1' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(401)
    })
  })

  describe('authorization', () => {
    it('returns 403 when user is not a viewer or admin', async () => {
      ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'guest' }

      const request = new NextRequest('http://localhost/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: 'course-1' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(403)
    })

    it('allows viewer role to enroll', async () => {
      ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }

      mockPayload.find.mockResolvedValue({ docs: [] })
      mockPayload.findByID.mockResolvedValue({ id: 'course-1', maxEnrollments: 100 })
      mockPayload.create.mockResolvedValue({
        id: 'enrollment-1',
        student: 'user-1',
        course: 'course-1',
        status: 'active',
      })

      const request = new NextRequest('http://localhost/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: 'course-1' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(201)
    })

    it('allows admin role to enroll', async () => {
      ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'admin' }

      mockPayload.find.mockResolvedValue({ docs: [] })
      mockPayload.findByID.mockResolvedValue({ id: 'course-1', maxEnrollments: 100 })
      mockPayload.create.mockResolvedValue({
        id: 'enrollment-1',
        student: 'user-1',
        course: 'course-1',
        status: 'active',
      })

      const request = new NextRequest('http://localhost/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: 'course-1' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(201)
    })
  })

  describe('validation', () => {
    beforeEach(() => {
      ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }
    })

    it('returns 400 when courseId is missing', async () => {
      const request = new NextRequest('http://localhost/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body).toEqual({ error: 'courseId is required' })
    })
  })

  describe('enrollment logic', () => {
    beforeEach(() => {
      ;(global as { testUser?: { id: string; role: string } }).testUser = { id: 'user-1', role: 'viewer' }
    })

    it('returns 409 when already enrolled', async () => {
      mockPayload.find.mockResolvedValue({ docs: [{ id: 'existing-enrollment' }] })

      const request = new NextRequest('http://localhost/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: 'course-1' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(409)
      const body = await response.json()
      expect(body).toEqual({ error: 'Already enrolled in this course' })
    })

    it('returns 403 when course is full', async () => {
      mockPayload.find.mockResolvedValue({ docs: [] })
      mockPayload.findByID.mockResolvedValue({ id: 'course-1', maxEnrollments: 1 })
      // Simulate one active enrollment
      mockPayload.find.mockResolvedValueOnce({ docs: [] }) // no existing enrollment
      mockPayload.find.mockResolvedValueOnce({ totalDocs: 1 }) // one active enrollment

      const request = new NextRequest('http://localhost/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: 'course-1' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(403)
      const body = await response.json()
      expect(body).toEqual({ error: 'Course has reached maximum enrollment capacity' })
    })

    it('creates enrollment successfully', async () => {
      mockPayload.find.mockResolvedValue({ docs: [] })
      mockPayload.findByID.mockResolvedValue({ id: 'course-1', maxEnrollments: 100 })
      mockPayload.create.mockResolvedValue({
        id: 'enrollment-1',
        student: 'user-1',
        course: 'course-1',
        status: 'active',
        enrolledAt: '2026-04-05T12:00:00.000Z',
        completedLessons: [],
      })

      const request = new NextRequest('http://localhost/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: 'course-1' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(201)
      const body = await response.json()
      expect(body).toHaveProperty('id', 'enrollment-1')
      expect(body).toHaveProperty('student', 'user-1')
      expect(body).toHaveProperty('course', 'course-1')
      expect(body).toHaveProperty('status', 'active')
    })
  })
})
