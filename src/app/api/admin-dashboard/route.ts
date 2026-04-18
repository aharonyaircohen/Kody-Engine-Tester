import { NextRequest } from 'next/server'
import { getPayloadInstance } from '@/services/progress'
import { DashboardStatsService } from '@/services/dashboard-stats'
import { withAuth } from '@/auth/withAuth'

export const GET = withAuth(
  async (
    _req: NextRequest,
    { user }: { user?: { id: string | number; role?: string } },
  ) => {
    try {
      const payload = await getPayloadInstance()
      const service = new DashboardStatsService(payload)

      const url = new URL(_req.url)
      const type = url.searchParams.get('type') as 'courses' | 'users' | 'enrollments'
      const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
      const limit = 10

      if (!type || !['courses', 'users', 'enrollments'].includes(type)) {
        return Response.json({ error: 'Invalid type parameter' }, { status: 400 })
      }

      let result: { docs: unknown[]; totalDocs: number }

      if (type === 'courses') {
        result = await service.getCourses(limit, page)
      } else if (type === 'users') {
        result = await service.getUsers(limit, page)
      } else {
        result = await service.getRecentEnrollments(limit, page)
      }

      return Response.json(result, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error'
      return Response.json({ error: message }, { status: 500 })
    }
  },
  { roles: ['admin', 'editor'] },
)
