import type { Payload } from 'payload'
import type { CollectionSlug } from 'payload'
import type { User } from '../auth/user-store'
import type { RbacRole } from '../auth/auth-service'

export type MinimalUser = {
  id: string
  email: string
  role: RbacRole
  isActive: boolean
}
import type { RichTextContent } from '../collections/Discussions'
import { DiscussionsStore } from '../collections/Discussions'
import { EnrollmentStore } from '../collections/EnrollmentStore'
import { NotificationService } from './notifications'

export interface DiscussionThread {
  post: {
    id: string
    lesson: string
    author: string
    content: RichTextContent
    parentPost: string | null
    isPinned: boolean
    isResolved: boolean
    isDeleted: boolean
    createdAt: Date
    updatedAt: Date
  }
  replies: DiscussionThread[]
  replyCount: number
}

export type EnrollmentChecker = (userId: string, courseId: string) => Promise<boolean> | boolean

function getThreadDepth(
  postId: string | null,
  postsById: Map<string, ReturnType<DiscussionsStore['getById']> & { id: string }>,
  depth = 0,
): number {
  if (depth >= 3 || !postId) return depth
  const parent = postsById.get(postId)
  if (!parent?.parentPost) return depth + 1
  return getThreadDepth(parent.parentPost, postsById, depth + 1)
}

/**
 * Check if a user is enrolled in a course (Payload-backed).
 */
async function payloadEnrollmentChecker(
  payload: Payload,
  userId: string,
  courseId: string,
): Promise<boolean> {
  const result = await payload.find({
    collection: 'enrollments' as CollectionSlug,
    where: {
      student: { equals: userId },
      course: { equals: courseId },
      status: { equals: 'active' },
    },
    limit: 1,
  })
  return result.docs.length > 0
}

export class DiscussionService {
  constructor(
    private store: DiscussionsStore,
    private enrollmentStore: EnrollmentStore,
    private getUser: (id: string) => Promise<MinimalUser | undefined>,
    private enrollmentChecker: EnrollmentChecker,
    private notificationService?: NotificationService,
  ) {}

