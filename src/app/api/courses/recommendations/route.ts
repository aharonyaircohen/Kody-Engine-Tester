import type { NextRequest } from 'next/server'
import { withAuth } from '@/auth/withAuth'
import { getPayloadInstance } from '@/services/progress'
import { RecommendationService } from '@/services/recommendations'
import { sanitizeHtml } from '@/security/sanitizers'
import type { RbacRole } from '@/auth/auth-service'

export const GET = withAuth(
  async (request: NextRequest, { user }) => {
    const { searchParams } = request.nextUrl

    // Parse query params
    const rawUserId = searchParams.get('userId') ?? ''
    const rawLimit = searchParams.get('limit') ?? ''
    const rawExcludeCompleted = searchParams.get('excludeCompleted') ?? ''

    // Validate userId
    const userId = sanitizeHtml(rawUserId).trim()
    if (!userId) {
      return Response.json(
        { error: 'Invalid userId: must be a non-empty string' },
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Authorization: user may request own ID, or elevated roles may request any
    const userIdMatch =
      String(user?.id) === userId ||
      userId === String(user?.id)
    const elevatedRoles: RbacRole[] = ['admin', 'editor']
    const isElevated = elevatedRoles.includes(user?.role as RbacRole)

    if (!userIdMatch && !isElevated) {
      return Response.json(
        { error: 'Forbidden: you may only request recommendations for yourself' },
        { status: 403, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Validate limit
    const parsedLimit = parseInt(rawLimit, 10)
    const isValidLimit = !isNaN(parsedLimit) && parsedLimit >= 1 && parsedLimit <= 20
    if (rawLimit !== '' && !isValidLimit) {
      return Response.json(
        { error: 'Invalid limit: must be an integer between 1 and 20' },
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Parse excludeCompleted (default true)
    const excludeCompleted =
      rawExcludeCompleted === '' ? true : rawExcludeCompleted === 'true'

    try {
      const payload = await getPayloadInstance()
      const service = new RecommendationService(payload)
      const result = await service.recommend({
        userId,
        limit: isValidLimit ? parsedLimit : undefined,
        excludeCompleted,
      })

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (err) {
      const message =
        process.env.NODE_ENV === 'development'
          ? (err instanceof Error ? err.message : 'Internal error')
          : 'Internal error'
      return Response.json(
        { error: message },
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      )
    }
  },
  { optional: false },
)
