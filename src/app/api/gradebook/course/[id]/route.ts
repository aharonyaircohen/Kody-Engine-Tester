import { NextRequest } from 'next/server'
import type { CollectionSlug } from 'payload'
import { withAuth } from '@/auth/withAuth'
import { getPayloadInstance } from '@/services/progress'
import { PayloadGradebookService } from '@/services/gradebook-payload'

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

    const payload = await getPayloadInstance()

    // Verify course exists and user is the editor (unless admin)
    const course = (await payload.findByID({
      collection: 'courses' as CollectionSlug,
      id: courseId,
      depth: 0,
    })) as unknown as { instructor?: { id: string } | string; id: string }

    if (!course) {
      return new Response(JSON.stringify({ error: 'Course not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const courseInstructorId =
      typeof course.instructor === 'string' ? course.instructor : course.instructor?.id

    if (user?.role !== 'admin' && courseInstructorId !== String(user?.id)) {
      return new Response(JSON.stringify({ error: 'Forbidden: you are not the editor of this course' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const gradebookSvc = new PayloadGradebookService(payload)
    const gradebook = await gradebookSvc.getCourseGradebook(courseId)

    return new Response(JSON.stringify(gradebook), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  },
  { roles: ['editor', 'admin'] }
)
