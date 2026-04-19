import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

// ─── Mock Payload ────────────────────────────────────────────────────────────────

const mockPayload = {
  findByID: vi.fn<(args: unknown) => Promise<unknown>>(),
  find: vi.fn<(args: unknown) => Promise<unknown>>(),
}

vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(() => Promise.resolve(mockPayload)),
}))

// Mock auth/withAuth — bypass JWT/auth and inject a controlled user
vi.mock('@/auth/withAuth', () => ({
  withAuth:
    (
      handler: (
        req: NextRequest,
        ctx: { user?: { id: string; role: string } },
        routeParams?: { params: Promise<{ id: string }> },
      ) => Promise<Response>,
    ) =>
    (req: NextRequest, routeParams?: { params: Promise<{ id: string }> }) =>
      handler(req, { user: mockCurrentUser }, routeParams),
}))

// ─── Per-test find response queue ───────────────────────────────────────────────
// Each call to find() returns the next queued response.

const findQueue: Array<{ docs: unknown[] }> = []

function queueFindResponses(responses: Array<{ docs: unknown[] }>) {
  findQueue.push(...responses)
}

mockPayload.find.mockImplementation(async () => {
  return findQueue.shift() ?? { docs: [] }
})

// ─── Test helpers ───────────────────────────────────────────────────────────────

let mockCurrentUser: { id: string; role: string } = { id: 'editor-1', role: 'editor' }

function setMockUser(user: { id: string; role: string }) {
  mockCurrentUser = user
}

function buildRequest(courseId: string) {
  return new NextRequest(`http://localhost/api/gradebook/course/${courseId}/export`)
}

function buildRouteParams(courseId: string) {
  return { params: Promise.resolve({ id: courseId }) }
}

function setupCourseNotFound() {
  mockPayload.findByID.mockResolvedValue(null)
}

function setupCourseFound(overrides: Record<string, unknown> = {}) {
  mockPayload.findByID.mockResolvedValue({
    id: 'course-1',
    slug: 'intro-to-python',
    instructor: 'editor-1',
    ...overrides,
  })
}

function setupHappyPath() {
  // find() call order across all layers:
  // 1. PayloadGradebookService.getCourseGradebook:
  //    getQuizzes → [], getAssignments → [], getCourseEnrollments → []
  // 2. Export route:
  //    users query → [], enrollments query → []
  queueFindResponses([
    { docs: [] }, // getQuizzes
    { docs: [] }, // getAssignments
    { docs: [] }, // getCourseEnrollments
    { docs: [] }, // users
    { docs: [] }, // enrollments
  ])
}

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe('GET /api/gradebook/course/[id]/export', () => {
  beforeEach(() => {
    // Reset the mock but then REAPPLY the queue-based implementation
    // so that queueFindResponses can add items to it.
    vi.resetAllMocks()
    findQueue.length = 0
    mockPayload.find.mockImplementation(async () => {
      return findQueue.shift() ?? { docs: [] }
    })
    setMockUser({ id: 'editor-1', role: 'editor' })
  })

  describe('auth', () => {
    it('returns 403 when user is a student (not editor or admin)', async () => {
      setMockUser({ id: 'student-1', role: 'viewer' })
      setupCourseFound()

      const response = await GET(buildRequest('course-1'), buildRouteParams('course-1'))
      expect(response.status).toBe(403)
    })
  })

  describe('course not found', () => {
    it('returns 404 when the course does not exist', async () => {
      setupCourseNotFound()

      const response = await GET(buildRequest('nonexistent'), buildRouteParams('nonexistent'))
      expect(response.status).toBe(404)

      const body = await response.text()
      expect(body).toContain('Course not found')
    })
  })

  describe('happy path', () => {
    it('returns CSV with correct headers and Content-Disposition', async () => {
      setupCourseFound()
      setupHappyPath()

      const response = await GET(buildRequest('course-1'), buildRouteParams('course-1'))
      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('text/csv')
      expect(response.headers.get('Content-Disposition')).toBe(
        'attachment; filename="gradebook-intro-to-python.csv"',
      )

      const body = await response.text()
      const lines = body.trim().split('\n')
      expect(lines[0]).toBe(
        'student_email,student_name,lessons_completed,quiz_avg,assignment_avg,final_grade',
      )
      // No gradebook entries → only header row
      expect(lines).toHaveLength(1)
    })
  })

  describe('CSV escaping', () => {
    // These tests verify the CSV escaping logic by directly testing the
    // helper functions. The full integration requires a complex Payload mock
    // chain (gradebook service + export route), so we test the escape logic
    // in isolation here.

    it('wraps strings containing commas in double quotes (RFC 4180)', async () => {
      // escapeCsvValue('John, Jr.') → '"John, Jr."'
      const { escapeCsvValueForTest } = await import('./route')
      expect(escapeCsvValueForTest('John, Jr.')).toBe('"John, Jr."')
    })

    it('doubles internal double quotes and wraps in quotes (RFC 4180)', async () => {
      const { escapeCsvValueForTest } = await import('./route')
      // 'Say "Hello"' → '"Say ""Hello"""'
      expect(escapeCsvValueForTest('Say "Hello"')).toBe('"Say ""Hello"""')
    })

    it('wraps strings containing newlines in double quotes (RFC 4180)', async () => {
      const { escapeCsvValueForTest } = await import('./route')
      expect(escapeCsvValueForTest('Multi\nLine')).toBe('"Multi\nLine"')
    })

    it('leaves plain strings unquoted', async () => {
      const { escapeCsvValueForTest } = await import('./route')
      expect(escapeCsvValueForTest('Alice Smith')).toBe('Alice Smith')
    })

    it('converts null/undefined to empty string', async () => {
      const { escapeCsvValueForTest } = await import('./route')
      expect(escapeCsvValueForTest(null)).toBe('')
      expect(escapeCsvValueForTest(undefined)).toBe('')
    })
  })
})
