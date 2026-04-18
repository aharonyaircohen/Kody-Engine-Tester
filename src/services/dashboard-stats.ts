/**
 * DashboardStatsService aggregates platform-wide statistics from Payload collections.
 * Provides data for the admin dashboard charts and data tables.
 */

import type { Payload, CollectionSlug } from 'payload'

export interface DashboardSummary {
  totalCourses: number
  totalEnrollments: number
  totalUsers: number
  totalSubmissions: number
  completionRate: number // percentage of active enrollments that are completed
  averageGrade: number | null // average grade across graded submissions
}

export interface EnrollmentTrendPoint {
  month: string // e.g. "Jan 2026"
  count: number
}

export interface GradeDistribution {
  range: string // e.g. "90-100"
  count: number
  percentage: number
}

export interface CourseRow {
  id: string
  title: string
  instructor: string
  enrollmentCount: number
  status: string
}

export interface UserRow {
  id: string
  name: string
  email: string
  role: string
  enrollmentCount: number
}

export interface EnrollmentRow {
  id: string
  studentName: string
  courseTitle: string
  enrolledAt: string
  status: string
  progress: number
}

type PayloadDoc = Record<string, unknown> & { id: string }

// Helper to extract a string ID from a relationship field
function normalizeId(value: string | { id: string } | null | undefined): string {
  if (!value) return ''
  return typeof value === 'string' ? value : (value as { id: string }).id
}

// Helper to extract a string field from a relationship object
function extractRelationField<T extends PayloadDoc>(
  doc: T | string | { id: string } | null | undefined,
  field: keyof T,
): string {
  if (!doc) return ''
  if (typeof doc === 'string') return doc
  if ('id' in doc && Object.keys(doc).length === 1) return ''
  const d = doc as T
  const val = d[field]
  return typeof val === 'string' ? val : ''
}

export class DashboardStatsService {
  constructor(private payload: Payload) {}

  /**
   * Returns high-level summary statistics for the platform.
   */
  async getSummary(): Promise<DashboardSummary> {
    const [
      { totalDocs: totalCourses },
      { totalDocs: totalEnrollments },
      { totalDocs: totalUsers },
      { totalDocs: totalSubmissions },
    ] = await Promise.all([
      this.payload.find({ collection: 'courses' as CollectionSlug, limit: 0, depth: 0 }),
      this.payload.find({ collection: 'enrollments' as CollectionSlug, limit: 0, depth: 0 }),
      this.payload.find({ collection: 'users' as CollectionSlug, limit: 0, depth: 0 }),
      this.payload.find({ collection: 'submissions' as CollectionSlug, limit: 0, depth: 0 }),
    ])

    // Completion rate: completed enrollments / total enrollments
    const { docs: completedEnrollments } = await this.payload.find({
      collection: 'enrollments' as CollectionSlug,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { status: { equals: 'completed' } } as any,
      limit: 0,
    })
    const completionRate =
      totalEnrollments > 0
        ? Math.round((completedEnrollments.length / totalEnrollments) * 100)
        : 0

    // Average grade from graded submissions
    const { docs: gradedSubmissions } = await this.payload.find({
      collection: 'submissions' as CollectionSlug,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { status: { equals: 'graded' } } as any,
      limit: 1000,
      depth: 0,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gradedDocs = gradedSubmissions as unknown as PayloadDoc[]
    const grades = gradedDocs
      .map((s) => s.grade as number | null | undefined)
      .filter((g): g is number => typeof g === 'number' && !isNaN(g))
    const averageGrade =
      grades.length > 0
        ? Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 10) / 10
        : null

    return {
      totalCourses,
      totalEnrollments,
      totalUsers,
      totalSubmissions,
      completionRate,
      averageGrade,
    }
  }

  /**
   * Returns monthly enrollment counts for the last 12 months.
   */
  async getEnrollmentTrends(): Promise<EnrollmentTrendPoint[]> {
    const now = new Date()
    const points: EnrollmentTrendPoint[] = []

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = d.toISOString()
      const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1)
      const monthEnd = nextMonth.toISOString()

      const { totalDocs } = await this.payload.find({
        collection: 'enrollments' as CollectionSlug,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        where: { enrolledAt: { greater_than: monthStart, less_than: monthEnd } } as any,
        limit: 0,
      })

      points.push({
        month: d.toLocaleString('default', { month: 'short', year: 'numeric' }),
        count: totalDocs,
      })
    }

