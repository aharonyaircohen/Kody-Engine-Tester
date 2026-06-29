/**
 * @ai-summary Stores individual quiz-taking attempts: user, quiz, score, passed flag, answers array, and timestamps.
 * @ai-summary Read access is public (read: () => true) — do not store sensitive data in this collection.
 * @ai-summary user and quiz are stored as text IDs rather than relationships; the application must maintain referential integrity.
 */
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
