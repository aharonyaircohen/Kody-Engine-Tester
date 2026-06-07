import type { CollectionConfig } from 'payload'

/**
 * @ai-summary Payload collection for individual quiz submission attempts; `user` and `quiz` are stored as text IDs rather than relationships.
 *
 * TRAP: `user` and `quiz` are plain text fields, not relationship fields — this avoids Payload
 * relationship overhead but means referential integrity is not enforced at the DB level.
 * If the referenced user or quiz is deleted, stale attempts remain with orphaned IDs.
 */
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
