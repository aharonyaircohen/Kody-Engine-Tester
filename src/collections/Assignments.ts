import type { CollectionConfig, CollectionSlug } from 'payload'

/**
 * @ai-summary Payload collection for instructor-graded coursework attached to a module.
 *
 * TRAP: no access control is defined — all operations are open to any authenticated user.
 * Before using this in production, add `access` rules or guard all Local API calls with
 * `overrideAccess: false`, otherwise the Local API will bypass any future rules silently.
 */
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
      relationTo: 'modules' as CollectionSlug,
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
