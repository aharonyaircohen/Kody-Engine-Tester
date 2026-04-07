import { NextRequest, NextResponse } from 'next/server'
import type { CollectionSlug } from 'payload'
import { requireRole } from '@/middleware/rbac'
import { getPayloadInstance } from '@/services/progress'
import { PayloadGradebookService } from '@/services/gradebook-payload'

/**
 * GET /api/gradebook/course/:id
 * Returns all students' grades for a specific course.
 * Requires admin or editor role.
 */
export async function GET(
  request: NextRequest,
  routeParams?: { params: Promise<{ id: string }> },
): Promise<Response> {
  const rbacResponse = await requireRole('admin', 'editor')(request)
  if (rbacResponse.status !== 200) {
    return rbacResponse
  }

  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role')

  const params = await routeParams?.params
  const courseId = params?.id

  if (!courseId) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
  }

  const payload = await getPayloadInstance()

  const course = (await payload.findByID({
    collection: 'courses' as CollectionSlug,
    id: courseId,
    depth: 0,
  })) as unknown as { instructor?: { id: string } | string; id: string }

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  const courseInstructorId =
    typeof course.instructor === 'string' ? course.instructor : course.instructor?.id

  if (userRole !== 'admin' && courseInstructorId !== userId) {
    return NextResponse.json(
      { error: 'Forbidden: you are not the editor of this course' },
      { status: 403 }
    )
  }

  const gradebookSvc = new PayloadGradebookService(payload)
  const gradebook = await gradebookSvc.getCourseGradebook(courseId)

  return NextResponse.json(gradebook, { status: 200 })
}
