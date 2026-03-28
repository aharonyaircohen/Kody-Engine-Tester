export interface RichTextContent {
  root: {
    children: Array<{
      text?: string
      type?: string
      children?: Array<{ text: string }>
    }>
  }
}

export interface DiscussionPost {
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

export interface CreatePostInput {
  lesson: string
  author: string
  content: RichTextContent
  parentPost?: string | null
}

export type UpdatePostInput = Partial<{
  content: RichTextContent
  isPinned: boolean
  isResolved: boolean
}>

export class DiscussionsStore {
  private posts: Map<string, DiscussionPost> = new Map()

  getAll(): DiscussionPost[] {
    return Array.from(this.posts.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    )
  }

  getById(id: string): DiscussionPost | null {
    return this.posts.get(id) ?? null
  }

  create(input: CreatePostInput): DiscussionPost {
    const now = new Date()
    const post: DiscussionPost = {
      id: crypto.randomUUID(),
      lesson: input.lesson,
      author: input.author,
      content: input.content,
      parentPost: input.parentPost ?? null,
      isPinned: false,
      isResolved: false,
      createdAt: now,
      updatedAt: now,
    }
    this.posts.set(post.id, post)
    return post
  }

  update(id: string, input: UpdatePostInput): DiscussionPost {
    const post = this.posts.get(id)
    if (!post) {
      throw new Error(`Discussion post with id "${id}" not found`)
    }
    const updated: DiscussionPost = {
      ...post,
      ...input,
      updatedAt: new Date(),
    }
    this.posts.set(id, updated)
    return updated
  }

  delete(id: string): boolean {
    return this.posts.delete(id)
  }

  getByLesson(lessonId: string): DiscussionPost[] {
    return this.getAll().filter((p) => p.lesson === lessonId)
  }

  getReplies(parentId: string): DiscussionPost[] {
    return this.getAll().filter((p) => p.parentPost === parentId)
  }

  pin(id: string): DiscussionPost {
    return this.update(id, { isPinned: true })
  }

  unpin(id: string): DiscussionPost {
    return this.update(id, { isPinned: false })
  }

  resolve(id: string): DiscussionPost {
    return this.update(id, { isResolved: true })
  }

  unresolve(id: string): DiscussionPost {
    return this.update(id, { isResolved: false })
  }
}

export const discussionsStore = new DiscussionsStore()
