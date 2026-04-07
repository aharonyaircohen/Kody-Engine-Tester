import type { CollectionConfig } from 'payload'

export const Courses: CollectionConfig = {
  slug: 'courses',
  admin: {
    useAsTitle: 'title',
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  access: {
    create: ({ req: { user } }) => {
      if (!user) return false
      const role = (user as { role?: string }).role
      return role === 'editor' || role === 'admin'
    },
    update: ({ req: { user }, data }) => {
      if (!user) return false
      const role = (user as { role?: string }).role
      if (role === 'admin') return true
      if (role !== 'editor') return false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docInstructorId = (data as any)?.instructor?.id as string | undefined
      return docInstructorId === String(user.id)
    },
    read: ({ req, doc }: { req: { user?: { id: string | number; role?: string } }; doc?: Record<string, unknown> }) => {
      const user = req.user
      if (!user) return false
      const role = user.role
      const status = doc?.status as string | undefined
      if (status === 'published') return true
      if (role === 'admin') return true
      if (role !== 'editor') return false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docInstructorId = (doc as any)?.instructor?.id as string | undefined
      return docInstructorId === String(user.id)
    },
  } as CollectionConfig['access'],
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            if (siblingData.title) {
              return siblingData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
            }
            return undefined
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
    },
    {
      name: 'thumbnail',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'instructor',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: ['draft', 'published', 'archived'],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'difficulty',
      type: 'select',
      options: ['beginner', 'intermediate', 'advanced'],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'estimatedHours',
      type: 'number',
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
        },
      ],
    },
    {
      name: 'maxEnrollments',
      type: 'number',
    },
    {
      name: 'quizWeight',
      type: 'number',
      defaultValue: 40,
      admin: {
        description: 'Percentage weight of quizzes in overall grade (e.g. 40 = 40%)',
      },
    },
    {
      name: 'assignmentWeight',
      type: 'number',
      defaultValue: 60,
      admin: {
        description: 'Percentage weight of assignments in overall grade (e.g. 60 = 60%)',
      },
    },
  ],
}
