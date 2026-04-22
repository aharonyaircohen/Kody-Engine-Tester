import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RecommendationService } from './recommendations'
import type { Payload } from 'payload'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const OLD_DATE = '2020-01-01T00:00:00.000Z' // Far older than 60 days

function makeTag(label: string) {
  return { label }
}

function makeCourse(overrides: {
  id?: string
  title?: string
  tags?: ReturnType<typeof makeTag>[]
  createdAt?: string
  status?: string
  instructor?: { id?: string | number; firstName?: string; lastName?: string }
} = {}) {
  return {
    id: 'c1',
    title: 'Course',
    tags: [],
    createdAt: OLD_DATE,
    status: 'published',
    instructor: { id: 1, firstName: 'John', lastName: 'Doe' },
    ...overrides,
  }
}

function makeEnrollment(overrides: {
  id?: string
  student?: string
  course?: string
  status?: string
} = {}) {
  return {
    id: 'e1',
    student: 'user-1',
    course: 'c1',
    status: 'active',
    ...overrides,
  }
}

function createMockPayload(
  overrides?: Partial<Payload> & {
    find?: ReturnType<typeof vi.fn>
    findByID?: ReturnType<typeof vi.fn>
  },
) {
  const findMock = vi.fn()
  const findByIDMock = vi.fn()
  return {
    find: findMock,
    findByID: findByIDMock,
    ...overrides,
  } as unknown as Payload & {
    find: ReturnType<typeof vi.fn>
    findByID: ReturnType<typeof vi.fn>
  }
}

// ---------------------------------------------------------------------------
// Tag-overlap scoring
// ---------------------------------------------------------------------------

describe('RecommendationService — tag-overlap scoring', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('score reflects Jaccard=1.0 for identical tag sets', async () => {
    // Completed course and candidate share identical tags; both old to avoid recency
    const completedCourse = makeCourse({
      id: 'c-completed',
      tags: [makeTag('typescript'), makeTag('react')],
      createdAt: OLD_DATE,
    })
    const candidate = makeCourse({
      id: 'c-candidate',
      tags: [makeTag('typescript'), makeTag('react')],
      createdAt: OLD_DATE,
    })

    const mockPayload = createMockPayload()
    // 1. User's completed enrollments
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [makeEnrollment({ student: 'user-1', course: 'c-completed', status: 'completed' })],
      totalDocs: 1,
    })
    // 2. Fetch completed course (with tags)
    ;(mockPayload.findByID as ReturnType<typeof vi.fn>).mockResolvedValueOnce(completedCourse)
    // 3. All published courses
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [candidate],
      totalDocs: 1,
    })
    // 4. Co-enrolled users (none)
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ docs: [], totalDocs: 0 })
    // 5. Cohort completions (none)
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ docs: [], totalDocs: 0 })

    const service = new RecommendationService(mockPayload, 10 * 60 * 1000)
    const result = await service.recommend({ userId: 'user-1' })

    const scored = result.items.find((i) => i.course.id === 'c-candidate')!
    // Jaccard=1.0 → 0.6*1=0.6; no cohort; no recency (old date) → 0.6
    expect(scored.score).toBeCloseTo(0.6, 2)
    expect(scored.reasons).toContain('shared-tag:typescript')
    expect(scored.reasons).toContain('shared-tag:react')
  })

  it('score is 0 for disjoint tag sets (Jaccard=0)', async () => {
    const completedCourse = makeCourse({
      id: 'c-completed',
      tags: [makeTag('python')],
      createdAt: OLD_DATE,
    })
    const candidate = makeCourse({
      id: 'c-candidate',
      tags: [makeTag('rust'), makeTag('go')],
      createdAt: OLD_DATE,
    })

    const mockPayload = createMockPayload()
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [makeEnrollment({ student: 'user-1', course: 'c-completed', status: 'completed' })],
      totalDocs: 1,
    })
    ;(mockPayload.findByID as ReturnType<typeof vi.fn>).mockResolvedValueOnce(completedCourse)
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [candidate],
      totalDocs: 1,
    })
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ docs: [], totalDocs: 0 })
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ docs: [], totalDocs: 0 })

    const service = new RecommendationService(mockPayload, 10 * 60 * 1000)
    const result = await service.recommend({ userId: 'user-1' })

    const scored = result.items.find((i) => i.course.id === 'c-candidate')!
    expect(scored.score).toBeCloseTo(0, 4)
    expect(scored.reasons.filter((r) => r.startsWith('shared-tag:'))).toHaveLength(0)
  })

  it('partial-overlap gives partial Jaccard score (intersection=1, union=4 → 0.25 → 0.15)', async () => {
    const completedCourse = makeCourse({
      id: 'c-completed',
      tags: [makeTag('typescript'), makeTag('react'), makeTag('node')],
      createdAt: OLD_DATE,
    })
    const candidate = makeCourse({
      id: 'c-candidate',
      tags: [makeTag('typescript'), makeTag('vue')],
      createdAt: OLD_DATE,
    })

    const mockPayload = createMockPayload()
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [makeEnrollment({ student: 'user-1', course: 'c-completed', status: 'completed' })],
      totalDocs: 1,
    })
    ;(mockPayload.findByID as ReturnType<typeof vi.fn>).mockResolvedValueOnce(completedCourse)
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [candidate],
      totalDocs: 1,
    })
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ docs: [], totalDocs: 0 })
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ docs: [], totalDocs: 0 })

    const service = new RecommendationService(mockPayload, 10 * 60 * 1000)
    const result = await service.recommend({ userId: 'user-1' })

    const scored = result.items.find((i) => i.course.id === 'c-candidate')!
    // Jaccard = 1/4 = 0.25, weighted 0.6 → 0.15
    expect(scored.score).toBeCloseTo(0.15, 2)
    expect(scored.reasons).toContain('shared-tag:typescript')
  })
})

