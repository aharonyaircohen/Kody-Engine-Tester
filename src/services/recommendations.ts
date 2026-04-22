import type { Payload, CollectionSlug } from 'payload'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RecommendationQuery {
  userId: string
  limit?: number
  excludeCompleted?: boolean
}

export interface ScoredCourse {
  course: Course
  score: number
  reasons: string[]
}

export interface RecommendationResult {
  items: ScoredCourse[]
  userId: string
  generatedAt: string
}

// Raw shapes returned by Payload queries
interface CourseTag {
  label?: string
}

export interface Course {
  id: string
  title?: string
  instructor?: { id?: string | number; firstName?: string; lastName?: string; displayName?: string }
  tags?: CourseTag[]
  createdAt?: string
  status?: string
  [key: string]: unknown
}

interface EnrollmentDoc {
  id: string
  student?: string | { id: string }
  course?: string | { id: string }
  status?: string
}

// ---------------------------------------------------------------------------
// Module-level cache singleton
// ---------------------------------------------------------------------------

interface CacheEntry {
  result: RecommendationResult
  expiresAt: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeId(value: string | { id: string }): string {
  return typeof value === 'string' ? value : value.id
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 1
  if (setA.size === 0 || setB.size === 0) return 0
  const intersection = new Set([...setA].filter((x) => setB.has(x)))
  const union = new Set([...setA, ...setB])
  return intersection.size / union.size
}

function tagSet(course: Course): Set<string> {
  return new Set((course.tags ?? []).map((t) => t.label ?? '').filter(Boolean))
}

function isWithin60Days(dateStr: string | undefined): boolean {
  if (!dateStr) return false
  const created = new Date(dateStr).getTime()
  if (isNaN(created)) return false
  return Date.now() - created < 60 * 24 * 60 * 60 * 1000
}

function instructorName(course: Course): string {
  const inst = course.instructor
  if (!inst) return ''
  if (typeof inst === 'string') return inst
  const first = inst.firstName ?? ''
  const last = inst.lastName ?? ''
  if (first || last) return `${first} ${last}`.trim()
  return (inst.displayName as string) ?? ''
}

function extractCourseId(raw: string | { id: string }): string {
  return typeof raw === 'string' ? raw : raw.id
}

// ---------------------------------------------------------------------------
// RecommendationService
// ---------------------------------------------------------------------------

export class RecommendationService {
  private readonly cache: Map<string, CacheEntry> = new Map()
  private readonly cacheTtlMs: number

  constructor(private readonly payload: Payload, cacheTtlMs = 10 * 60 * 1000) {
    this.cacheTtlMs = cacheTtlMs
  }

  private cacheKey(query: RecommendationQuery): string {
    return `${query.userId}|${query.limit ?? 5}|${query.excludeCompleted ?? true}`
  }

  private getCached(query: RecommendationQuery): RecommendationResult | null {
    const entry = this.cache.get(this.cacheKey(query))
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(this.cacheKey(query))
      return null
    }
    return entry.result
  }

  private setCache(query: RecommendationQuery, result: RecommendationResult): void {
    const key = this.cacheKey(query)
    this.cache.set(key, { result, expiresAt: Date.now() + this.cacheTtlMs })
  }

