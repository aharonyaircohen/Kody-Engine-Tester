import type { CollectionConfig, CollectionSlug } from 'payload'

/**
 * @ai-summary
 * Payload-backed notification collection with per-user row-level security via a `recipient`
 * query constraint on read/update. Non-admins can only see their own notifications.
 *
 * **Trap:** `access.create: () => true` allows any authenticated user to create
 * notifications for any other user. Add sender validation in a `beforeChange` hook if
 * notifications must originate from the system or verified senders.
 */
export type NotificationType = 'enrollment' | 'grade' | 'deadline' | 'discussion' | 'announcement'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      if ((req.user as any).role === 'admin') return true
      return { recipient: { equals: req.user.id } }
    },
    create: () => true,
    update: ({ req }) => {
      if (!req.user) return false
      if ((req.user as any).role === 'admin') return true
      return { recipient: { equals: req.user.id } }
    },
    delete: ({ req }) => {
      if (!req.user) return false
      return (req.user as any).role === 'admin'
    },
  },
  fields: [
    {
      name: 'recipient',
      type: 'relationship',
      relationTo: 'users' as CollectionSlug,
      required: true,
      index: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Enrollment', value: 'enrollment' },
        { label: 'Grade', value: 'grade' },
        { label: 'Deadline', value: 'deadline' },
        { label: 'Discussion', value: 'discussion' },
        { label: 'Announcement', value: 'announcement' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'message',
      type: 'text',
      required: true,
    },
    {
      name: 'link',
      type: 'text',
      required: false,
    },
    {
      name: 'isRead',
      type: 'checkbox',
      defaultValue: false,
      required: true,
    },
  ],
}
