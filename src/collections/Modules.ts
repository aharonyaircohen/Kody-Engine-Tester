import type { CollectionConfig, CollectionSlug } from 'payload'

export interface Module {
  id: string
  title: string
  courseId: string
  order: number
  description: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateModuleInput {
  title: string
  courseId: string
  order?: number
  description?: string
}

export type UpdateModuleInput = Partial<{
  title: string
  courseId: string
  order: number
  description: string
}>

export class ModuleStore {
  private modules: Map<string, Module> = new Map()

  getAll(): Module[] {
    return Array.from(this.modules.values()).sort((a, b) => a.order - b.order)
  }

  getById(id: string): Module | null {
    return this.modules.get(id) ?? null
  }

  getByCourse(courseId: string): Module[] {
    return this.getAll().filter((m) => m.courseId === courseId)
  }

  create(input: CreateModuleInput): Module {
    if (!input.courseId) {
      throw new Error('courseId is required')
    }

    const now = new Date()
    const existingInCourse = this.getByCourse(input.courseId)
    const maxOrder =
      existingInCourse.length > 0
        ? Math.max(...existingInCourse.map((m) => m.order))
        : -1

    const mod: Module = {
      id: crypto.randomUUID(),
      title: input.title,
      courseId: input.courseId,
      order: input.order ?? maxOrder + 1,
      description: input.description ?? '',
      createdAt: now,
      updatedAt: now,
    }
    this.modules.set(mod.id, mod)
    return mod
  }

  update(id: string, input: UpdateModuleInput): Module {
    const mod = this.modules.get(id)
    if (!mod) {
      throw new Error(`Module with id "${id}" not found`)
    }
    if (input.courseId !== undefined && input.courseId === '') {
      throw new Error('courseId is required')
    }
    const updated: Module = { ...mod, ...input, updatedAt: new Date() }
    this.modules.set(id, updated)
    return updated
  }

  delete(id: string): boolean {
    return this.modules.delete(id)
  }
}

export const moduleStore = new ModuleStore()

export const Modules: CollectionConfig = {
  slug: 'modules',
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
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'description',
      type: 'text',
    },
  ],
}
