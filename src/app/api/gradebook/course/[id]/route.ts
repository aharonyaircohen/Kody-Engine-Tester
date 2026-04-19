import { NextRequest } from 'next/server'
import type { CollectionSlug } from 'payload'
import { withAuth } from '@/auth/withAuth'
import { getPayloadInstance } from '@/services/progress'
import { PayloadGradebookService } from '@/services/gradebook-payload'
import type { CourseGradebookEntry } from '@/services/gradebook'

interface CourseRecord {
  id: string
  slug?: string
  instructor?: { id: string } | string
}

interface GradebookResult {
  course: CourseRecord
  gradebook: CourseGradebookEntry[]
}

/**
 * Shared helper: validates course exists and that the current user is the
 * course editor (or an admin). Returns the course + gradebook on success,
 * or a Response (401/403/404) on failure.
 */
export async function getCourseGradebookData(
  courseId: string,
  userId: string,
  userRole: string,
): Promise<GradebookResult | Response> {
  const payload = await getPayloadInstance()

  const course = (await payload.findByID({
    collection: 'courses' as CollectionSlug,
    id: courseId,
    depth: 0,
  })) as unknown as CourseRecord

  if (!course) {
    return new Response(JSON.stringify({ error: 'Course not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const courseInstructorId =
    typeof course.instructor === 'string' ? course.instructor : course.instructor?.id

  if (userRole !== 'admin' && courseInstructorId !== userId) {
    return new Response(
      JSON.stringify({ error: 'Forbidden: you are not the editor of this course' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const gradebookSvc = new PayloadGradebookService(payload)
  const gradebook = await gradebookSvc.getCourseGradebook(courseId)

  return { course, gradebook }
}

/**
 * GET /api/gradebook/course/:id
 * Returns all students' grades for a specific course.
 * Requires editor role (must be the course editor) or admin.
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

    return new Response(JSON.stringify(result.gradebook), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  },
  { roles: ['editor', 'admin'] },
)