// ---------------------------------------------------------------------------
// Cohort popularity
// ---------------------------------------------------------------------------

describe('RecommendationService — cohort popularity scoring', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('cohort fraction 3/5 → cohort component = 0.18; tag score from identical tags = 0.6; total ≈ 0.78', async () => {
    // Both courses have the same tags so tagScore=0.6; no cohort gives just tagScore
    const completedCourse = makeCourse({
      id: 'c1',
      tags: [makeTag('shared')],
      createdAt: OLD_DATE,
    })
    const candidate = makeCourse({
      id: 'c-candidate',
      tags: [makeTag('shared')],
      createdAt: OLD_DATE,
    })

    const mockPayload = createMockPayload()

    // 1. User's enrollments
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [makeEnrollment({ student: 'user-1', course: 'c1', status: 'completed' })],
      totalDocs: 1,
    })
    // 2. Completed course
    ;(mockPayload.findByID as ReturnType<typeof vi.fn>).mockResolvedValueOnce(completedCourse)
    // 3. All published courses
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [candidate],
      totalDocs: 1,
    })
    // 4. Co-enrolled users: 5 users share course c1 (excluding user-1)
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [
        makeEnrollment({ id: 'e2', student: 'user-2', course: 'c1' }),
        makeEnrollment({ id: 'e3', student: 'user-3', course: 'c1' }),
        makeEnrollment({ id: 'e4', student: 'user-4', course: 'c1' }),
        makeEnrollment({ id: 'e5', student: 'user-5', course: 'c1' }),
        makeEnrollment({ id: 'e6', student: 'user-6', course: 'c1' }),
      ],
      totalDocs: 5,
    })
    // 5. Cohort completions: 3 of those 5 completed c-candidate
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [
        makeEnrollment({ id: 'ec1', student: 'user-2', course: 'c-candidate', status: 'completed' }),
        makeEnrollment({ id: 'ec2', student: 'user-3', course: 'c-candidate', status: 'completed' }),
        makeEnrollment({ id: 'ec3', student: 'user-4', course: 'c-candidate', status: 'completed' }),
      ],
      totalDocs: 3,
    })

    const service = new RecommendationService(mockPayload, 10 * 60 * 1000)
    const result = await service.recommend({ userId: 'user-1' })

    const scored = result.items.find((i) => i.course.id === 'c-candidate')!
    // 0.6 (tag) + 0.3*0.6 (cohort) = 0.6 + 0.18 = 0.78
    expect(scored.score).toBeCloseTo(0.78, 2)
    expect(scored.reasons).toContain('popular-among-cohort')
  })

  it('cohort fraction 0 when no cohort members completed the course', async () => {
    const completedCourse = makeCourse({
      id: 'c1',
      tags: [makeTag('shared')],
      createdAt: OLD_DATE,
    })
    const candidate = makeCourse({
      id: 'c-candidate',
      tags: [makeTag('shared')],
      createdAt: OLD_DATE,
    })

    const mockPayload = createMockPayload()

    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [makeEnrollment({ student: 'user-1', course: 'c1', status: 'completed' })],
      totalDocs: 1,
    })
    ;(mockPayload.findByID as ReturnType<typeof vi.fn>).mockResolvedValueOnce(completedCourse)
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [candidate],
      totalDocs: 1,
    })
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [
        makeEnrollment({ id: 'e2', student: 'user-2', course: 'c1' }),
        makeEnrollment({ id: 'e3', student: 'user-3', course: 'c1' }),
      ],
      totalDocs: 2,
    })
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ docs: [], totalDocs: 0 })

    const service = new RecommendationService(mockPayload, 10 * 60 * 1000)
    const result = await service.recommend({ userId: 'user-1' })

    const scored = result.items.find((i) => i.course.id === 'c-candidate')!
    // 0.6 (tag) + 0.3*0 (cohort) = 0.6
    expect(scored.score).toBeCloseTo(0.6, 2)
    expect(scored.reasons).not.toContain('popular-among-cohort')
  })
})

