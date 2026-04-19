import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST, generateCertificateNumber } from './route'

// ─── Mock types ────────────────────────────────────────────────────────────────

interface MockPayload {
  find: ReturnType<typeof vi.fn>
  findByID: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
}

function makeMockPayload(overrides: Partial<MockPayload> = {}): MockPayload {
  return {
    find: vi.fn(),
    findByID: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    ...overrides,
  }
}

// ─── Module-level mocks ────────────────────────────────────────────────────────

// Use a mutable ref so tests can inject per-test gradebook behavior.
// The ref is initialized lazily on first access in beforeEach.
let _gradebookResult: { courseId: string; overallGrade: number }[] = []
let _gradebookError: Error | null = null

vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(),
}))

// Mock PayloadGradebookService to delegate to our module-level refs
vi.mock('@/services/gradebook-payload', () => {
  return {
    PayloadGradebookService: vi.fn().mockImplementation(function () {
      return {
        getStudentGradebook: vi.fn().mockImplementation(async () => {
          if (_gradebookError) throw _gradebookError
          return _gradebookResult
        }),
      }
    }),
  }
})

vi.mock('@/auth/withAuth', () => ({
  withAuth: (handler: (req: NextRequest, ctx: { user?: unknown }) => Promise<Response>) =>
    (req: NextRequest) =>
      handler(req, { user: { id: 'auth-user-1', role: 'viewer' } }),
}))

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/certificates/generate', () => {
  let mockPayload: MockPayload
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let getPayloadInstance: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-19T12:00:00.000Z'))

    // Reset gradebook to default (no grades) for each test
    _gradebookResult = []
    _gradebookError = null

    mockPayload = makeMockPayload()
    const { getPayloadInstance: gp } = await import('@/services/progress')
    getPayloadInstance = gp as ReturnType<typeof vi.fn>
    getPayloadInstance.mockResolvedValue(mockPayload)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.resetModules()
  })

  // ── Input validation ──────────────────────────────────────────────────────

  describe('input validation', () => {
    it('returns 400 when body is not valid JSON', async () => {
      const req = new NextRequest('http://localhost/api/certificates/generate', {
        method: 'POST',
        body: 'not-json',
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.success).toBe(false)
      expect(body.error).toBe('Invalid JSON body')
    })

    it('returns 400 when studentId is missing', async () => {
      const req = new NextRequest('http://localhost/api/certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: 'course-1' }),
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.success).toBe(false)
      expect(body.error).toBe('studentId is required')
    })

    it('returns 400 when courseId is missing', async () => {
      const req = new NextRequest('http://localhost/api/certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: 'student-1' }),
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.success).toBe(false)
      expect(body.error).toBe('courseId is required')
    })
  })

  // ── Not enrolled ────────────────────────────────────────────────────────────

  describe('not enrolled (403)', () => {
    it('returns 403 when no enrollment exists for student and course', async () => {
      // First call: find enrollment → empty
      ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ docs: [] })

      const req = new NextRequest('http://localhost/api/certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: 'student-1', courseId: 'course-1' }),
      })

      const res = await POST(req)
      expect(res.status).toBe(403)
      const body = await res.json()
      expect(body.success).toBe(false)
      expect(body.error).toBe('Not enrolled')
    })
  })

  // ── Course not complete ─────────────────────────────────────────────────────

  describe('course not complete (400)', () => {
    it('returns 400 when not all lessons are completed', async () => {
      // First call: find enrollment → found
      ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        docs: [{ id: 'enroll-1', completedLessons: ['lesson-1'] }],
      })
      // Second call: find lessons for course
      ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        docs: [
          { id: 'lesson-1' },
          { id: 'lesson-2' },
        ],
      })

      const req = new NextRequest('http://localhost/api/certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: 'student-1', courseId: 'course-1' }),
      })

      const res = await POST(req)
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.success).toBe(false)
      expect(body.error).toBe('Course not complete')
    })
  })

  // ── Already exists ─────────────────────────────────────────────────────────

  describe('already exists (200 — idempotent)', () => {
    it('returns 200 with existing certificate when one already exists', async () => {
      const existingCert = {
        id: 'cert-existing',
        student: 'student-1',
        course: 'course-1',
        certificateNumber: 'CERT-COURSE1-ABC123',
        issuedAt: '2026-04-01T00:00:00.000Z',
      }

      // First call: find enrollment → found with all lessons completed
      ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        docs: [{ id: 'enroll-1', completedLessons: ['lesson-1'] }],
      })
      // Second call: find lessons for course
      ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        docs: [{ id: 'lesson-1' }],
      })
      // Third call: find existing certificate
      ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        docs: [existingCert],
      })

      const req = new NextRequest('http://localhost/api/certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: 'student-1', courseId: 'course-1' }),
      })

      const res = await POST(req)
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data).toEqual(existingCert)
    })
  })

  // ── Success ────────────────────────────────────────────────────────────────

  describe('success (201)', () => {
    it('creates a certificate and returns 201 when course is complete and no existing cert', async () => {
      const createdCert = {
        id: 'cert-new',
        student: 'student-1',
        course: 'course-1',
        certificateNumber: 'CERT-COURSE1-L0ABCDE',
        issuedAt: '2026-04-19T12:00:00.000Z',
      }

      // First call: find enrollment → found with all lessons completed
      ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        docs: [{ id: 'enroll-1', completedLessons: ['lesson-1'] }],
      })
      // Second call: find lessons for course
      ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        docs: [{ id: 'lesson-1' }],
      })
      // Third call: find existing certificate → none
      ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        docs: [],
      })
      // Fourth call: create certificate
      ;(mockPayload.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce(createdCert)

      const req = new NextRequest('http://localhost/api/certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: 'student-1', courseId: 'course-1' }),
      })

      const res = await POST(req)
      expect(res.status).toBe(201)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data).toEqual(createdCert)

      // Verify create was called with correct data
      expect(mockPayload.create).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'certificates',
          data: expect.objectContaining({
            student: 'student-1',
            course: 'course-1',
            certificateNumber: expect.stringMatching(/^CERT-COURSE1-[A-Z0-9]+$/),
            issuedAt: '2026-04-19T12:00:00.000Z',
          }),
        }),
      )
    })

    it('includes finalGrade from gradebook when available', async () => {
      // Inject gradebook result for this test
      _gradebookResult = [{ courseId: 'course-1', overallGrade: 87 }]

      // First call: find enrollment
      ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        docs: [{ id: 'enroll-1', completedLessons: ['lesson-1'] }],
      })
      // Second call: find lessons
      ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        docs: [{ id: 'lesson-1' }],
      })
      // Third call: find existing cert
      ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ docs: [] })
      // Fourth call: create (include finalGrade in returned cert)
      ;(mockPayload.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: 'cert-new',
        student: 'student-1',
        course: 'course-1',
        certificateNumber: 'CERT-COURSE1-XYZ',
        issuedAt: '2026-04-19T12:00:00.000Z',
        finalGrade: 87,
      })

      const req = new NextRequest('http://localhost/api/certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: 'student-1', courseId: 'course-1' }),
      })

      const res = await POST(req)
      expect(res.status).toBe(201)

      // Verify finalGrade was included in the create call
      expect(mockPayload.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ finalGrade: 87 }),
        }),
      )
    })

    it('omits finalGrade when gradebook lookup fails', async () => {
      // Inject gradebook error for this test
      _gradebookError = new Error('gradebook unavailable')

      // First call: find enrollment
      ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        docs: [{ id: 'enroll-1', completedLessons: ['lesson-1'] }],
      })
      // Second call: find lessons
      ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        docs: [{ id: 'lesson-1' }],
      })
      // Third call: find existing cert
      ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ docs: [] })
      // Fourth call: create
      ;(mockPayload.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: 'cert-new',
        student: 'student-1',
        course: 'course-1',
        certificateNumber: 'CERT-COURSE1-ABC',
        issuedAt: '2026-04-19T12:00:00.000Z',
      })

      const req = new NextRequest('http://localhost/api/certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: 'student-1', courseId: 'course-1' }),
      })

      const res = await POST(req)
      expect(res.status).toBe(201)

      // finalGrade should not be present in the create call data
      const createCall = (mockPayload.create as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(createCall.data).not.toHaveProperty('finalGrade')
    })
  })

  // ── generateCertificateNumber ───────────────────────────────────────────────

  describe('generateCertificateNumber', () => {
    it('returns a string starting with CERT-', () => {
      const num = generateCertificateNumber('course-abc')
      expect(num).toMatch(/^CERT-[A-Z0-9]+-[A-Z0-9]+$/)
    })

    it('uses an 8-char max prefix from the courseId', () => {
      const num = generateCertificateNumber('course-with-a-long-id')
      expect(num).toMatch(/^CERT-COURSEW[ILLEDID]+-[A-Z0-9]+$/)
    })

    it('returns consistent output for the same courseId at the same timestamp', () => {
      const num1 = generateCertificateNumber('course-1')
      const num2 = generateCertificateNumber('course-1')
      expect(num1).toBe(num2)
    })
  })
})
