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
 * POST /api/discussions
 * Creates a top-level post or reply.
 * Auth required; user must be enrolled in the course that contains the lesson.
 * The lesson and course are specified in the request body.
 */
export const POST = withAuth(async (request: NextRequest, { user }) => {
  if (!user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const lessonId: string | undefined = body.lesson
    const courseId: string | undefined = body.courseId
    const content: RichTextContent | undefined = body.content
    const parentPost: string | undefined = body.parentPost

    if (!lessonId || !courseId || !content) {
      return Response.json(
        { error: 'lesson, courseId, and content are required' },
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
    if (
      message.includes('Not enrolled') ||
      message.includes('Forbidden') ||
      message.includes('enrolled')
    ) {
      return Response.json({ error: message }, { status: 403 })
    }
    if (message.includes('not found') || message.includes('Parent')) {
      return Response.json({ error: message }, { status: 404 })
    }
    if (message.includes('depth')) {
      return Response.json({ error: message }, { status: 400 })
    }
    return Response.json({ error: message }, { status: 500 })
  }
})
