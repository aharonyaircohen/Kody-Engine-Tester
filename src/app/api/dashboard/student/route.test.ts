import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

// Mock payload instance
const mockPayload = {
  find: vi.fn(),
  findByID: vi.fn(),
}

// Mock the progress service's getPayloadInstance
vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(() => Promise.resolve(mockPayload)),
}))

// Mock withAuth to inject a test user or reject unauthenticated
let mockUser: { id: number; role: string } | null = null

vi.mock('@/auth/withAuth', () => ({
  withAuth:
    (
      handler: (
        req: NextRequest,
        context: { user?: { id: number; role: string } }
      ) => Promise<Response>
    ) =>
    async (req: NextRequest) => {
      if (!mockUser) {
        return Response.json({ error: 'Authentication required' }, { status: 401 })
      }
      return handler(req, { user: mockUser })
    },
}))

describe('GET /api/dashboard/student', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = { id: 1, role: 'viewer' }
  })

  it('returns 401 when not authenticated', async () => {
    mockUser = null
    const request = new NextRequest('http://localhost/api/dashboard/student')
    const response = await GET(request)
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body).toHaveProperty('error', 'Authentication required')
  })

  it('returns 200 with empty enrollments when user has no enrollments', async () => {
    mockPayload.find.mockResolvedValueOnce({ docs: [] }) // enrollments
    mockPayload.find.mockResolvedValueOnce({ docs: [], totalDocs: 0 }) // certificates

    const request = new NextRequest('http://localhost/api/dashboard/student')
    const response = await GET(request)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('success', true)
    expect(body.data.enrollments).toEqual([])
    expect(body.data.totals).toEqual({
      coursesEnrolled: 0,
      coursesCompleted: 0,
      certificatesEarned: 0,
    })
  })

  it('returns 200 with enrollment progress for happy path', async () => {
    // Use mockImplementation for deterministic per-call matching
    mockPayload.find.mockImplementation((args: { collection: string }) => {
      if (args.collection === 'enrollments') {
        return Promise.resolve({
          docs: [
            {
              id: 'enroll1',
              student: '1',
              course: { id: 'course1' },
              enrolledAt: '2026-04-01T10:00:00.000Z',
              status: 'active',
              completedLessons: ['lesson1', 'lesson2'],
            },
          ],
        })
      }
      if (args.collection === 'certificates') {
        return Promise.resolve({ docs: [], totalDocs: 0 })
      }
      if (args.collection === 'lessons') {
        return Promise.resolve({ totalDocs: 4 })
      }
      return Promise.reject(new Error('unexpected collection'))
    })

    mockPayload.findByID.mockResolvedValue({ id: 'course1', title: 'Intro to TypeScript' })

    const request = new NextRequest('http://localhost/api/dashboard/student')
    const response = await GET(request)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('success', true)
    expect(body.data.enrollments).toHaveLength(1)
    expect(body.data.enrollments[0]).toMatchObject({
      courseId: 'course1',
      courseTitle: 'Intro to TypeScript',
      progressPercent: 50,
      lastAccessedAt: '2026-04-01T10:00:00.000Z',
    })
    expect(body.data.totals).toEqual({
      coursesEnrolled: 1,
      coursesCompleted: 0,
      certificatesEarned: 0,
    })
  })

  it('returns progressPercent=100 when all lessons completed', async () => {
    mockPayload.find.mockImplementation((args: { collection: string }) => {
      if (args.collection === 'enrollments') {
        return Promise.resolve({
          docs: [
            {
              id: 'enroll2',
              student: '1',
              course: { id: 'course2' },
              enrolledAt: '2026-03-15T08:00:00.000Z',
              status: 'active',
              completedLessons: ['l1', 'l2', 'l3', 'l4', 'l5'],
            },
          ],
        })
      }
      if (args.collection === 'certificates') {
        return Promise.resolve({ docs: [], totalDocs: 0 })
      }
      if (args.collection === 'lessons') {
        return Promise.resolve({ totalDocs: 5 })
      }
      return Promise.reject(new Error('unexpected collection'))
    })

    mockPayload.findByID.mockResolvedValue({ id: 'course2', title: 'Advanced Patterns' })

    const request = new NextRequest('http://localhost/api/dashboard/student')
    const response = await GET(request)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.enrollments[0].progressPercent).toBe(100)
    expect(body.data.totals.coursesCompleted).toBe(0) // status is 'active', not 'completed'
  })

  it('returns coursesCompleted when enrollment status is completed', async () => {
    mockPayload.find.mockImplementation((args: { collection: string }) => {
      if (args.collection === 'enrollments') {
        return Promise.resolve({
          docs: [
            {
              id: 'enroll3',
              student: '1',
              course: { id: 'course3' },
              enrolledAt: '2026-02-01T09:00:00.000Z',
              status: 'completed',
              completedLessons: ['l1', 'l2'],
            },
          ],
        })
      }
      if (args.collection === 'certificates') {
        return Promise.resolve({ docs: [], totalDocs: 0 })
      }
      if (args.collection === 'lessons') {
        return Promise.resolve({ totalDocs: 2 })
      }
      return Promise.reject(new Error('unexpected collection'))
    })

    mockPayload.findByID.mockResolvedValue({ id: 'course3', title: 'Completed Course' })

    const request = new NextRequest('http://localhost/api/dashboard/student')
    const response = await GET(request)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.enrollments[0].progressPercent).toBe(100)
    expect(body.data.totals.coursesCompleted).toBe(1)
    expect(body.data.totals.coursesEnrolled).toBe(1)
  })

  it('counts certificatesEarned from certificates collection', async () => {
    mockPayload.find.mockImplementation((args: { collection: string }) => {
      if (args.collection === 'enrollments') {
        return Promise.resolve({ docs: [] })
      }
      if (args.collection === 'certificates') {
        return Promise.resolve({ docs: [{ id: 'cert1' }, { id: 'cert2' }], totalDocs: 2 })
      }
      return Promise.reject(new Error('unexpected collection'))
    })

    const request = new NextRequest('http://localhost/api/dashboard/student')
    const response = await GET(request)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.totals.certificatesEarned).toBe(2)
  })
})
