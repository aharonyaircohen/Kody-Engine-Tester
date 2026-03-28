import type { CollectionSlug } from 'payload'
import { NextRequest } from 'next/server'
import { userStore, sessionStore, jwtService } from '../../../../../auth'
import { createAuthMiddleware } from '../../../../../middleware/auth-middleware'
import { requireRole } from '../../../../../middleware/role-guard'
import { getGradebookService } from '../../../../../services/gradebook'

const auth = createAuthMiddleware(userStore, sessionStore, jwtService)

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

  const user = authContext.user!

  const roleError = requireRole('instructor', 'admin')(authContext)
  if (roleError) {
    return new Response(JSON.stringify({ error: roleError.error }), {
      status: roleError.status,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { id: courseId } = await params

  // Verify the instructor owns this course (admin bypasses this check)
  if (user.role !== 'admin') {
    const { getPayload } = await import('payload')
    const configPromise = await import('@payload-config').then((m) => m.default)
    const payload = await getPayload({ config: configPromise })
    const course = (await payload.findByID({
      collection: 'courses' as CollectionSlug,
      id: courseId,
    })) as unknown as { instructor?: { id: string | number } | string | number }

    const courseInstructorId = course?.instructor
      ? typeof course.instructor === 'string'
        ? course.instructor
        : String((course.instructor as { id: string | number }).id)
      : null

    if (courseInstructorId !== String(user.id)) {
      return new Response(JSON.stringify({ error: 'You are not the instructor of this course' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  try {
    const service = await getGradebookService()
    const gradebook = await service.getCourseGradebook(courseId, String(user.id))

    return new Response(JSON.stringify({ gradebook }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Failed to load course gradebook'
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
