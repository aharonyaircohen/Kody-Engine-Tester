import { NextRequest, NextResponse } from 'next/server'
import { CsrfTokenService } from '../security/csrf-token'

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']

export interface CsrfMiddlewareConfig {
  tokenService: CsrfTokenService
  sessionIdResolver?: (request: NextRequest) => string | null
}

export function createCsrfMiddleware(config: CsrfMiddlewareConfig) {
  const tokenService = config.tokenService
  const sessionIdResolver =
    config.sessionIdResolver ??
    ((req: NextRequest) => req.headers.get('x-session-id'))

  async function middlewareAsync(request: NextRequest): Promise<NextResponse> {
    const method = request.method.toUpperCase()

    if (SAFE_METHODS.includes(method)) {
      return NextResponse.next()
    }

    const sessionId = sessionIdResolver(request)
    if (!sessionId) {
      return errorResponse('CSRF protection requires a session ID')
    }

    const token = request.headers.get('x-csrf-token')
    if (!token) {
      return errorResponse('Missing CSRF token. Include X-CSRF-Token header or _csrf in body.')
    }

    const result = await tokenService.validate(sessionId, token)

    if (!result.valid) {
      return errorResponse(result.error ?? 'Invalid CSRF token')
    }

    const response = NextResponse.next()
    if (result.newToken) {
      response.headers.set('x-csrf-token', result.newToken)
    }
    return response
  }

  return Object.assign(middlewareAsync, { async: middlewareAsync })
}

function errorResponse(message: string): NextResponse {
  return new NextResponse(JSON.stringify({ error: message }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  })
}