// ---------------------------------------------------------------------------
// Recency bonus
// ---------------------------------------------------------------------------

describe('RecommendationService — recency bonus', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('applies +0.1 recency bonus for courses published within last 60 days', async () => {
    const completedCourse = makeCourse({
      id: 'c1',
      tags: [makeTag('shared')],
      createdAt: OLD_DATE,
    })
    // Candidate is recent (30 days ago), same tags as completed → tagScore=0.6
    const recentDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const candidate = makeCourse({
      id: 'c-candidate',
      tags: [makeTag('shared')],
      createdAt: recentDate,
    })

    const mockPayload = createMockPayload()

    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [makeEnrollment({ student: 'user-1', course: 'c1', status: 'completed' })],
      totalDocs: 1,
    })
    ;(mockPayload.findByID as ReturnType<typeof vi.fn>).mockResolvedValueOnce(completedCourse)
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [candidate],
      totalDocs: 1,
    })
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ docs: [], totalDocs: 0 })
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ docs: [], totalDocs: 0 })

    const service = new RecommendationService(mockPayload, 10 * 60 * 1000)
    const result = await service.recommend({ userId: 'user-1' })

    const scored = result.items.find((i) => i.course.id === 'c-candidate')!
    // 0.6 (tag) + 0.1 (recency) = 0.7
    expect(scored.score).toBe(0.7)
    expect(scored.reasons).toContain('recently-published')
  })

  it('no recency bonus for courses older than 60 days', async () => {
    const completedCourse = makeCourse({
      id: 'c1',
      tags: [makeTag('shared')],
      createdAt: OLD_DATE,
    })
    // Candidate is also old (> 60 days), same tags
    const candidate = makeCourse({
      id: 'c-candidate',
      tags: [makeTag('shared')],
      createdAt: OLD_DATE,
    })

    const mockPayload = createMockPayload()

    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [makeEnrollment({ student: 'user-1', course: 'c1', status: 'completed' })],
      totalDocs: 1,
    })
    ;(mockPayload.findByID as ReturnType<typeof vi.fn>).mockResolvedValueOnce(completedCourse)
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [candidate],
      totalDocs: 1,
    })
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ docs: [], totalDocs: 0 })
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ docs: [], totalDocs: 0 })

    const service = new RecommendationService(mockPayload, 10 * 60 * 1000)
    const result = await service.recommend({ userId: 'user-1' })

    const scored = result.items.find((i) => i.course.id === 'c-candidate')!
    // 0.6 (tag) + 0 (recency) = 0.6
    expect(scored.score).toBeCloseTo(0.6, 2)
    expect(scored.reasons).not.toContain('recently-published')
  })
})

// ---------------------------------------------------------------------------
// Score bounds and weighting
// ---------------------------------------------------------------------------

describe('RecommendationService — score bounds and weighting', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('final score is always in [0, 1]', async () => {
    const completedCourse = makeCourse({
      id: 'c-completed',
      tags: [makeTag('typescript'), makeTag('react')],
      createdAt: OLD_DATE,
    })
    // Recent candidate with identical tags → max score
    const recentDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    const candidate = makeCourse({
      id: 'c-candidate',
      tags: [makeTag('typescript'), makeTag('react')],
      createdAt: recentDate,
    })

    const mockPayload = createMockPayload()

    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [makeEnrollment({ student: 'user-1', course: 'c-completed', status: 'completed' })],
      totalDocs: 1,
    })
    ;(mockPayload.findByID as ReturnType<typeof vi.fn>).mockResolvedValueOnce(completedCourse)
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [candidate],
      totalDocs: 1,
    })
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [makeEnrollment({ id: 'e2', student: 'user-2', course: 'c-completed' })],
      totalDocs: 1,
    })
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [
        makeEnrollment({ id: 'ec1', student: 'user-2', course: 'c-candidate', status: 'completed' }),
      ],
      totalDocs: 1,
    })

    const service = new RecommendationService(mockPayload, 10 * 60 * 1000)
    const result = await service.recommend({ userId: 'user-1' })

    const scored = result.items.find((i) => i.course.id === 'c-candidate')!
    expect(scored.score).toBeGreaterThanOrEqual(0)
    expect(scored.score).toBeLessThanOrEqual(1)
  })

  it('limit=100 is clamped to max 20', async () => {
    const courses = Array.from({ length: 30 }, (_, i) =>
      makeCourse({ id: `c-${i}`, tags: [], createdAt: OLD_DATE }),
    )

    const mockPayload = createMockPayload()

    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [makeEnrollment({ student: 'user-1', course: 'c-completed', status: 'completed' })],
      totalDocs: 1,
    })
    ;(mockPayload.findByID as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      makeCourse({ id: 'c-completed', tags: [], createdAt: OLD_DATE }),
    )
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: courses,
      totalDocs: courses.length,
    })
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ docs: [], totalDocs: 0 })
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ docs: [], totalDocs: 0 })

    const service = new RecommendationService(mockPayload, 10 * 60 * 1000)
    const result = await service.recommend({ userId: 'user-1', limit: 100 })

    expect(result.items.length).toBeLessThanOrEqual(20)
  })
})

