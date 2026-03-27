import type { CollectionConfig } from 'payload'

export const Courses: CollectionConfig = {
  slug: 'courses',
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
      name: 'maxEnrollments',
      type: 'number',
      required: true,
      defaultValue: 10,
      min: 1,
    },
  ],
}
