import { NextRequest } from 'next/server'
import type { CollectionSlug } from 'payload'
import { userStore, sessionStore, jwtService } from '../../../../../auth'
import { createAuthMiddleware } from '../../../../../middleware/auth-middleware'
import { requireRole } from '../../../../../middleware/role-guard'
import { PayloadGradebookService } from '../../../../../services/gradebook'
import { getPayloadInstance } from '../../../../../services/progress'

const auth = createAuthMiddleware(userStore, sessionStore, jwtService)

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/gradebook/course/[id] — returns gradebook for all students in a course (instructor view)
export const GET = async (request: NextRequest, { params }: RouteParams) => {
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

  const roleError = requireRole('instructor')(authContext)
  if (roleError) {
    return new Response(JSON.stringify({ error: roleError.error }), {
      status: roleError.status,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const user = authContext.user!
  const { id: courseId } = await params

  const payload = await getPayloadInstance()

  // Verify the instructor owns this course (or is an admin)
  const role = (user as { role?: string }).role
  if (role !== 'admin') {
    const course = (await payload.findByID({
      collection: 'courses' as CollectionSlug,
      id: courseId,
    })) as unknown as { instructor?: { id: string | number } }

    const instructorId = course?.instructor?.id
    if (instructorId === undefined || String(instructorId) !== String(user.id)) {
      return new Response(JSON.stringify({ error: 'Not authorized to view this course gradebook' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  const gradebookService = new PayloadGradebookService(payload)

  try {
    const gradebook = await gradebookService.getCourseGradebook(courseId)
    return new Response(JSON.stringify(gradebook), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
