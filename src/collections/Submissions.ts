import type { CollectionConfig } from 'payload'

export const Submissions: CollectionConfig = {
  slug: 'submissions',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['id', 'assignment', 'student', 'status', 'grade', 'submittedAt'],
  },
  fields: [
    {
      name: 'assignment',
      type: 'relationship',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      relationTo: 'assignments' as any,
      required: true,
      admin: {
        description: 'The assignment this submission answers.',
      },
    },
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'The student who submitted this work.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      admin: {
        description: "The student's written response to the assignment.",
      },
    },
    {
      name: 'attachments',
      type: 'array',
      admin: {
        description: 'Files attached to this submission.',
      },
      fields: [
        {
          name: 'file',
          type: 'upload',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          relationTo: 'media' as any,
          required: true,
          admin: {
            description: 'Upload a file.',
          },
        },
      ],
    },
    {
      name: 'submittedAt',
      type: 'date',
      admin: {
        description: 'Timestamp when the submission was made.',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'submitted',
      options: [
        { label: 'Submitted', value: 'submitted' },
        { label: 'Graded', value: 'graded' },
        { label: 'Returned', value: 'returned' },
      ],
      admin: {
        description: 'Current status of the submission.',
      },
    },
    {
      name: 'grade',
      type: 'number',
      admin: {
        description: 'Score awarded by the instructor.',
        step: 0.01,
      },
    },
    {
      name: 'feedback',
      type: 'richText',
      admin: {
        description: 'Instructor feedback on the submission.',
      },
    },
    {
      name: 'rubricScores',
      type: 'array',
      admin: {
        description: 'Scores for each rubric criterion.',
        readOnly: true,
      },
      fields: [
        {
          name: 'criterion',
          type: 'text',
          required: true,
          admin: {
            description: 'Name of the rubric criterion.',
          },
        },
        {
          name: 'score',
          type: 'number',
          required: true,
          admin: {
            description: 'Points awarded for this criterion.',
          },
        },
        {
          name: 'comment',
          type: 'text',
          admin: {
            description: 'Optional instructor comment for this criterion.',
          },
        },
      ],
    },
  ],
}
