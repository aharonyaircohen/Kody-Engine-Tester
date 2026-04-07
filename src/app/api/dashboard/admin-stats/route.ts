import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { withAuth } from '@/auth/withAuth'
import { sanitizeHtml } from '@/security/sanitizers'

// Admin stats endpoint - returns aggregate student data
// Requires admin role
export const GET = withAuth(async (request: NextRequest, { user }) => {
  if (!user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  if (user.role !== 'admin') {
    return Response.json({ error: 'Forbidden: requires admin role' }, { status: 403 })
  }

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const searchParam = request.nextUrl.searchParams.get('search') || ''
  const pageParam = request.nextUrl.searchParams.get('page') || '1'
  const limitParam = request.nextUrl.searchParams.get('limit') || '10'

  const page = Math.max(1, parseInt(pageParam, 10) || 1)
  const limit = Math.min(Math.max(1, parseInt(limitParam, 10) || 10), 100)

  // Sanitize search input to prevent injection
  const sanitizedSearch = sanitizeHtml(searchParam)

  const where = sanitizedSearch
    ? { email: { like: sanitizedSearch } }
    : undefined

  const { docs: users, totalDocs, totalPages } = await payload.find({
    collection: 'users',
    where,
    page,
    limit,
  })

  // Return safe stats only - no sensitive fields
  return NextResponse.json({
    totalUsers: totalDocs ?? users.length,
    totalPages: totalPages ?? 1,
    users: users.map((u: any) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
    })),
  })
}, { roles: ['admin'] })
