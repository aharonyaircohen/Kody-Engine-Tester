import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock Payload before importing the route module
const mockFindByID = vi.fn()
const mockFind = vi.fn()
const mockCreate = vi.fn()
vi.mock('payload', () => ({
  getPayload: vi.fn(() => ({
    findByID: mockFindByID,
    find: mockFind,
    create: mockCreate,
  })),
}))

vi.mock('@payload-config', () => ({
  default: Promise.resolve({}),
}))

// Import the handler after mocking so the module uses our mocks
import { handleSubmit } from './route'

describe('POST /api/assignments/[id]/submit', () => {
  const mockUser = { id: 'student-1', role: 'viewer' as const, email: 'student@test.com', isActive: true }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const makeRequest = (body: object) => {
    return new NextRequest('http://localhost/api/assignments/assign-1/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token',
      },
      body: JSON.stringify(body),
    })
  }

  const defaultAssignment = {
    id: 'assign-1',
    title: 'Essay Assignment',
    dueDate: '2099-12-31T23:59:59.000Z',
    maxScore: 100,
  }

  // --- 404: Assignment not found ---
  it('returns 404 when assignment does not exist', async () => {
    mockFindByID.mockResolvedValue(null)

    const response = await handleSubmit(
      makeRequest({ studentId: 'student-1', content: {} }),
      { user: mockUser },
      { params: Promise.resolve({ id: 'assign-1' }) },
    )

    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body).toEqual({ success: false, error: 'Assignment not found' })
  })

  // --- 400: Assignment past due ---
  it('returns 400 when assignment dueDate has passed', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))
    mockFindByID.mockResolvedValue({ ...defaultAssignment, dueDate: '2025-01-01T12:00:00Z' })

    const response = await handleSubmit(
      makeRequest({ studentId: 'student-1', content: {} }),
      { user: mockUser },
      { params: Promise.resolve({ id: 'assign-1' }) },
    )

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toEqual({ success: false, error: 'Assignment past due' })
  })

  // --- 409: Duplicate submission ---
  it('returns 409 when a submission already exists for the same assignment and student', async () => {
    mockFindByID.mockResolvedValue(defaultAssignment)
    mockFind.mockResolvedValue({ docs: [{ id: 'existing-sub' }], totalDocs: 1 })

    const response = await handleSubmit(
      makeRequest({ studentId: 'student-1', content: {} }),
      { user: mockUser },
      { params: Promise.resolve({ id: 'assign-1' }) },
    )

    expect(response.status).toBe(409)
    const body = await response.json()
    expect(body).toEqual({ success: false, error: 'Already submitted' })
  })

  // --- 201: Successful submission ---
  it('returns 201 with the created submission on success', async () => {
    const now = '2026-04-19T12:00:00.000Z'
    vi.useFakeTimers()
    vi.setSystemTime(new Date(now))
    const createdDoc = {
      id: 'new-sub',
      assignment: 'assign-1',
      student: 'student-1',
      content: { richText: 'my answer' },
      attachments: [],
      submittedAt: now,
      status: 'submitted',
    }

    mockFindByID.mockResolvedValue(defaultAssignment)
    mockFind.mockResolvedValue({ docs: [], totalDocs: 0 })
    mockCreate.mockResolvedValue(createdDoc)

    const response = await handleSubmit(
      makeRequest({ studentId: 'student-1', content: { richText: 'my answer' }, attachmentIds: [] }),
      { user: mockUser },
      { params: Promise.resolve({ id: 'assign-1' }) },
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body).toEqual({ success: true, data: createdDoc })

    expect(mockCreate).toHaveBeenCalledWith({
      collection: 'submissions',
      data: expect.objectContaining({
        assignment: 'assign-1',
        student: 'student-1',
        content: { richText: 'my answer' },
        attachments: [],
        submittedAt: now,
        status: 'submitted',
      }),
    })
  })

  // --- 400: Missing required fields ---
  it('returns 400 when studentId or content is missing', async () => {
    mockFindByID.mockResolvedValue(defaultAssignment)

    const noStudent = await handleSubmit(
      makeRequest({ content: {} }),
      { user: mockUser },
      { params: Promise.resolve({ id: 'assign-1' }) },
    )
    expect(noStudent.status).toBe(400)

    const noContent = await handleSubmit(
      makeRequest({ studentId: 'student-1' }),
      { user: mockUser },
      { params: Promise.resolve({ id: 'assign-1' }) },
    )
    expect(noContent.status).toBe(400)
  })

  // --- 400: Invalid JSON body ---
  it('returns 400 when the request body is not valid JSON', async () => {
    const badReq = new NextRequest('http://localhost/api/assignments/assign-1/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token',
      },
      body: 'not-json',
    })

    const response = await handleSubmit(
      badReq,
      { user: mockUser },
      { params: Promise.resolve({ id: 'assign-1' }) },
    )

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toEqual({ success: false, error: 'Invalid JSON body' })
  })
})
