import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { withAuth } from '@/auth/withAuth'
import { sanitizeHtml } from '@/security/sanitizers'

// Admin stats endpoint - returns aggregate student data
// Requires admin role
export const GET = withAuth(async (request: NextRequest, { user }) => {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const searchParam = request.nextUrl.searchParams.get('search') || ''

  // Sanitize search input to prevent injection
  const sanitizedSearch = sanitizeHtml(searchParam)

  const where = sanitizedSearch
    ? { email: { like: sanitizedSearch } }
    : undefined

  const { docs: users } = await payload.find({
    collection: 'users',
    where,
    limit: 100,
  })

  // Return safe stats only - no sensitive fields
  return NextResponse.json({
    totalUsers: users.length,
    users: users.map((u: any) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
    })),
  })
}, { roles: ['admin'] })
