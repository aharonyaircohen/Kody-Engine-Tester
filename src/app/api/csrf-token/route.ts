import { NextRequest } from 'next/server'
import { getCsrfTokenService } from '../../../security/csrf-token'

export const GET = async (request: NextRequest) => {
  const sessionId = request.headers.get('x-session-id')

  if (!sessionId) {
    return new Response(
      JSON.stringify({ error: 'x-session-id header is required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  const tokenService = getCsrfTokenService()
  const token = await tokenService.generate(sessionId)

  return new Response(JSON.stringify({ token }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': token,
    },
  })
}