  /**
   * Creates a DiscussionService with Payload-backed enrollment checking.
   */
  static async withPayload(
    store: DiscussionsStore,
    payload: Payload,
    notificationService?: NotificationService,
  ): Promise<DiscussionService> {
    return new DiscussionService(
      store,
      new EnrollmentStore(),
      async (id: string) => {
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
          role: (doc as any).role,
          isActive: (doc as any).isActive ?? true,
        }
      },
      (userId: string, courseId: string) =>
        payloadEnrollmentChecker(payload, userId, courseId),
      notificationService,
    )
  }

  async getThreads(lessonId: string): Promise<DiscussionThread[]> {
    const all = this.store.getByLesson(lessonId)
    const postsById = new Map(all.map((p) => [p.id, p]))

    // Top-level posts only (no parent)
    const topLevel = all.filter((p) => p.parentPost === null)

    // Sort: pinned first, then by date
    const sorted = topLevel.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return b.createdAt.getTime() - a.createdAt.getTime()
    })

    const buildReplies = (parentId: string, depth: number): DiscussionThread[] => {
      if (depth >= 3) return []
      return this.store
        .getReplies(parentId)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((post) => ({
          post,
          replies: buildReplies(post.id, depth + 1),
          replyCount: this.store.getReplyCount(post.id),
        }))
    }

    return sorted.map((post) => ({
      post,
      replies: buildReplies(post.id, 1),
      replyCount: this.store.getReplyCount(post.id),
    }))
  }

  async getThread(postId: string): Promise<DiscussionThread | null> {
    const post = this.store.getById(postId)
    if (!post || post.isDeleted) return null

    const buildReplies = (parentId: string, depth: number): DiscussionThread[] => {
      if (depth >= 3) return []
      return this.store
        .getReplies(parentId)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((p) => ({
          post: p,
          replies: buildReplies(p.id, depth + 1),
          replyCount: this.store.getReplyCount(p.id),
        }))
    }

    return {
      post,
      replies: buildReplies(postId, 1),
      replyCount: this.store.getReplyCount(postId),
    }
  }

  async createPost(
    lessonId: string,
    authorId: string,
    content: RichTextContent,
    courseId: string,
    parentId?: string,
  ): Promise<{ id: string }> {
    const user = await this.getUser(authorId)
    if (!user) {
      throw new Error('User not found')
    }

    if (!(await this.enrollmentChecker(user.id, courseId))) {
      throw new Error('Not enrolled in this course')
    }

    // If replying, check depth limit
    if (parentId) {
      const parent = this.store.getById(parentId)
      if (!parent) {
        throw new Error('Parent post not found')
      }
      const parentDepth = getThreadDepth(
        parent.parentPost,
        new Map(this.store.getAll().map((p) => [p.id, p])),
        0,
      )
      const replyDepth = getThreadDepth(
        parentId,
        new Map(this.store.getAll().map((p) => [p.id, p])),
        0,
      )
      if (replyDepth >= 3) {
        throw new Error('Maximum reply depth (3) reached')
      }
    }

    const post = this.store.create({
      lesson: lessonId,
      author: authorId,
      content,
      parentPost: parentId ?? null,
    })

    // Trigger notification if this is a reply
    if (parentId && this.notificationService) {
      const parentPost = this.store.getById(parentId)
      if (parentPost && parentPost.author !== authorId) {
        const parentAuthor = await this.getUser(parentPost.author)
        if (parentAuthor) {
          const replyPreview =
            content.root.children?.[0]?.text?.slice(0, 80) ?? 'New reply'
          await this.notificationService.notify(
            parentPost.author,
            'discussion_reply',
            'New reply to your post',
            replyPreview,
            `/discussions/${post.id}`,
          )
        }
      }
    }

    return { id: post.id }
  }

  async editPost(postId: string, userId: string, content: RichTextContent): Promise<void> {
    const post = this.store.getById(postId)
    if (!post || post.isDeleted) {
      throw new Error('Post not found')
    }
    if (String(post.author) !== userId) {
      throw new Error('Forbidden: you can only edit your own posts')
    }
    this.store.update(postId, { content })
  }

  async deletePost(postId: string, userId: string, userRole: string): Promise<void> {
    const post = this.store.getById(postId)
    if (!post || post.isDeleted) {
      throw new Error('Post not found')
    }

    // Admin can delete any; others can only delete their own
    if (userRole !== 'admin' && String(post.author) !== userId) {
      throw new Error('Forbidden: you can only delete your own posts')
    }

    this.store.softDelete(postId)
  }

  async pinPost(postId: string, userId: string): Promise<void> {
    const user = await this.getUser(userId)
    if (!user) {
      throw new Error('User not found')
    }
    if (user.role !== 'instructor' && user.role !== 'admin') {
      throw new Error('Forbidden: instructor or admin required')
    }
    this.store.pin(postId)
  }

  async unpinPost(postId: string, userId: string): Promise<void> {
    const user = await this.getUser(userId)
    if (!user) {
      throw new Error('User not found')
    }
    if (user.role !== 'instructor' && user.role !== 'admin') {
      throw new Error('Forbidden: instructor or admin required')
    }
    this.store.unpin(postId)
  }

  async resolvePost(postId: string, userId: string): Promise<void> {
    const user = await this.getUser(userId)
    if (!user) {
      throw new Error('User not found')
    }
    if (user.role !== 'instructor' && user.role !== 'admin') {
      throw new Error('Forbidden: instructor or admin required')
    }
    this.store.resolve(postId)
  }

  async unresolvePost(postId: string, userId: string): Promise<void> {
    const user = await this.getUser(userId)
    if (!user) {
      throw new Error('User not found')
    }
    if (user.role !== 'instructor' && user.role !== 'admin') {
      throw new Error('Forbidden: instructor or admin required')
    }
    this.store.unresolve(postId)
  }
}
