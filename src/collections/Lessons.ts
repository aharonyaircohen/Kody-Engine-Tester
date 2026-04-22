import type { CollectionConfig, CollectionSlug } from 'payload'

export type LessonType = 'text' | 'video' | 'interactive'

export interface Lesson {
  id: string
  title: string
  moduleId: string
  order: number
  type: LessonType
  content: string
  videoUrl: string | null
  estimatedMinutes: number | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateLessonInput {
  title: string
  moduleId: string
  order?: number
  type?: LessonType
  content?: string
  videoUrl?: string | null
  estimatedMinutes?: number | null
}

export type UpdateLessonInput = Partial<{
  title: string
  moduleId: string
  order: number
  type: LessonType
  content: string
  videoUrl: string | null
  estimatedMinutes: number | null
}>

export class LessonStore {
  private lessons: Map<string, Lesson> = new Map()

  getAll(): Lesson[] {
    return Array.from(this.lessons.values()).sort((a, b) => a.order - b.order)
  }

  getById(id: string): Lesson | null {
    return this.lessons.get(id) ?? null
  }

  getByModule(moduleId: string): Lesson[] {
    return this.getAll().filter((l) => l.moduleId === moduleId)
  }

  create(input: CreateLessonInput): Lesson {
    if (!input.moduleId) {
      throw new Error('moduleId is required')
    }

    const now = new Date()
    const existingInModule = this.getByModule(input.moduleId)
    const maxOrder =
      existingInModule.length > 0
        ? Math.max(...existingInModule.map((l) => l.order))
        : -1

    const lesson: Lesson = {
      id: crypto.randomUUID(),
      title: input.title,
      moduleId: input.moduleId,
      order: input.order ?? maxOrder + 1,
      type: input.type ?? 'text',
      content: input.content ?? '',
      videoUrl: input.videoUrl ?? null,
      estimatedMinutes: input.estimatedMinutes ?? null,
      createdAt: now,
      updatedAt: now,
    }
    this.lessons.set(lesson.id, lesson)
    return lesson
  }

  update(id: string, input: UpdateLessonInput): Lesson {
    const lesson = this.lessons.get(id)
    if (!lesson) {
      throw new Error(`Lesson with id "${id}" not found`)
    }
    if (input.moduleId !== undefined && input.moduleId === '') {
      throw new Error('moduleId is required')
    }

    const updated: Lesson = { ...lesson, ...input, updatedAt: new Date() }
    if (input.type !== undefined && input.type !== 'video') {
      updated.videoUrl = null
    }
    this.lessons.set(id, updated)
    return updated
  }

  delete(id: string): boolean {
    return this.lessons.delete(id)
  }

  search(
    opts: { query?: string; maxMinutes?: number } = {},
    moduleId?: string,
  ): Lesson[] {
    const { query, maxMinutes } = opts

    let results = Array.from(this.lessons.values())

    if (moduleId !== undefined) {
      results = results.filter((l) => l.moduleId === moduleId)
    }

    if (query && query.trim() !== '') {
      const lower = query.toLowerCase()
      results = results.filter((l) => l.title.toLowerCase().includes(lower))
    }

    if (maxMinutes !== undefined && maxMinutes !== null && maxMinutes > 0) {
      results = results.filter(
        (l) => l.estimatedMinutes === null || l.estimatedMinutes <= maxMinutes,
      )
    }

    return results.sort((a, b) => a.order - b.order)
  }
}

export const lessonStore = new LessonStore()

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    create: ({ req: { user } }) => {
      if (!user) return false
      const role = (user as { role?: string }).role
      return role === 'instructor' || role === 'admin'
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      const role = (user as { role?: string }).role
      return role === 'instructor' || role === 'admin'
    },
    read: ({ req: { user } }) => {
      return !!user
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      const role = (user as { role?: string }).role
      return role === 'admin'
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses' as CollectionSlug,
      required: true,
    },
    {
      name: 'module',
      type: 'text',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'type',
      type: 'select',
      options: ['video', 'text', 'interactive'],
      defaultValue: 'text',
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'videoUrl',
      type: 'text',
    },
    {
      name: 'estimatedMinutes',
      type: 'number',
    },
  ],
}
