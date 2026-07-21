/**
 * @ai-summary Tracks which student is enrolled in which course, with a status (active/completed/dropped) and a list of completed lessons.
 * @ai-summary The unique index on [student, course] prevents duplicate enrollments — enforcement is at the DB level.
 * @ai-summary completedLessons is read-only and must be populated by the application layer (not by hooks on this collection).
 */
import type { CollectionConfig, CollectionSlug } from 'payload'

export type EnrollmentStatus = 'active' | 'completed' | 'dropped'

export interface EnrollmentFields {
  student: string
  course: string
  enrolledAt: Date
  status: EnrollmentStatus
  completedAt?: Date
  completedLessons: string[]
}

export const Enrollments: CollectionConfig = {
  slug: 'enrollments',
  admin: {
    useAsTitle: 'enrolledAt',
  },
  // Database-level unique constraint: one enrollment per student per course
  indexes: [
    { fields: ['student', 'course'], unique: true },
  ],
  fields: [
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'users' as CollectionSlug,
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses' as CollectionSlug,
      required: true,
    },
    {
      name: 'enrolledAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
        { label: 'Dropped', value: 'dropped' },
      ],
    },
    {
      name: 'completedAt',
      type: 'date',
      required: false,
    },
    {
      name: 'completedLessons',
      type: 'relationship',
      relationTo: 'lessons' as CollectionSlug,
      hasMany: true,
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Auto-set enrolledAt on create (not required field — hook provides the default)
        if (operation === 'create' && !data.enrolledAt) {
          data.enrolledAt = new Date().toISOString() as unknown as Date
        }
        return data
      },
    ],
  },
}
