import { NextRequest } from 'next/server'
import { withAuth } from '@/auth/withAuth'
import type { RbacRole } from '@/auth/auth-service'
import { getPayloadInstance } from '@/services/progress'
import { discussionsStore } from '@/collections/Discussions'
import { DiscussionService } from '@/services/discussions'
import type { MinimalUser } from '@/services/discussions'
import type { CollectionSlug } from 'payload'
import type { RichTextContent } from '@/collections/Discussions'

/**
 * GET /api/discussions/[id]
 * Returns a single discussion thread with all replies (threaded).
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
    const postId = params?.id
    if (!postId) {
      return Response.json({ error: 'Missing id parameter' }, { status: 400 })
    }

    try {
      const payload = await getPayloadInstance()

      // Get the post to find its lesson
      const post = discussionsStore.getById(postId)
      if (!post || post.isDeleted) {
        return Response.json({ error: 'Discussion post not found' }, { status: 404 })
      }

      // Fetch the lesson to get the courseId
      const lesson = await payload.findByID({
        collection: 'lessons' as CollectionSlug,
        id: post.lesson,
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

      const thread = await service.getThread(postId)
      if (!thread) {
        return Response.json({ error: 'Discussion post not found' }, { status: 404 })
      }

      return Response.json({ thread }, { status: 200 })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error'
      return Response.json({ error: message }, { status: 500 })
    }
  },
  { optional: true },
)

/**
 * PATCH /api/discussions/[id]
 * Edit own content; instructor/admin can toggle isPinned / isResolved.
 */
export const PATCH = withAuth(
  async (
    request: NextRequest,
    { user },
    routeParams?: { params: Promise<{ id: string }> },
  ) => {
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }

    const params = await routeParams?.params
    const postId = params?.id
    if (!postId) {
      return Response.json({ error: 'Missing id parameter' }, { status: 400 })
    }

    try {
      const body = await request.json()
      const payload = await getPayloadInstance()

      const post = discussionsStore.getById(postId)
      if (!post || post.isDeleted) {
        return Response.json({ error: 'Discussion post not found' }, { status: 404 })
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
        async () => true,
      )

      const isInstructor = user.role === 'instructor' || user.role === 'admin'
      const isAuthor = String(post.author) === String(user.id)

      // Content edit: own post or instructor/admin
      if (body.content !== undefined) {
        if (!isAuthor && !isInstructor) {
          return Response.json(
            { error: 'Forbidden: you can only edit your own posts' },
            { status: 403 },
          )
        }
        const content: RichTextContent = body.content
        if (
          !content ||
          typeof content !== 'object' ||
          !content.root ||
          !Array.isArray(content.root.children)
        ) {
          return Response.json({ error: 'Invalid content format' }, { status: 400 })
        }
        await service.editPost(postId, String(user.id), content)
      }

      // isPinned / isResolved: instructor/admin only
      if (body.isPinned !== undefined || body.isResolved !== undefined) {
        if (!isInstructor) {
          return Response.json(
            { error: 'Forbidden: instructor or admin required' },
            { status: 403 },
          )
        }
        if (body.isPinned === true) {
          await service.pinPost(postId, String(user.id))
        } else if (body.isPinned === false) {
          await service.unpinPost(postId, String(user.id))
        }
        if (body.isResolved === true) {
          await service.resolvePost(postId, String(user.id))
        } else if (body.isResolved === false) {
          await service.unresolvePost(postId, String(user.id))
        }
      }

      const updated = discussionsStore.getById(postId)
      return Response.json({ post: updated }, { status: 200 })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error'
      if (message.includes('Forbidden')) {
        return Response.json({ error: message }, { status: 403 })
      }
      return Response.json({ error: message }, { status: 500 })
    }
  },
)

/**
 * DELETE /api/discussions/[id]
 * Soft delete: own posts; instructor/admin can delete any; admin-only delete of any.
 */
export const DELETE = withAuth(
  async (
    _request: NextRequest,
    { user },
    routeParams?: { params: Promise<{ id: string }> },
  ) => {
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }

    const params = await routeParams?.params
    const postId = params?.id
    if (!postId) {
      return Response.json({ error: 'Missing id parameter' }, { status: 400 })
    }

    try {
      const post = discussionsStore.getById(postId)
      if (!post || post.isDeleted) {
        return Response.json({ error: 'Discussion post not found' }, { status: 404 })
      }

      const payload = await getPayloadInstance()
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
        async () => true,
      )

      await service.deletePost(postId, String(user.id), user.role)

      return new Response(null, { status: 204 })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error'
      if (message.includes('Forbidden')) {
        return Response.json({ error: message }, { status: 403 })
      }
      if (message.includes('not found')) {
        return Response.json({ error: message }, { status: 404 })
      }
      return Response.json({ error: message }, { status: 500 })
    }
  },
)
