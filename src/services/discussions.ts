import type { User } from '../auth/user-store'
import type { RichTextContent } from '../collections/Discussions'
import { DiscussionsStore } from '../collections/Discussions'
import type { EnrollmentStore } from '../collections/EnrollmentStore'

export interface DiscussionThread {
  post: {
    id: string
    lesson: string
    author: string
    content: RichTextContent
    parentPost: string | null
    isPinned: boolean
    isResolved: boolean
    createdAt: Date
    updatedAt: Date
  }
  replies: DiscussionThread[]
}

export type EnrollmentChecker = (userId: string, courseId: string) => boolean

function getThreadDepth(postId: string | null, postsById: Map<string, ReturnType<DiscussionsStore['getById']> & { id: string }>, depth = 0): number {
  if (depth >= 3 || !postId) return depth
  const parent = postsById.get(postId)
  if (!parent?.parentPost) return depth + 1
  return getThreadDepth(parent.parentPost, postsById, depth + 1)
}

export class DiscussionService {
  constructor(
    private store: DiscussionsStore,
    private enrollmentStore: EnrollmentStore,
    private getUser: (id: string) => Promise<User | undefined>,
    private enrollmentChecker: EnrollmentChecker,
  ) {}

  async getThreads(lessonId: string): Promise<DiscussionThread[]> {
    const all = this.store.getByLesson(lessonId)
    const postsById = new Map(
      all.map((p) => [p.id, p]),
    )

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
        }))
    }

    return sorted.map((post) => ({
      post,
      replies: buildReplies(post.id, 1),
    }))
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

    if (!this.enrollmentChecker(user.id, courseId)) {
      throw new Error('Not enrolled in this course')
    }

    // If replying, check depth limit
    if (parentId) {
      const parent = this.store.getById(parentId)
      if (!parent) {
        throw new Error('Parent post not found')
      }
      const parentDepth = getThreadDepth(parent.parentPost, new Map(this.store.getAll().map((p) => [p.id, p])), 0)
      const replyDepth = getThreadDepth(parentId, new Map(this.store.getAll().map((p) => [p.id, p])), 0)
      if (replyDepth >= 3) {
        throw new Error('Maximum reply depth (3) reached')
      }
    }

    const post = this.store.create({ lesson: lessonId, author: authorId, content, parentPost: parentId ?? null })
    return { id: post.id }
  }

  async pinPost(postId: string, userId: string): Promise<void> {
    const user = await this.getUser(userId)
    if (!user) {
      throw new Error('User not found')
    }
    if (!user.roles.includes('editor') && !user.roles.includes('admin')) {
      throw new Error('Forbidden: editor or admin required')
    }
    this.store.pin(postId)
  }

  async unpinPost(postId: string, userId: string): Promise<void> {
    const user = await this.getUser(userId)
    if (!user) {
      throw new Error('User not found')
    }
    if (!user.roles.includes('editor') && !user.roles.includes('admin')) {
      throw new Error('Forbidden: editor or admin required')
    }
    this.store.unpin(postId)
  }

  async resolvePost(postId: string, userId: string): Promise<void> {
    const user = await this.getUser(userId)
    if (!user) {
      throw new Error('User not found')
    }
    if (!user.roles.includes('editor') && !user.roles.includes('admin')) {
      throw new Error('Forbidden: editor or admin required')
    }
    this.store.resolve(postId)
  }

  async unresolvePost(postId: string, userId: string): Promise<void> {
    const user = await this.getUser(userId)
    if (!user) {
      throw new Error('User not found')
    }
    if (!user.roles.includes('editor') && !user.roles.includes('admin')) {
      throw new Error('Forbidden: editor or admin required')
    }
    this.store.unresolve(postId)
  }
}
