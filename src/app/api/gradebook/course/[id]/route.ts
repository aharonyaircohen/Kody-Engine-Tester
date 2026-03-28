import { NextRequest } from 'next/server'
import type { CollectionSlug } from 'payload'
import { userStore, sessionStore, jwtService } from '../../../../../auth'
import { createAuthMiddleware } from '../../../../../middleware/auth-middleware'
import { requireRole } from '../../../../../middleware/role-guard'
import { getPayloadInstance } from '../../../../../services/progress'
import { PayloadGradebookService } from '../../../../../services/gradebook-payload'

const auth = createAuthMiddleware(userStore, sessionStore, jwtService)

/**
 * GET /api/gradebook/course/:id
 * Returns all students' grades for a specific course.
 * Requires instructor role (must be the course instructor) or admin.
 */
export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const authContext = await auth({
    authorization: request.headers.get('authorization') || undefined,
    ip: request.headers.get('x-forwarded-for') || undefined,
  })

  if (authContext.error) {
    return new Response(JSON.stringify({ error: authContext.error }), {
      status: authContext.status ?? 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const roleError = requireRole('instructor', 'admin')(authContext)
  if (roleError) {
    return new Response(JSON.stringify({ error: roleError.error }), {
      status: roleError.status,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { id: courseId } = await params
  const user = authContext.user!

  const payload = await getPayloadInstance()

  // Verify course exists and user is the instructor (unless admin)
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

  const userRole = (user as { role?: string }).role
  const courseInstructorId =
    typeof course.instructor === 'string' ? course.instructor : course.instructor?.id

  if (userRole !== 'admin' && courseInstructorId !== String(user.id)) {
    return new Response(JSON.stringify({ error: 'Forbidden: you are not the instructor of this course' }), {
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
}
