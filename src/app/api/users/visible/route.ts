import { NextRequest } from 'next/server'

import { withAuth } from '@/auth/withAuth'
import { ListVisibleUsersService } from '@/auth/list-visible-users'
import { getPayloadInstance } from '@/services/progress'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

export const GET = withAuth(async (request: NextRequest, { user }) => {
  const { searchParams } = request.nextUrl
  const rawPage = searchParams.get('page') ?? String(DEFAULT_PAGE)
  const rawLimit = searchParams.get('limit') ?? String(DEFAULT_LIMIT)

  const page = Math.max(1, parseInt(rawPage, 10) || DEFAULT_PAGE)
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(rawLimit, 10) || DEFAULT_LIMIT))

  const payload = await getPayloadInstance()
  const service = new ListVisibleUsersService(payload)

  // withAuth rejects unauthenticated requests with 401 before invoking the handler when `optional` is not set.
  const result = await service.listVisibleUsers(user!, { page, limit })

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}, { roles: ['admin', 'editor'] })
