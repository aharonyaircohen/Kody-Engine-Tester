import { NextRequest } from 'next/server'
import type { CollectionSlug } from 'payload'
import { userStore, sessionStore, jwtService } from '../../../auth'
import { createAuthMiddleware } from '../../../middleware/auth-middleware'
import { requireRole } from '../../../middleware/role-guard'
import { getPayloadInstance } from '../../../services/progress'
import { createErrorResponse, createJsonResponse } from '../../../utils/api-response'

const auth = createAuthMiddleware(userStore, sessionStore, jwtService)

export const POST = async (request: NextRequest) => {
  const authContext = await auth({
    authorization: request.headers.get('authorization') || undefined,
    ip: request.headers.get('x-forwarded-for') || undefined,
  })

  if (authContext.error) {
    return createErrorResponse(authContext.error, authContext.status ?? 401)
  }

  const roleError = requireRole('student')(authContext)
  if (roleError) {
    return createErrorResponse(roleError.error, roleError.status)
  }

  const user = authContext.user!
  const body = await request.json()
  const { courseId } = body

  if (!courseId) {
    return createErrorResponse('courseId is required', 400)
  }

  const payload = await getPayloadInstance()

  // Check for existing enrollment
  const existing = await payload.find({
    collection: 'enrollments' as CollectionSlug,
    where: {
      student: { equals: user.id },
      course: { equals: courseId },
    },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    return createErrorResponse('Already enrolled in this course', 409)
  }

  // Fetch the course to check maxEnrollments
  const course = (await payload.findByID({
    collection: 'courses' as CollectionSlug,
    id: courseId,
  })) as unknown as { maxEnrollments: number }

  const maxEnrollments = course.maxEnrollments

  // Count active enrollments for this course
  const { totalDocs: activeCount } = await payload.find({
    collection: 'enrollments' as CollectionSlug,
    where: {
      course: { equals: courseId },
      status: { equals: 'active' },
    },
    limit: 0,
  })

  if (activeCount >= maxEnrollments) {
    return createErrorResponse('Course has reached maximum enrollment capacity', 403)
  }

  const enrollment = await payload.create({
    collection: 'enrollments' as CollectionSlug,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: {
      student: user.id,
      course: courseId,
      enrolledAt: new Date().toISOString(),
      status: 'active',
      completedLessons: [],
    } as any,
  })

  return createJsonResponse(enrollment, 201)
}
