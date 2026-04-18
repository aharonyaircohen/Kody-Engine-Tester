import { NextRequest } from 'next/server'
import { withAuth } from '@/auth/withAuth'
import { getPayloadInstance } from '@/services/progress'
import { NotificationService } from '@/services/notifications'

export const PATCH = withAuth(
  async (
    request: NextRequest,
    {},
    routeParams?: { params: Promise<{ id: string }> },
  ) => {
    const params = await routeParams?.params
    const id = params?.id

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing id parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const payload = await getPayloadInstance()
    const service = new NotificationService(payload)
    const notification = await service.markRead(id)

    return new Response(JSON.stringify({ notification }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
)
