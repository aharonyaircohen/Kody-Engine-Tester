import { NextRequest } from 'next/server'
import { withAuth } from '@/auth/withAuth'
import { getPayloadInstance } from '@/services/progress'
import { NotificationService } from '@/services/notifications'

/**
 * GET /notifications - Retrieve unread notifications for authenticated user
 */
export const GET = withAuth(async (_request: NextRequest, { user }) => {
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

/**
 * POST /notifications - Mark all notifications as read for authenticated user
 */
export const POST = withAuth(async (_request: NextRequest, { user }) => {
  if (!user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const payload = await getPayloadInstance()
  const service = new NotificationService(payload)
  await service.markAllRead(String(user.id))

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})

/**
 * PATCH /notifications - Mark a single notification as read
 */
export const PATCH = withAuth(async (request: NextRequest, { user }) => {
  if (!user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { notificationId } = await request.json()
  if (!notificationId) {
    return new Response(JSON.stringify({ error: 'notificationId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const payload = await getPayloadInstance()
  const service = new NotificationService(payload)
  await service.markRead(notificationId)

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})