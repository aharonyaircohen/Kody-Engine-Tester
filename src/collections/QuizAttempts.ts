import type { CollectionConfig } from 'payload'

/**
 * @ai-summary
 * Read-public record of student quiz attempts with answers, scores, and pass/fail state.
 *
 * **Trap:** `access.read: () => true` makes all attempts visible to unauthenticated users.
 * Ensure student consent or anonymization before using this data externally.
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
