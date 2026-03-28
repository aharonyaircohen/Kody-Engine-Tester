import { NextRequest } from 'next/server'
import { userStore, sessionStore, jwtService } from '../../../../../auth'
import { createAuthMiddleware } from '../../../../../middleware/auth-middleware'
import { getPayloadInstance } from '../../../../../services/progress'
import { NotificationService } from '../../../../../services/notifications'

const auth = createAuthMiddleware(userStore, sessionStore, jwtService)

export const PATCH = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const authContext = await auth({
    authorization: request.headers.get('authorization') || undefined,
    ip: request.headers.get('x-forwarded-for') || undefined,
  })

  if (authContext.error) {
    return new Response(JSON.stringify({ error: authContext.error }), {
      status: authContext.status ?? 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { id } = await params
  const payload = await getPayloadInstance()
  const service = new NotificationService(payload)
  const notification = await service.markRead(id)

  return new Response(JSON.stringify({ notification }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
