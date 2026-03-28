import type { CollectionConfig, CollectionSlug } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      return true
    },
    create: () => true,
    update: ({ req: { user }, id }) => {
      if (!user) return false
      const role = (user as { role?: string }).role
      if (role === 'admin') return true
      return String(user.id) === String(id)
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      const role = (user as { role?: string }).role
      return role === 'admin'
    },
  } as CollectionConfig['access'],
  fields: [
    // Email added by default
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'displayName',
      type: 'text',
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ data }) => {
            const first = data?.firstName ?? ''
            const last = data?.lastName ?? ''
            if (first || last) {
              return `${first} ${last}`.trim()
            }
            return data?.displayName
          },
        ],
      },
    },
    {
      name: 'avatar',
      type: 'relationship',
      relationTo: 'media' as CollectionSlug,
      required: false,
    },
    {
      name: 'bio',
      type: 'textarea',
      required: false,
      validate: (value: string | null | undefined) => {
        if (value && value.length > 500) {
          return 'Bio must be 500 characters or fewer'
        }
        return true
      },
    },
    {
      name: 'role',
      type: 'select',
      options: ['student', 'instructor', 'admin'],
      defaultValue: 'student',
      required: true,
      access: {
        update: ({ req: { user } }) => {
          return (user as { role?: string } | null)?.role === 'admin'
        },
      },
    },
    {
      name: 'organization',
      type: 'text',
      required: false,
    },
  ],
}