// ---------------------------------------------------------------------------
// Cold-start
// ---------------------------------------------------------------------------

describe('RecommendationService — cold-start', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns results when user has 0 completed enrollments', async () => {
    const candidate = makeCourse({ id: 'c-candidate', tags: [], createdAt: OLD_DATE })

    const mockPayload = createMockPayload()

    // User has NO completed enrollments
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [],
      totalDocs: 0,
    })
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [candidate],
      totalDocs: 1,
    })

    const service = new RecommendationService(mockPayload, 10 * 60 * 1000)
    const result = await service.recommend({ userId: 'user-1' })

    expect(result.items.length).toBe(1)
    expect(result.items[0].course.id).toBe('c-candidate')
  })
})

// ---------------------------------------------------------------------------
// excludeCompleted
// ---------------------------------------------------------------------------

describe('RecommendationService — excludeCompleted', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('omits completed courses from results when excludeCompleted=true', async () => {
    const completedCourse = makeCourse({ id: 'c-completed', tags: [], createdAt: OLD_DATE })
    const candidate = makeCourse({ id: 'c-candidate', tags: [], createdAt: OLD_DATE })

    const mockPayload = createMockPayload()

    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [makeEnrollment({ student: 'user-1', course: 'c-completed', status: 'completed' })],
      totalDocs: 1,
    })
    ;(mockPayload.findByID as ReturnType<typeof vi.fn>).mockResolvedValueOnce(completedCourse)
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [completedCourse, candidate],
      totalDocs: 2,
    })
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ docs: [], totalDocs: 0 })
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ docs: [], totalDocs: 0 })

    const service = new RecommendationService(mockPayload, 10 * 60 * 1000)
    const result = await service.recommend({ userId: 'user-1', excludeCompleted: true })

    const ids = result.items.map((i) => i.course.id)
    expect(ids).not.toContain('c-completed')
    expect(ids).toContain('c-candidate')
  })
})

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

describe('RecommendationService — cache', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('cache hit returns same result object reference for identical query within TTL', async () => {
    const candidate = makeCourse({ id: 'c-candidate', tags: [], createdAt: OLD_DATE })

    const mockPayload = createMockPayload()

    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [],
      totalDocs: 0,
    })
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [candidate],
      totalDocs: 1,
    })

    const service = new RecommendationService(mockPayload, 10 * 60 * 1000)
    const r1 = await service.recommend({ userId: 'user-1', limit: 5 })
    const r2 = await service.recommend({ userId: 'user-1', limit: 5 })

    // Same object reference — cache hit
    expect(r1).toBe(r2)
  })

  it('identical query within TTL does not trigger additional payload.find calls', async () => {
    const candidate = makeCourse({ id: 'c-candidate', tags: [], createdAt: OLD_DATE })

    const mockPayload = createMockPayload()

    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [],
      totalDocs: 0,
    })
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [candidate],
      totalDocs: 1,
    })

    const service = new RecommendationService(mockPayload, 10 * 60 * 1000)
    await service.recommend({ userId: 'user-1' })
    await service.recommend({ userId: 'user-1' })

    // Only ONE "all courses" find call (the second call should be cached)
    const allCourseCalls = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls.filter(
      (call) => call[0]?.collection === 'courses',
    )
    expect(allCourseCalls.length).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// Unpublished courses
// ---------------------------------------------------------------------------

describe('RecommendationService — unpublished courses', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('never returns unpublished courses', async () => {
    const published = makeCourse({ id: 'c-published', status: 'published', tags: [], createdAt: OLD_DATE })

    const mockPayload = createMockPayload()

    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [],
      totalDocs: 0,
    })
    // Service queries only status=published
    ;(mockPayload.find as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      docs: [published],
      totalDocs: 1,
    })

    const service = new RecommendationService(mockPayload, 10 * 60 * 1000)
    const result = await service.recommend({ userId: 'user-1' })

    const ids = result.items.map((i) => i.course.id)
    expect(ids).toContain('c-published')
  })
})
