import { NextRequest } from 'next/server'
import { userStore, sessionStore, jwtService } from '../../../../auth'
import { AuthController } from '../../../../auth/authController'
import { createErrorResponse, createJsonResponse } from '../../../../utils/api-response'

const authController = new AuthController(userStore, sessionStore, jwtService)

export const POST = async (request: NextRequest) => {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  let body: { email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return createErrorResponse('Invalid JSON body', 400)
  }

  const { email, password } = body

  if (!email || !password) {
    return createErrorResponse('Email and password are required', 400)
  }

  try {
    const result = await authController.login({ email, password }, ip, userAgent)
    return createJsonResponse(result, 200)
  } catch (error) {
    const err = error as { message?: string; status?: number }
    return createErrorResponse(err.message || 'Login failed', err.status || 500)
  }
}
