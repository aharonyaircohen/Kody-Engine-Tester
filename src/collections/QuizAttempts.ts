import type { CollectionConfig } from 'payload'

export const QuizAttempts: CollectionConfig = {
  slug: 'quiz-attempts',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'quiz', 'score', 'passed', 'completedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'user',
      type: 'text',
      required: true,
      admin: {
        description: 'User ID who made the attempt',
      },
    },
    {
      name: 'quiz',
      type: 'text',
      required: true,
      admin: {
        description: 'Quiz ID that was attempted',
      },
    },
    {
      name: 'courseId',
      type: 'text',
      admin: {
        description: 'Course ID this attempt belongs to (for gradebook filtering)',
      },
    },
    {
      name: 'score',
      type: 'number',
    },
    {
      name: 'passed',
      type: 'checkbox',
    },
    {
      name: 'answers',
      type: 'array',
      fields: [
        {
          name: 'questionIndex',
          type: 'number',
          required: true,
        },
        {
          name: 'answer',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'startedAt',
      type: 'date',
    },
    {
      name: 'completedAt',
      type: 'date',
    },
  ],
}
