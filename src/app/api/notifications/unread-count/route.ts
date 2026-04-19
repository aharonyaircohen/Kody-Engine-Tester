import { NextRequest } from 'next/server'
import { withAuth } from '@/auth/withAuth'
import { getPayloadInstance } from '@/services/progress'
import { NotificationService } from '@/services/notifications'

export const GET = withAuth(async (_request: NextRequest, { user }) => {
  const payload = await getPayloadInstance()
  const service = new NotificationService(payload)
  const unread = await service.getUnread(String(user!.id))

  return new Response(
    JSON.stringify({ success: true, data: { unreadCount: unread.length } }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
})
