import type { CollectionConfig, CollectionSlug } from 'payload'

/**
 * @ai-summary
 * Instructor-authored coursework attached to a module, with optional rubric-based grading.
 *
 * **Trap:** `rubric` is stored as a raw array — Payload does not validate rubric completeness
 * against `maxScore`; a rubric whose criteria maxPoints sum exceeds maxScore will silently
 * allow over-scoring. Validate in a `beforeChange` hook if strict grading is required.
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