    return points
  }

  /**
   * Returns grade distribution buckets across graded submissions.
   */
  async getGradeDistribution(): Promise<GradeDistribution[]> {
    const { docs } = await this.payload.find({
      collection: 'submissions' as CollectionSlug,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { status: { equals: 'graded' } } as any,
      limit: 1000,
      depth: 0,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gradedDocs = docs as unknown as PayloadDoc[]
    const grades = gradedDocs
      .map((s) => s.grade as number | null | undefined)
      .filter((g): g is number => typeof g === 'number' && !isNaN(g))

    if (grades.length === 0) {
      return [
        { range: '90-100', count: 0, percentage: 0 },
        { range: '80-89', count: 0, percentage: 0 },
        { range: '70-79', count: 0, percentage: 0 },
        { range: '60-69', count: 0, percentage: 0 },
        { range: '< 60', count: 0, percentage: 0 },
      ]
    }

    const buckets: Array<[string, (g: number) => boolean]> = [
      ['90-100', (g) => g >= 90],
      ['80-89', (g) => g >= 80 && g < 90],
      ['70-79', (g) => g >= 70 && g < 80],
      ['60-69', (g) => g >= 60 && g < 70],
      ['< 60', (g) => g < 60],
    ]

    return buckets.map(([range, fn]) => {
      const count = grades.filter(fn).length
      return { range, count, percentage: Math.round((count / grades.length) * 100) }
    })
  }

  /**
   * Returns a paginated list of courses with enrollment counts.
   */
  async getCourses(
    limit = 10,
    page = 1,
  ): Promise<{ docs: CourseRow[]; totalDocs: number }> {
    const { docs, totalDocs } = await this.payload.find({
      collection: 'courses' as CollectionSlug,
      limit,
      page,
      depth: 1,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const courseDocs = docs as unknown as PayloadDoc[]

    const rows = await Promise.all(
      courseDocs.map(async (course) => {
        const courseId = course.id
        const { totalDocs: enrollmentCount } = await this.payload.find({
          collection: 'enrollments' as CollectionSlug,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          where: { course: { equals: courseId } } as any,
          limit: 0,
        })
        const instructorField = extractRelationField(
          course,
          'instructor' as keyof PayloadDoc,
        )
        const instructorName =
          instructorField ||
          ((course.instructor as PayloadDoc)?.firstName
            ? `${(course.instructor as PayloadDoc).firstName} ${
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (course.instructor as any).lastName ?? ''
              }`
            : 'Unknown')
        return {
          id: courseId,
          title:
            extractRelationField(course, 'title' as keyof PayloadDoc) ||
            (course.title as string) ||
            'Untitled',
          instructor: instructorName,
          enrollmentCount,
          status: ((course.status as string) || 'draft') as string,
        }
      }),
    )

    return { docs: rows, totalDocs }
  }

  /**
   * Returns a paginated list of users with enrollment counts.
   */
  async getUsers(
    limit = 10,
    page = 1,
  ): Promise<{ docs: UserRow[]; totalDocs: number }> {
    const { docs, totalDocs } = await this.payload.find({
      collection: 'users' as CollectionSlug,
      limit,
      page,
      depth: 0,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userDocs = docs as unknown as PayloadDoc[]

    const rows = await Promise.all(
      userDocs.map(async (user) => {
        const userId = user.id
        const { totalDocs: enrollmentCount } = await this.payload.find({
          collection: 'enrollments' as CollectionSlug,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          where: { student: { equals: userId } } as any,
          limit: 0,
        })
        return {
          id: userId,
          name: `${(user.firstName as string) ?? ''} ${
            (user.lastName as string) ?? ''
          }`.trim() || 'Unknown',
          email: (user.email as string) || '',
          role: (user.role as string) || 'student',
          enrollmentCount,
        }
      }),
    )

    return { docs: rows, totalDocs }
  }

  /**
   * Returns a paginated list of recent enrollments.
   */
  async getRecentEnrollments(
    limit = 10,
    page = 1,
  ): Promise<{ docs: EnrollmentRow[]; totalDocs: number }> {
    const { docs, totalDocs } = await this.payload.find({
      collection: 'enrollments' as CollectionSlug,
      limit,
      page,
      sort: '-enrolledAt',
      depth: 2,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enrollmentDocs = docs as unknown as PayloadDoc[]

    const rows = enrollmentDocs.map((enrollment) => {
      const student = enrollment.student as PayloadDoc | null
      const course = enrollment.course as PayloadDoc | null
      return {
        id: enrollment.id,
        studentName: student
          ? `${(student.firstName as string) ?? ''} ${
              (student.lastName as string) ?? ''
            }`.trim() || 'Unknown'
          : 'Unknown',
        courseTitle: (course?.title as string) || 'Unknown Course',
        enrolledAt: (enrollment.enrolledAt as string) || '',
        status: (enrollment.status as string) || 'active',
        progress: 0, // computed separately if needed
      }
    })

    return { docs: rows, totalDocs }
  }
}
