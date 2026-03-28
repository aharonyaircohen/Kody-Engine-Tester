import { NextRequest } from 'next/server'
import { userStore, sessionStore, jwtService } from '../../../../auth'
import { createAuthMiddleware } from '../../../../middleware/auth-middleware'
import { getPayloadInstance } from '../../../../services/progress'
import { NotificationService } from '../../../../services/notifications'

const auth = createAuthMiddleware(userStore, sessionStore, jwtService)

export const POST = async (request: NextRequest) => {
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

  const user = authContext.user!
  const payload = await getPayloadInstance()
  const service = new NotificationService(payload)
  await service.markAllRead(user.id)

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
