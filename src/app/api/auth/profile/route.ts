import { NextRequest } from 'next/server'
import type { CollectionSlug } from 'payload'
import { withAuth } from '@/auth/withAuth'
import { getPayloadInstance } from '@/services/progress'

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = await getPayloadInstance()

    const result = await payload.findByID({
      collection: 'users' as CollectionSlug,
      id: user.id,
    })

    const doc = result as any

    return Response.json({
      id: doc.id,
      email: doc.email,
      firstName: doc.firstName,
      lastName: doc.lastName,
      role: doc.role,
      displayName: doc.displayName,
      bio: doc.bio,
      avatar: doc.avatar,
      organization: doc.organization,
      createdAt: doc.createdAt,
      lastLogin: doc.lastLogin,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch profile'
    return Response.json({ error: message }, { status: 500 })
  }
}, { roles: ['admin', 'editor', 'viewer'] })

export const PATCH = withAuth(async (request: NextRequest, { user }) => {
  try {
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, bio, organization } = body

    const payload = await getPayloadInstance()

    const updated = await payload.update({
      collection: 'users' as CollectionSlug,
      id: user.id,
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(bio !== undefined && { bio }),
        ...(organization !== undefined && { organization }),
      } as any,
    })

    const doc = updated as any

    return Response.json({
      id: doc.id,
      email: doc.email,
      firstName: doc.firstName,
      lastName: doc.lastName,
      role: doc.role,
      displayName: doc.displayName,
      bio: doc.bio,
      organization: doc.organization,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update profile'
    return Response.json({ error: message }, { status: 500 })
  }
}, { roles: ['admin', 'editor', 'viewer'] })