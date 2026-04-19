import type { CollectionConfig, CollectionSlug } from 'payload'

export type NotificationType = 'enrollment' | 'grade' | 'deadline' | 'discussion' | 'discussion_reply' | 'announcement'

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
        { label: 'Discussion Reply', value: 'discussion_reply' },
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
