import type { CollectionConfig, CollectionSlug } from 'payload'

export interface Lesson {
  id: string
  title: string
  moduleId: string
  order: number
  type: 'text' | 'video' | 'quiz' | 'assignment'
  content: string
  videoUrl: string | null
  estimatedMinutes: number | null
  createdAt: Date
  updatedAt: Date
}

type CreateLessonInput = Pick<Lesson, 'title' | 'moduleId'> &
  Partial<Pick<Lesson, 'order' | 'type' | 'content' | 'videoUrl' | 'estimatedMinutes'>>

type UpdateLessonInput = Partial<Pick<Lesson, 'title' | 'moduleId' | 'order' | 'type' | 'content' | 'videoUrl' | 'estimatedMinutes'>>

export class LessonStore {
  private lessons: Map<string, Lesson> = new Map()
  private maxOrder: Map<string, number> = new Map()
  private nextId = 1

  create(input: CreateLessonInput): Lesson {
    if (!input.moduleId) throw new Error('moduleId is required')

    const now = new Date()
    const order =
      input.order !== undefined
        ? input.order
        : (this.maxOrder.get(input.moduleId) ?? -1) + 1

    const lesson: Lesson = {
      id: String(this.nextId++),
      title: input.title,
      moduleId: input.moduleId,
      order,
      type: input.type ?? 'text',
      content: input.content ?? '',
      videoUrl: input.videoUrl ?? null,
      estimatedMinutes: input.estimatedMinutes ?? null,
      createdAt: now,
      updatedAt: now,
    }

    this.lessons.set(lesson.id, lesson)
    this.maxOrder.set(input.moduleId, Math.max(this.maxOrder.get(input.moduleId) ?? -1, order))
    return lesson
  }

  getAll(): Lesson[] {
    return Array.from(this.lessons.values()).sort((a, b) => a.order - b.order)
  }

  getById(id: string): Lesson | null {
    return this.lessons.get(id) ?? null
  }

  getByModule(moduleId: string): Lesson[] {
    return Array.from(this.lessons.values())
      .filter((l) => l.moduleId === moduleId)
      .sort((a, b) => a.order - b.order)
  }

  update(id: string, updates: UpdateLessonInput): Lesson {
    const existing = this.lessons.get(id)
    if (!existing) throw new Error(`Lesson with id "${id}" not found`)

    if (updates.moduleId !== undefined && updates.moduleId === '') {
      throw new Error('moduleId is required')
    }

    const updated: Lesson = {
      ...existing,
      ...updates,
      id, // always preserve original id — cannot be changed via update
      updatedAt: new Date(),
    }

    if (updates.type && updates.type !== 'video') {
      updated.videoUrl = null
    }

    this.lessons.set(id, updated)
    // Reorder is implicit — getByModule sorts by order, so other lessons stay in place
    return this.lessons.get(id)!
  }

  delete(id: string): boolean {
    return this.lessons.delete(id)
  }
}

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  admin: {
    useAsTitle: 'title',
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
  ],
}
