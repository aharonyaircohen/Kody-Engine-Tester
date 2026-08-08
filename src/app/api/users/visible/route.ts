import { NextRequest } from 'next/server'

import { withAuth } from '@/auth/withAuth'
import { ListVisibleUsersService } from '@/auth/list-visible-users'
import { getPayloadInstance } from '@/services/progress'
import type { User } from '@/payload-types'

export const GET = withAuth(async (request: NextRequest, { user }) => {
  if (!user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { searchParams } = request.nextUrl
  const rawPage = searchParams.get('page')
  const rawLimit = searchParams.get('limit')

  const pagination: { page?: number; limit?: number } = {}
  if (rawPage !== null) {
    const parsed = Number(rawPage)
    if (Number.isFinite(parsed)) pagination.page = parsed
  }
  if (rawLimit !== null) {
    const parsed = Number(rawLimit)
    if (Number.isFinite(parsed)) pagination.limit = parsed
  }

  const payload = await getPayloadInstance()
  const service = new ListVisibleUsersService(payload)

  const result = await service.listVisibleUsers(user as unknown as User, pagination)

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}, { roles: ['admin', 'editor'] })
