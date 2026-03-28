import type { CollectionConfig } from 'payload'

export const Quizzes: CollectionConfig = {
  slug: 'quizzes',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'module', 'passingScore', 'order'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'module',
      type: 'text',
      required: true,
      admin: {
        description: 'Module ID this quiz belongs to',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'passingScore',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 70,
    },
    {
      name: 'timeLimit',
      type: 'number',
      min: 0,
      admin: {
        description: 'Time limit in minutes (0 or empty = no limit)',
      },
    },
    {
      name: 'maxAttempts',
      type: 'number',
      min: 1,
      defaultValue: 3,
    },
    {
      name: 'questions',
      type: 'array',
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Multiple Choice', value: 'multiple-choice' },
            { label: 'True / False', value: 'true-false' },
            { label: 'Short Answer', value: 'short-answer' },
          ],
        },
        {
          name: 'options',
          type: 'array',
          admin: {
            description: 'Options for multiple-choice and true/false questions',
          },
          fields: [
            {
              name: 'text',
              type: 'text',
              required: true,
            },
            {
              name: 'isCorrect',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
        {
          name: 'correctAnswer',
          type: 'text',
          admin: {
            description: 'Correct answer for short-answer questions (case-insensitive)',
          },
        },
        {
          name: 'points',
          type: 'number',
          min: 0,
          defaultValue: 1,
        },
      ],
    },
  ],
}
