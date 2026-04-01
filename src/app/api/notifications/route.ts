import { NextRequest } from 'next/server'
import { withAuth } from '@/auth/withAuth'
import { getPayloadInstance } from '@/services/progress'
import { NotificationService } from '@/services/notifications'

export const GET = withAuth(async (request: NextRequest, { user }) => {
  if (!user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const payload = await getPayloadInstance()
  const service = new NotificationService(payload)
  const notifications = await service.getUnread(String(user.id))

  return new Response(JSON.stringify({ notifications }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