  /**
   * Returns recommendations for a user.
   *
   * Scoring (weights sum to 1.0):
   *   - Tag-overlap  (0.6): Jaccard similarity between completed-course tags
   *                        and candidate-course tags.
   *   - Cohort-pop   (0.3): Fraction of co-enrolled users who completed this
   *                        course.
   *   - Recency      (0.1): +0.1 if course was published in the last 60 days.
   *
   * Cold-start: if the user has no completed enrollments, all courses are
   * scored using cohort-popularity only (tag-overlap weight is skipped).
   *
   * Only published courses are returned.
   */
  async recommend(query: RecommendationQuery): Promise<RecommendationResult> {
    const userId = query.userId
    const limit = clamp(query.limit ?? 5, 1, 20)
    const excludeCompleted = query.excludeCompleted ?? true

    const effectiveQuery = { ...query, limit }

    // Check cache
    const cached = this.getCached(effectiveQuery)
    if (cached) return cached

    // Fetch user's completed enrollments
    const enrollmentsResult = await this.payload.find({
      collection: 'enrollments' as CollectionSlug,
      where: {
        student: { equals: userId },
        ...(excludeCompleted ? { status: { not_equals: 'completed' } } : {}),
      } as Parameters<typeof this.payload.find>[0]['where'],
      limit: 100,
    })

    const completedEnrollments = (enrollmentsResult.docs as unknown as EnrollmentDoc[]).filter(
      (e) => e.status === 'completed',
    )

    const completedCourseIds = completedEnrollments
      .map((e) => {
        const c = e.course
        return c ? normalizeId(c as string | { id: string }) : null
      })
      .filter((id): id is string => id !== null)

    const isColdStart = completedCourseIds.length === 0

    // Fetch all published courses
    const coursesResult = await this.payload.find({
      collection: 'courses' as CollectionSlug,
      where: { status: { equals: 'published' } } as Parameters<typeof this.payload.find>[0]['where'],
      limit: 0,
    })

    const allCourses = coursesResult.docs as unknown as Course[]

    // Filter out courses the user has already completed (if excludeCompleted)
    const candidateCourses = allCourses.filter((c) => !completedCourseIds.includes(c.id))

    // Fetch tags for completed courses (for tag-overlap scoring)
    const completedCourses: Course[] = []
    if (!isColdStart) {
      for (const cid of completedCourseIds) {
        const course = (await this.payload.findByID({
          collection: 'courses' as CollectionSlug,
          id: cid,
        })) as unknown as Course
        completedCourses.push(course)
      }
    }

    // Compute union of tags from completed courses
    const completedTagSet = new Set<string>()
    for (const cc of completedCourses) {
      for (const t of cc.tags ?? []) {
        if (t.label) completedTagSet.add(t.label)
      }
    }

    // Fetch cohort: users who share at least one course enrollment with the user
    const cohortUserIds = new Set<string>()
    for (const cid of completedCourseIds) {
      const coEnrolled = await this.payload.find({
        collection: 'enrollments' as CollectionSlug,
        where: { course: { equals: cid } } as Parameters<typeof this.payload.find>[0]['where'],
        limit: 0,
      })
      for (const e of coEnrolled.docs as unknown as EnrollmentDoc[]) {
        const sid = e.student ? normalizeId(e.student as string | { id: string }) : null
        if (sid && sid !== userId) cohortUserIds.add(sid)
      }
    }

    const cohortUserIdList = [...cohortUserIds]

    // Pre-fetch cohort completions for each candidate course
    const candidateIds = candidateCourses.map((c) => c.id)
    const cohortCompletions: Record<string, number> = {}
    for (const cid of candidateIds) {
      cohortCompletions[cid] = 0
    }
    if (cohortUserIdList.length > 0) {
      const cohortEnrollments = await this.payload.find({
        collection: 'enrollments' as CollectionSlug,
        where: {
          student: { in: cohortUserIdList },
          status: { equals: 'completed' },
          course: { in: candidateIds },
        } as Parameters<typeof this.payload.find>[0]['where'],
        limit: 0,
      })
      for (const e of cohortEnrollments.docs as unknown as EnrollmentDoc[]) {
        const cid = e.course ? extractCourseId(e.course as string | { id: string }) : null
        if (cid && cid in cohortCompletions) {
          cohortCompletions[cid]++
        }
      }
    }

    const cohortSize = cohortUserIdList.length

    // Score each candidate
    const scored: ScoredCourse[] = candidateCourses.map((course) => {
      const reasons: string[] = []

      // --- Tag-overlap score (0.6) ---
      const tagScore = isColdStart
        ? 0
        : jaccardSimilarity(completedTagSet, tagSet(course))

      if (!isColdStart && tagScore > 0) {
        const sharedTags = [...completedTagSet].filter((t) =>
          (course.tags ?? []).some((ct) => ct.label === t),
        )
        for (const tag of sharedTags.slice(0, 3)) {
          reasons.push(`shared-tag:${tag}`)
        }
      }

      // --- Cohort-popularity score (0.3) ---
      const cohortPopScore = cohortSize > 0 ? cohortCompletions[course.id] / cohortSize : 0
      if (cohortPopScore > 0.1) {
        reasons.push('popular-among-cohort')
      }

      // --- Recency bonus (0.1) ---
      const recencyBonus = isWithin60Days(course.createdAt) ? 0.1 : 0
      if (recencyBonus > 0) {
        reasons.push('recently-published')
      }

      const rawScore = 0.6 * tagScore + 0.3 * cohortPopScore + recencyBonus
      const score = clamp(rawScore, 0, 1)

      return { course, score, reasons }
    })

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score)

    const result: RecommendationResult = {
      items: scored.slice(0, limit),
      userId,
      generatedAt: new Date().toISOString(),
    }

    this.setCache(effectiveQuery, result)
    return result
  }
}
