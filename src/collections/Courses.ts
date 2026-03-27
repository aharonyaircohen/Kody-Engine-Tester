import type { CollectionConfig } from 'payload'

export const Courses: CollectionConfig = {
  slug: 'courses',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
  ],
}
