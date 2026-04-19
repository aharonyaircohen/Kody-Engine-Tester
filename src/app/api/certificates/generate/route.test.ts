import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { handleGenerateCertificate } from './route'

// ── Mock user injected via context ───────────────────────────────────────────
const mockUser = {
  id: 'user-123',
  email: 'student@example.com',
  role: 'viewer' as const,
  isActive: true,
}

// ── Mock payload factory ─────────────────────────────────────────────────────
function makeMockPayload(overrides: Partial<{
  enrollment: object[]
  lessons: object[]
  certificates: object[]
}> = {}) {
  const {
    enrollment = [],
    lessons = [],
    certificates = [],
  } = overrides

  return {
    find: vi.fn(async (opts: { collection: string; where?: object; limit?: number; depth?: number }) => {
      if (opts.collection === 'enrollments') {
        return { docs: enrollment, totalDocs: enrollment.length }
      }
      if (opts.collection === 'lessons') {
        return { docs: lessons, totalDocs: lessons.length }
      }
      if (opts.collection === 'certificates') {
        return { docs: certificates, totalDocs: certificates.length }
      }
      return { docs: [] }
    }),
    create: vi.fn(async (opts: { collection: string; data: object }) => {
      if (opts.collection === 'certificates') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d = opts.data as any
        return {
          id: 'cert-new-001',
          student: d.student,
          course: d.course,
          issuedAt: d.issuedAt,
          certificateNumber: d.certificateNumber,
          finalGrade: d.finalGrade,
        }
      }
      return {}
    }),
  }
}

// ── Module-level mocks ───────────────────────────────────────────────────────
vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(),
}))

vi.mock('@/services/gradebook-payload', () => {
  // Shared spy wrapped in an object so the factory closure can reference it
  // and tests can access it via the exported _gradebookMockRef.
  const spyRef: { getStudentGradebook: ReturnType<typeof vi.fn> } = {
    getStudentGradebook: vi.fn(),
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function MockPayloadGradebookService(this: any, _payload: unknown) {
    this.getStudentGradebook = spyRef.getStudentGradebook
  }
  MockPayloadGradebookService.prototype.getStudentGradebook = spyRef.getStudentGradebook
  return { PayloadGradebookService: MockPayloadGradebookService, _gradebookSpyRef: spyRef }
})

describe('POST /api/certificates/generate', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-19T10:00:00.000Z'))
    // Reset shared spy to default: returns empty → finalGrade defaults to 0
    const { _gradebookSpyRef } = await import('@/services/gradebook-payload')
    vi.mocked(_gradebookSpyRef.getStudentGradebook).mockReset()
    vi.mocked(_gradebookSpyRef.getStudentGradebook).mockResolvedValue([])
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  // ── Helpers ────────────────────────────────────────────────────────────────
  async function callEndpoint(
    studentId: string,
    courseId: string,
    payload: ReturnType<typeof makeMockPayload>,
  ) {
    const { getPayloadInstance } = await import('@/services/progress')
    ;(getPayloadInstance as ReturnType<typeof vi.fn>).mockResolvedValue(payload)

    const request = new NextRequest('http://localhost/api/certificates/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, courseId }),
    })

    // Inject mock user directly via context to bypass auth token verification
    return handleGenerateCertificate(request, { user: mockUser as never })
  }

  // ── Test: Not enrolled → 403 ───────────────────────────────────────────────
  it('returns 403 when student is not enrolled in the course', async () => {
    const payload = makeMockPayload({ enrollment: [] })

    const response = await callEndpoint('user-123', 'course-abc', payload)
    expect(response.status).toBe(403)

    const body = await response.json()
    expect(body).toEqual({ success: false, error: 'Not enrolled' })
  })

  // ── Test: Course not complete → 400 ────────────────────────────────────────
  it('returns 400 when not all lessons are completed', async () => {
    const payload = makeMockPayload({
      enrollment: [
        // completedLessons contains only lesson-1, but course has lesson-1 and lesson-2
        {
          id: 'enroll-001',
          student: 'user-123',
          course: 'course-abc',
          completedLessons: [{ id: 'lesson-1' }],
        },
      ],
      lessons: [
        { id: 'lesson-1' },
        { id: 'lesson-2' },
      ],
    })

    const response = await callEndpoint('user-123', 'course-abc', payload)
    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body).toEqual({ success: false, error: 'Course not complete' })
  })

  // ── Test: Happy path → 201 ─────────────────────────────────────────────────
  it('returns 201 and creates a certificate when all lessons are completed', async () => {
    const { _gradebookSpyRef } = await import('@/services/gradebook-payload')
    vi.mocked(_gradebookSpyRef.getStudentGradebook).mockResolvedValue([
      { courseId: 'course-abc', overallGrade: 85.5 },
    ])

    const payload = makeMockPayload({
      enrollment: [
        {
          id: 'enroll-001',
          student: 'user-123',
          course: 'course-abc',
          completedLessons: [{ id: 'lesson-1' }, { id: 'lesson-2' }],
        },
      ],
      lessons: [
        { id: 'lesson-1' },
        { id: 'lesson-2' },
      ],
      certificates: [],
    })

    const response = await callEndpoint('user-123', 'course-abc', payload)
    expect(response.status).toBe(201)

    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data.certificateNumber).toMatch(/^CERT-COURSEAB-/)
    expect(body.data.finalGrade).toBe(85.5)
    expect(body.data.student).toBe('user-123')
    expect(body.data.course).toBe('course-abc')
    expect(body.data.issuedAt).toBe('2026-04-19T10:00:00.000Z')
  })

  // ── Test: Idempotent re-generate → 200 ─────────────────────────────────────
  it('returns 200 and the existing certificate when already issued (idempotent)', async () => {
    const existingCert = {
      id: 'cert-existing-999',
      student: 'user-123',
      course: 'course-abc',
      issuedAt: '2026-04-18T09:00:00.000Z',
      certificateNumber: 'CERT-COURSEABC-XYZ',
      finalGrade: 92,
    }

    const payload = makeMockPayload({
      enrollment: [
        {
          id: 'enroll-001',
          student: 'user-123',
          course: 'course-abc',
          completedLessons: [{ id: 'lesson-1' }, { id: 'lesson-2' }],
        },
      ],
      lessons: [
        { id: 'lesson-1' },
        { id: 'lesson-2' },
      ],
      certificates: [existingCert],
    })

    const response = await callEndpoint('user-123', 'course-abc', payload)
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data.certificateNumber).toBe('CERT-COURSEABC-XYZ')
    expect(body.data.id).toBe('cert-existing-999')
    expect(body.data.finalGrade).toBe(92)
  })
})
