import { NextRequest } from 'next/server'
import { userStore, sessionStore, jwtService } from '../../../../auth'
import { createAuthMiddleware } from '../../../../auth/authMiddleware'
import { AuthController } from '../../../../auth/authController'
import { createErrorResponse, createJsonResponse } from '../../../../utils/api-response'

const authController = new AuthController(userStore, sessionStore, jwtService)
const auth = createAuthMiddleware(userStore, sessionStore, jwtService)

export const POST = async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization')

  const authContext = await auth({
    authorization: authHeader || undefined,
    ip: request.headers.get('x-forwarded-for') || undefined,
  })

  if (authContext.error) {
    return createErrorResponse(authContext.error, authContext.status ?? 401)
  }

  const { user, session } = authContext

  if (!user || !session) {
    return createErrorResponse('Unauthorized', 401)
  }

  let body: { allDevices?: boolean } = {}
  try {
    body = await request.json().catch(() => ({}))
  } catch {
    body = {}
  }

  const { allDevices = false } = body

  authController.logout(user.id, session.id, authHeader!.slice(7), { allDevices })

  return createJsonResponse({ success: true }, 200)
}
