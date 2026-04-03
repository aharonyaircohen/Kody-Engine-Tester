import type { CollectionConfig, CollectionSlug } from 'payload'

export type UserRole = 'admin' | 'editor' | 'viewer'

export interface IdentityProvider {
  provider: 'google' | 'github' | 'microsoft' | 'local'
  providerId: string
  email?: string
  linkedAt: string
}

export interface TenantPermission {
  tenantId: string
  role: UserRole
  grantedAt: string
  grantedBy?: string
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    read: ({ req: { user }, id }) => {
      if (!user) return false
      const role = (user as { role?: string }).role
      // Admins can read all users in their tenant
      if (role === 'admin') return true
      // Users can only read their own profile
      return String(user.id) === String(id)
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
    // Primary tenant (organization) for the user
    {
      name: 'organization',
      type: 'text',
      required: false,
      admin: {
        description: 'Primary tenant/organization ID',
      },
    },
    // All tenant permissions (multi-tenant support)
    {
      name: 'tenantPermissions',
      type: 'array',
      required: false,
      hidden: true,
      access: {
        read: () => false,
        create: () => false,
        update: ({ req: { user } }) => {
          return (user as { role?: string } | null)?.role === 'admin'
        },
      },
      fields: [
        {
          name: 'tenantId',
          type: 'text',
          required: true,
        },
        {
          name: 'role',
          type: 'select',
          options: ['admin', 'editor', 'viewer'],
          required: true,
        },
        {
          name: 'grantedAt',
          type: 'date',
          required: true,
        },
        {
          name: 'grantedBy',
          type: 'text',
          required: false,
        },
      ],
    },
    // Multiple identity providers support
    {
      name: 'identities',
      type: 'array',
      required: false,
      hidden: true,
      access: {
        read: () => false,
        create: () => false,
        update: () => false,
      },
      fields: [
        {
          name: 'provider',
          type: 'select',
          options: ['google', 'github', 'microsoft', 'local'],
          required: true,
        },
        {
          name: 'providerId',
          type: 'text',
          required: true,
        },
        {
          name: 'email',
          type: 'text',
          required: false,
        },
        {
          name: 'linkedAt',
          type: 'date',
          required: true,
        },
      ],
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
    // OAuth2 PKCE state for authorization flow
    {
      name: 'oauthState',
      type: 'text',
      required: false,
      hidden: true,
      access: {
        read: () => false,
        update: () => false,
      },
    },
    {
      name: 'oauthCodeVerifier',
      type: 'text',
      required: false,
      hidden: true,
      access: {
        read: () => false,
        update: () => false,
      },
    },
    {
      name: 'oauthProvider',
      type: 'select',
      options: ['google', 'github', 'microsoft', 'local'],
      required: false,
      hidden: true,
      access: {
        read: () => false,
        update: () => false,
      },
    },
  ],
}
