import { NextRequest } from 'next/server'
import { getCsrfTokenService } from '../../../security/csrf-token'
import { createErrorResponse, createJsonResponse } from '../../../utils/api-response'

export const GET = async (request: NextRequest) => {
  const sessionId = request.headers.get('x-session-id')

  if (!sessionId) {
    return createErrorResponse('x-session-id header is required', 400)
  }

  const tokenService = getCsrfTokenService()
  const token = await tokenService.generate(sessionId)

  return createJsonResponse({ token }, 200, { 'X-CSRF-Token': token })
}
