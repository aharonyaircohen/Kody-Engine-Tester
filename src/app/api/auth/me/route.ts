import { NextRequest } from 'next/server'
import { userStore, sessionStore, jwtService } from '../../../../auth'
import { createAuthMiddleware } from '../../../../auth/authMiddleware'
import { AuthController } from '../../../../auth/authController'
import { createErrorResponse, createJsonResponse } from '../../../../utils/api-response'

const authController = new AuthController(userStore, sessionStore, jwtService)
const auth = createAuthMiddleware(userStore, sessionStore, jwtService)

export const GET = async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization')

  const authContext = await auth({
    authorization: authHeader || undefined,
    ip: request.headers.get('x-forwarded-for') || undefined,
  })

  if (authContext.error) {
    return createErrorResponse(authContext.error, authContext.status ?? 401)
  }

  const { user } = authContext

  if (!user) {
    return createErrorResponse('Unauthorized', 401)
  }

  try {
    const profile = await authController.me(user.id)
    return createJsonResponse(profile, 200)
  } catch (error) {
    const err = error as { message?: string; status?: number }
    return createErrorResponse(err.message || 'Failed to get profile', err.status || 500)
  }
}
