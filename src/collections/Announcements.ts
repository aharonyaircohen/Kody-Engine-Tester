import type { CollectionConfig, CollectionSlug } from 'payload'

export type AnnouncementPriority = 'low' | 'medium' | 'high'

export interface Announcement {
  id: string
  title: string
  body: string
  course: string
  priority: AnnouncementPriority
  publishedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateAnnouncementInput {
  title: string
  body: string
  course: string
  priority?: AnnouncementPriority
  publishedAt?: Date
}

export type UpdateAnnouncementInput = Partial<{
  title: string
  body: string
  course: string
  priority: AnnouncementPriority
  publishedAt: Date
}>

export class AnnouncementsStore {
  private announcements: Map<string, Announcement> = new Map()

  getAll(): Announcement[] {
    return Array.from(this.announcements.values()).sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
    )
  }

  getById(id: string): Announcement | null {
    return this.announcements.get(id) ?? null
  }

  create(input: CreateAnnouncementInput): Announcement {
    const now = new Date()
    const announcement: Announcement = {
      id: crypto.randomUUID(),
      title: input.title,
      body: input.body,
      course: input.course,
      priority: input.priority ?? 'low',
      publishedAt: input.publishedAt ?? now,
      createdAt: now,
      updatedAt: now,
    }
    this.announcements.set(announcement.id, announcement)
    return announcement
  }

  update(id: string, input: UpdateAnnouncementInput): Announcement {
    const announcement = this.announcements.get(id)
    if (!announcement) {
      throw new Error(`Announcement with id "${id}" not found`)
    }
    const updated: Announcement = {
      ...announcement,
      ...input,
      updatedAt: new Date(),
    }
    this.announcements.set(id, updated)
    return updated
  }

  delete(id: string): boolean {
    return this.announcements.delete(id)
  }

  getByCourse(courseId: string): Announcement[] {
    return this.getAll().filter((a) => a.course === courseId)
  }

  getByPriority(priority: AnnouncementPriority): Announcement[] {
    return this.getAll().filter((a) => a.priority === priority)
  }

  getPublished(): Announcement[] {
    const now = new Date()
    return this.getAll().filter((a) => a.publishedAt <= now)
  }

  getUpcoming(): Announcement[] {
    const now = new Date()
    return this.getAll().filter((a) => a.publishedAt > now)
  }
}

export const announcementsStore = new AnnouncementsStore()

export const Announcements: CollectionConfig = {
  slug: 'announcements',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'course', 'priority', 'publishedAt'],
  },
  access: {
    create: ({ req: { user } }) => {
      if (!user) return false
      const role = (user as { role?: string }).role
      return role === 'instructor' || role === 'admin'
    },
    update: ({ req: { user }, data }) => {
      if (!user) return false
      const role = (user as { role?: string }).role
      if (role === 'admin') return true
      if (role !== 'instructor') return false
      // Instructors can only edit their own course announcements
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const _docCourse = (data as any)?.course as string | undefined
      // For now, allow instructors to edit any announcement
      // In a real implementation, check if instructor owns the course
      return true
    },
    read: ({ req: { user } }) => {
      if (!user) return false
      const role = (user as { role?: string }).role
      // All authenticated users can read announcements
      return role === 'student' || role === 'instructor' || role === 'admin'
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      const role = (user as { role?: string }).role
      return role === 'instructor' || role === 'admin'
    },
  } as CollectionConfig['access'],
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses' as CollectionSlug,
      required: true,
    },
    {
      name: 'priority',
      type: 'select',
      required: true,
      defaultValue: 'low',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      admin: {
        description: 'When this announcement will be visible to students',
      },
    },
  ],
  timestamps: true,
}
