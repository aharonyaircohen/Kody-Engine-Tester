import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Mock withAuth so we can inject a fake user
vi.mock('@/auth/withAuth', () => ({
  withAuth: (handler: (req: NextRequest, ctx: { user?: object }, routeParams?: unknown) => Promise<Response>) => {
    return async (req: NextRequest, routeParams?: unknown) => {
      const fakeUser = { id: 'student-1', email: 'student@test.com', role: 'viewer' as const, isActive: true }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return handler(req, { user: fakeUser } as any, routeParams)
    }
  },
}))

// Mock getPayloadInstance
const mockPayload = {
  findByID: vi.fn(),
  find: vi.fn(),
  create: vi.fn(),
}

vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(() => Promise.resolve(mockPayload)),
}))

// Import after mocks are set up
const { POST } = await import('./route')

const makeRequest = (body: object, id = 'assignment-123') => {
  return new NextRequest(`http://localhost/api/assignments/${id}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const routeParams = { params: Promise.resolve({ id: 'assignment-123' }) }

describe('POST /api/assignments/[id]/submit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 404 when assignment is not found', async () => {
    mockPayload.findByID.mockResolvedValue(null)

    const request = makeRequest({ studentId: 'student-1', content: {} })
    const response = await POST(request, routeParams)

    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body).toEqual({ success: false, error: 'Assignment not found' })
  })

  it('returns 400 when assignment is past due', async () => {
    mockPayload.findByID.mockResolvedValue({
      id: 'assignment-123',
      title: 'Past Due Assignment',
      dueDate: '2020-01-01',
    })

    const request = makeRequest({ studentId: 'student-1', content: {} })
    const response = await POST(request, routeParams)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toEqual({ success: false, error: 'Assignment past due' })
  })

  it('returns 409 when a submission already exists for the same assignment and student', async () => {
    mockPayload.findByID.mockResolvedValue({
      id: 'assignment-123',
      title: 'Valid Assignment',
      dueDate: '2099-12-31',
    })
    mockPayload.find.mockResolvedValue({ totalDocs: 1, docs: [{ id: 'existing-sub' }] })

    const request = makeRequest({ studentId: 'student-1', content: {} })
    const response = await POST(request, routeParams)

    expect(response.status).toBe(409)
    const body = await response.json()
    expect(body).toEqual({ success: false, error: 'Already submitted' })
  })

  it('returns 201 with submission data on happy path', async () => {
    const mockSubmission = {
      id: 'submission-456',
      assignment: 'assignment-123',
      student: 'student-1',
      content: { root: [] },
      attachments: [],
      submittedAt: '2026-04-19T00:00:00.000Z',
      status: 'submitted',
    }

    mockPayload.findByID.mockResolvedValue({
      id: 'assignment-123',
      title: 'Valid Assignment',
      dueDate: '2099-12-31',
    })
    mockPayload.find.mockResolvedValue({ totalDocs: 0, docs: [] })
    mockPayload.create.mockResolvedValue(mockSubmission)

    const request = makeRequest({
      studentId: 'student-1',
      content: { root: [] },
      attachmentIds: ['media-1', 'media-2'],
    })
    const response = await POST(request, routeParams)

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body).toEqual({ success: true, data: mockSubmission })

    expect(mockPayload.create).toHaveBeenCalledWith({
      collection: 'submissions',
      data: {
        assignment: 'assignment-123',
        student: 'student-1',
        content: { root: [] },
        attachments: [{ file: 'media-1' }, { file: 'media-2' }],
        submittedAt: expect.any(Date),
        status: 'submitted',
      },
    })
  })

  it('returns 201 when no attachmentIds provided', async () => {
    const mockSubmission = {
      id: 'submission-789',
      assignment: 'assignment-123',
      student: 'student-1',
      content: { root: [] },
      attachments: [],
      status: 'submitted',
    }

    mockPayload.findByID.mockResolvedValue({
      id: 'assignment-123',
      title: 'Valid Assignment',
      dueDate: '2099-12-31',
    })
    mockPayload.find.mockResolvedValue({ totalDocs: 0, docs: [] })
    mockPayload.create.mockResolvedValue(mockSubmission)

    const request = makeRequest({ studentId: 'student-1', content: { root: [] } })
    const response = await POST(request, routeParams)

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data).toEqual(mockSubmission)

    expect(mockPayload.create).toHaveBeenCalledWith({
      collection: 'submissions',
      data: expect.objectContaining({
        assignment: 'assignment-123',
        student: 'student-1',
        attachments: [],
      }),
    })
  })
})
