import { NextRequest } from 'next/server'
import { withAuth } from '@/auth/withAuth'
import { getPayloadInstance } from '@/services/progress'
import { NotificationService } from '@/services/notifications'

export const POST = withAuth(async (request: NextRequest, { user }) => {
  const payload = await getPayloadInstance()
  const service = new NotificationService(payload)
  await service.markAllRead(String(user!.id))

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}, { roles: ['viewer', 'editor', 'admin'] })
