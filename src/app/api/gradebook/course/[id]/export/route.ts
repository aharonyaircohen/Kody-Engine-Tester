import { NextRequest } from 'next/server'
import type { CollectionSlug } from 'payload'
import { withAuth } from '@/auth/withAuth'
import { getPayloadInstance } from '@/services/progress'
import { getCourseGradebookData } from '../route'

/** RFC 4180 CSV field escape: quote-wrap strings containing commas, quotes, or newlines */
export function escapeCsvValue(value: string | number | undefined | null): string {
  const str = value == null ? '' : String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/** Exported only for unit testing — use escapeCsvValue in production */
export const escapeCsvValueForTest = escapeCsvValue

function csvRow(values: (string | number | undefined | null)[]): string {
  return values.map(escapeCsvValue).join(',') + '\n'
}

interface CourseRecord {
  id: string
  slug?: string
  instructor?: { id: string } | string
}

interface UserRecord {
  id: string
  email?: string
  firstName?: string
  lastName?: string
}

interface EnrollmentRecord {
  student: { id: string } | string
  completedLessons?: { id: string }[]
}

/**
 * GET /api/gradebook/course/:id/export
 * Streams a CSV of the course gradebook for instructors/admins.
 * Auth: editor or admin role only (handled by withAuth).
 */
export const GET = withAuth(
  async (
    _request: NextRequest,
    { user },
    routeParams?: { params: Promise<{ id: string }> },
  ) => {
    const params = await routeParams?.params
    const courseId = params?.id

    if (!courseId) {
      return new Response(JSON.stringify({ error: 'Missing id parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const result = await getCourseGradebookData(
      courseId,
      String(user?.id ?? ''),
      user?.role ?? '',
    )

    if (result instanceof Response) return result

    const { course, gradebook } = result
    const courseSlug = (course as CourseRecord).slug ?? courseId

    const payload = await getPayloadInstance()

    // Batch-fetch student user records
    const studentIds = gradebook.map((e) => e.studentId)
    const studentIdStrings = studentIds.map(String)

    const { docs: students } = await payload.find({
      collection: 'users' as CollectionSlug,
      where:
        studentIdStrings.length > 0
          ? { id: { in: studentIdStrings } }
          : { id: { equals: '__no_match__' } },
      limit: 100,
      depth: 0,
    })

    const usersMap = new Map<string, UserRecord>()
    for (const u of students as unknown as UserRecord[]) {
      usersMap.set(String(u.id), u)
    }

    // Batch-fetch enrollments to get completedLessons counts
    const { docs: enrollments } = await payload.find({
      collection: 'enrollments' as CollectionSlug,
      where: {
        course: { equals: courseId },
        status: { equals: 'active' },
        ...(studentIdStrings.length > 0 ? { student: { in: studentIdStrings } } : {}),
      },
      limit: 100,
      depth: 0,
    })

    const lessonsCompletedMap = new Map<string, number>()
    for (const e of enrollments as unknown as EnrollmentRecord[]) {
      const sid = typeof e.student === 'string' ? e.student : e.student?.id
      if (sid) {
        lessonsCompletedMap.set(
          sid,
          e.completedLessons?.length ?? 0,
        )
      }
    }

    const rows: string[] = []
    rows.push(csvRow(['student_email', 'student_name', 'lessons_completed', 'quiz_avg', 'assignment_avg', 'final_grade']))

    for (const entry of gradebook) {
      const uid = String(entry.studentId)
      const student = usersMap.get(uid)
      const studentEmail = student?.email ?? ''
      const studentName = [student?.firstName, student?.lastName]
        .filter(Boolean)
        .join(' ') || ''
      const lessonsCompleted = lessonsCompletedMap.get(uid) ?? 0

      rows.push(
        csvRow([
          studentEmail,
          studentName,
          lessonsCompleted,
          entry.quizAverage,
          entry.assignmentAverage,
          entry.overallGrade,
        ]),
      )
    }

    const csvBody = rows.join('')

    return new Response(csvBody, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="gradebook-${courseSlug}.csv"`,
      },
    })
  },
  { roles: ['editor', 'admin'] },
)
