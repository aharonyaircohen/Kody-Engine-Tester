import type { CollectionConfig, CollectionSlug } from 'payload'

/**
 * @ai-summary Payload collection for user-scoped notifications; admins can read/update any notification.
 *
 * TRAP: the admin bypass uses string comparison `(req.user as any).role === 'admin'` — if the
 * `role` field is mutated or missing, any non-admin user could access all notifications.
 * Additionally, `notificationsStore` (in-memory) is a completely separate implementation and
 * is NOT backed by this collection; they must be kept in sync manually.
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
