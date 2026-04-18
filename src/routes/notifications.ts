/**
 * Notifications REST API route handler.
 *
 * Provides CRUD operations for notifications:
 * - POST /notifications             — create a notification
 * - GET  /notifications/user/:userId — get all notifications for a user
 * - PATCH /notifications/:id/read     — mark a notification as read
 * - DELETE /notifications/:id         — delete a notification
 *
 * Uses withAuth HOC for JWT validation.
 * All handlers return Result<T, E> responses via the NotificationService.
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/auth/withAuth'
import { createNotificationService } from '@/services/notificationService'

// GET /notifications/user/:userId
export const GET = withAuth(async (req: NextRequest, { user }, routeParams?: { params?: { userId?: string } }) => {
  const service = createNotificationService()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const userId = routeParams?.params?.userId ?? String(user.id)
  const result = service.getUserNotifications(userId)

  if (!result.ok) {
    return NextResponse.json({ error: result.err }, { status: 400 })
  }

  return NextResponse.json({ notifications: result.val }, { status: 200 })
})

// POST /notifications — create a notification
export const POST = withAuth(async (req: NextRequest, { user }) => {
  const service = createNotificationService()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !('userId' in (body as Record<string, unknown>)) ||
    !('type' in (body as Record<string, unknown>)) ||
    !('title' in (body as Record<string, unknown>)) ||
    !('message' in (body as Record<string, unknown>))
  ) {
    return NextResponse.json(
      { error: 'Missing required fields: userId, type, title, message' },
      { status: 400 }
    )
  }

  const { userId, type, title, message } = body as Record<string, unknown>
  const validTypes = ['info', 'warning', 'error', 'success']

  if (typeof userId !== 'string' || !userId) {
    return NextResponse.json({ error: 'userId must be a non-empty string' }, { status: 400 })
  }
  if (!validTypes.includes(String(type))) {
    return NextResponse.json({ error: `type must be one of: ${validTypes.join(', ')}` }, { status: 400 })
  }
  if (typeof title !== 'string' || !title) {
    return NextResponse.json({ error: 'title must be a non-empty string' }, { status: 400 })
  }
  if (typeof message !== 'string' || !message) {
    return NextResponse.json({ error: 'message must be a non-empty string' }, { status: 400 })
  }

  const result = service.send({
    userId: String(userId),
    type: String(type) as 'info' | 'warning' | 'error' | 'success',
    title: String(title),
    message: String(message),
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.err }, { status: 400 })
  }

  return NextResponse.json(result.val, { status: 201 })
})

// PATCH /notifications/:id/read — mark a notification as read
export async function markReadHandler(
  req: NextRequest,
  { user }: { user?: { id: string | number } },
  routeParams?: { params?: { id?: string } }
): Promise<NextResponse> {
  const service = createNotificationService()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const id = routeParams?.params?.id
  if (!id) {
    return NextResponse.json({ error: 'Missing notification id' }, { status: 400 })
  }

  const result = service.markRead(id)
  if (!result.ok) {
    return NextResponse.json({ error: result.err }, { status: 404 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}

// DELETE /notifications/:id — delete a notification
export async function deleteHandler(
  req: NextRequest,
  { user }: { user?: { id: string | number } },
  routeParams?: { params?: { id?: string } }
): Promise<NextResponse> {
  const service = createNotificationService()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const id = routeParams?.params?.id
  if (!id) {
    return NextResponse.json({ error: 'Missing notification id' }, { status: 400 })
  }

  const result = service.delete(id)
  if (!result.ok) {
    return NextResponse.json({ error: result.err }, { status: 404 })
  }

  return new NextResponse(null, { status: 204 })
}

// Express-style router manifest for integration with existing middleware chain
export const notificationsRouter = {
  path: '/notifications',
  middleware: [withAuth],
  handlers: {
    getUser: GET,
    post: POST,
    markRead: markReadHandler,
    delete: deleteHandler,
  },
}
