import { NextRequest } from 'next/server'
import { withAuth } from '@/auth/withAuth'
import type { RbacRole } from '@/auth/auth-service'
import { getPayloadInstance } from '@/services/progress'
import { discussionsStore } from '@/collections/Discussions'
import { DiscussionService } from '@/services/discussions'
import type { MinimalUser } from '@/services/discussions'
import { NotificationService } from '@/services/notifications'
import type { CollectionSlug } from 'payload'
import type { RichTextContent } from '@/collections/Discussions'

/**
 * GET /api/lessons/[id]/discussions
 * Returns top-level threads for a lesson (pinned-first, newest), with reply counts.
 * Requires user to be enrolled in the course that contains the lesson.
 */
export const GET = withAuth(
  async (
    _request: NextRequest,
    { user },
    routeParams?: { params: Promise<{ id: string }> },
  ) => {
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }

    const params = await routeParams?.params
    const lessonId = params?.id
    if (!lessonId) {
      return Response.json({ error: 'Missing lesson id parameter' }, { status: 400 })
    }

    try {
      const payload = await getPayloadInstance()

      // Fetch the lesson to get the courseId
      const lesson = await payload.findByID({
        collection: 'lessons' as CollectionSlug,
        id: lessonId,
      })
      const lessonDoc = lesson as { course?: string | { id: string } }
      const courseId =
        typeof lessonDoc.course === 'string'
          ? lessonDoc.course
          : (lessonDoc.course as { id: string })?.id

      if (!courseId) {
        return Response.json({ error: 'Lesson not found or has no course' }, { status: 404 })
      }

      // Check enrollment
      const enrollment = await payload.find({
        collection: 'enrollments' as CollectionSlug,
        where: {
          student: { equals: user.id },
          course: { equals: courseId },
          status: { equals: 'active' },
        },
        limit: 1,
      })

      const isInstructor = user.role === 'instructor' || user.role === 'admin'
      if (enrollment.docs.length === 0 && !isInstructor) {
        return Response.json({ error: 'Forbidden: not enrolled in this course' }, { status: 403 })
      }

      const service = new DiscussionService(
        discussionsStore,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {} as any,
        async (id: string): Promise<MinimalUser | undefined> => {
          const users = await payload.find({
            collection: 'users' as CollectionSlug,
            where: { id: { equals: id } },
            limit: 1,
          })
          const doc = users.docs[0]
          if (!doc) return undefined
          return {
            id: String((doc as any).id),
            email: (doc as any).email,
            role: (doc as any).role as RbacRole,
            isActive: (doc as any).isActive ?? true,
          }
        },
        async (userId: string, cId: string) => {
          const check = await payload.find({
            collection: 'enrollments' as CollectionSlug,
            where: {
              student: { equals: userId },
              course: { equals: cId },
              status: { equals: 'active' },
            },
            limit: 1,
          })
          return check.docs.length > 0
        },
      )

      const threads = await service.getThreads(lessonId)

      return Response.json({ threads }, { status: 200 })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error'
      return Response.json({ error: message }, { status: 500 })
    }
  },
  { optional: true },
)

/**
 * POST /api/lessons/[id]/discussions
 * Creates a top-level post or reply for a lesson.
 * Requires auth; user must be enrolled in the course that contains the lesson.
 */
export const POST = withAuth(
  async (
    request: NextRequest,
    { user },
    routeParams?: { params: Promise<{ id: string }> },
  ) => {
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }

    const params = await routeParams?.params
    const lessonId = params?.id
    if (!lessonId) {
      return Response.json({ error: 'Missing lesson id parameter' }, { status: 400 })
    }

    try {
      const body = await request.json()
      const content: RichTextContent = body.content
      const parentPost: string | undefined = body.parentPost
      const courseId: string = body.courseId

      if (!content || !courseId) {
        return Response.json(
          { error: 'content and courseId are required' },
          { status: 400 },
        )
      }

      // Validate rich text structure minimally
      if (
        !content ||
        typeof content !== 'object' ||
        !content.root ||
        !Array.isArray(content.root.children)
      ) {
        return Response.json({ error: 'Invalid content format' }, { status: 400 })
      }

      const payload = await getPayloadInstance()
      const notificationService = new NotificationService(payload)

      // Check enrollment
      const enrollment = await payload.find({
        collection: 'enrollments' as CollectionSlug,
        where: {
          student: { equals: user.id },
          course: { equals: courseId },
          status: { equals: 'active' },
        },
        limit: 1,
      })

      const isInstructor = user.role === 'instructor' || user.role === 'admin'
      if (enrollment.docs.length === 0 && !isInstructor) {
        return Response.json(
          { error: 'Forbidden: not enrolled in this course' },
          { status: 403 },
        )
      }

      const service = new DiscussionService(
        discussionsStore,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {} as any,
        async (id: string): Promise<MinimalUser | undefined> => {
          const users = await payload.find({
            collection: 'users' as CollectionSlug,
            where: { id: { equals: id } },
            limit: 1,
          })
          const doc = users.docs[0]
          if (!doc) return undefined
          return {
            id: String((doc as any).id),
            email: (doc as any).email,
            role: (doc as any).role as RbacRole,
            isActive: (doc as any).isActive ?? true,
          }
        },
        async (userId: string, cId: string) => {
          const check = await payload.find({
            collection: 'enrollments' as CollectionSlug,
            where: {
              student: { equals: userId },
              course: { equals: cId },
              status: { equals: 'active' },
            },
            limit: 1,
          })
          return check.docs.length > 0
        },
        notificationService,
      )

      const result = await service.createPost(
        lessonId,
        String(user.id),
        content,
        courseId,
        parentPost,
      )

      return Response.json({ id: result.id }, { status: 201 })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error'
      if (message.includes('Not enrolled') || message.includes('Forbidden')) {
        return Response.json({ error: message }, { status: 403 })
      }
      if (message.includes('not found')) {
        return Response.json({ error: message }, { status: 404 })
      }
      return Response.json({ error: message }, { status: 500 })
    }
  },
)
