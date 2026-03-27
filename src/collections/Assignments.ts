import type { CollectionConfig } from 'payload'

export const Assignments: CollectionConfig = {
  slug: 'assignments',
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
      name: 'module',
      type: 'relationship',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      relationTo: 'modules' as any,
      required: true,
      admin: {
        description: 'The module this assignment belongs to.',
      },
    },
    {
      name: 'instructions',
      type: 'richText',
      admin: {
        description: 'Detailed instructions for students.',
      },
    },
    {
      name: 'dueDate',
      type: 'date',
      admin: {
        description: 'Optional deadline for submissions.',
      },
    },
    {
      name: 'maxScore',
      type: 'number',
      required: true,
      min: 1,
      admin: {
        description: 'Maximum possible score for this assignment.',
      },
    },
    {
      name: 'rubric',
      type: 'array',
      admin: {
        description: 'Grading rubric criteria.',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'criterion',
          type: 'text',
          required: true,
          admin: {
            description: 'Name of the criterion (e.g., "Content Quality").',
          },
        },
        {
          name: 'maxPoints',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Maximum points for this criterion.',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: {
            description: 'Description of how this criterion is evaluated.',
          },
        },
      ],
    },
  ],
}
