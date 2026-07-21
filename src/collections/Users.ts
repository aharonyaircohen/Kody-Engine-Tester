import type { CollectionConfig, CollectionSlug } from 'payload'

/**
 * @ai-summary
 * Auth-enabled user collection. Email is the auth identifier (used as title).
 * `displayName` is auto-computed from firstName + lastName before save.
 *
 * TRAP: JWT contains only `role` and `email` by default — `displayName` and other fields
 * are not included. If access logic relies on `displayName` in the JWT, it will be undefined.
 */
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
      options: ['admin', 'editor', 'viewer'],
      defaultValue: 'viewer',
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
    {
      name: 'refreshToken',
      type: 'text',
      required: false,
      hidden: true,
      access: {
        read: () => false,
        update: () => false,
      },
    },
    {
      name: 'tokenExpiresAt',
      type: 'date',
      required: false,
      hidden: true,
      access: {
        read: () => false,
        update: () => false,
      },
    },
    {
      name: 'lastTokenUsedAt',
      type: 'date',
      required: false,
      hidden: true,
      access: {
        read: () => false,
        update: () => false,
      },
    },
    {
      name: 'lastLogin',
      type: 'date',
      required: false,
      hidden: true,
      admin: {
        readOnly: true,
      },
      access: {
        read: () => false,
        update: () => false,
      },
    },
    {
      name: 'permissions',
      type: 'text',
      required: false,
      hidden: true,
      admin: {
        readOnly: true,
      },
      access: {
        read: () => false,
        update: () => false,
      },
    },
  ],
}
