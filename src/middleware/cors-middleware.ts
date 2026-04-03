import { NextRequest, NextResponse } from 'next/server'

export interface CorsMiddlewareConfig {
  allowedOrigins: Array<string> | ((origin: string) => boolean)
  allowedMethods?: Array<string>
  allowedHeaders?: Array<string>
  exposedHeaders?: Array<string>
  supportsCredentials?: boolean
  maxAge?: number
}

const DEFAULT_ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
const DEFAULT_ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'Accept',
  'Origin',
]

export function createCorsMiddleware(config: CorsMiddlewareConfig) {
  const allowedOrigins = config.allowedOrigins
  const allowedMethods = config.allowedMethods ?? DEFAULT_ALLOWED_METHODS
  const allowedHeaders = config.allowedHeaders ?? DEFAULT_ALLOWED_HEADERS
  const exposedHeaders = config.exposedHeaders ?? []
  const supportsCredentials = config.supportsCredentials ?? false
  const maxAge = config.maxAge ?? 86400

  function isOriginAllowed(origin: string): boolean {
    if (Array.isArray(allowedOrigins)) {
      if (allowedOrigins.includes('*')) return true
      return allowedOrigins.includes(origin)
    }
    return allowedOrigins(origin)
  }

  function getWildcardOrigin(): string | null {
    if (Array.isArray(allowedOrigins)) {
      return allowedOrigins.includes('*') ? '*' : null
    }
    return null
  }

  function buildCorsHeaders(request: NextRequest): Record<string, string> {
    const origin = request.headers.get('origin')
    const headers: Record<string, string> = {}
    const wildcardOrigin = getWildcardOrigin()

    if (origin) {
      if (wildcardOrigin) {
        headers['Access-Control-Allow-Origin'] = wildcardOrigin
      } else if (isOriginAllowed(origin)) {
        headers['Access-Control-Allow-Origin'] = origin
      }
    }

    if (supportsCredentials && wildcardOrigin !== '*') {
      headers['Access-Control-Allow-Credentials'] = 'true'
    }

    if (exposedHeaders.length > 0) {
      headers['Access-Control-Expose-Headers'] = exposedHeaders.join(', ')
    }

    return headers
  }

  async function middlewareAsync(request: NextRequest): Promise<NextResponse> {
    const method = request.method.toUpperCase()

    if (method === 'OPTIONS') {
      const origin = request.headers.get('origin')
      const accessControlRequestMethod = request.headers.get('access-control-request-method')
      const accessControlRequestHeaders = request.headers.get('access-control-request-headers')

      const headers: Record<string, string> = {
        'Access-Control-Allow-Methods': allowedMethods.join(', '),
        'Access-Control-Max-Age': String(maxAge),
      }

      const wildcardOrigin = getWildcardOrigin()

      if (origin) {
        if (wildcardOrigin) {
          headers['Access-Control-Allow-Origin'] = wildcardOrigin
        } else if (isOriginAllowed(origin)) {
          headers['Access-Control-Allow-Origin'] = origin
        } else {
          headers['Access-Control-Allow-Origin'] = 'null'
        }
      }

      if (supportsCredentials && wildcardOrigin !== '*') {
        headers['Access-Control-Allow-Credentials'] = 'true'
      }

      if (accessControlRequestHeaders) {
        const requestedHeaders = accessControlRequestHeaders.split(',').map((h) => h.trim().toLowerCase())
        const allowedHeadersLower = allowedHeaders.map((h) => h.toLowerCase())
        const validHeaders = requestedHeaders.filter((h) => allowedHeadersLower.includes(h))
        if (validHeaders.length > 0) {
          headers['Access-Control-Allow-Headers'] = validHeaders.join(', ')
        }
      }

      if (accessControlRequestMethod) {
        const requestedMethod = accessControlRequestMethod.toUpperCase()
        if (!allowedMethods.includes(requestedMethod)) {
          return new NextResponse(null, { status: 204, headers })
        }
      }

      return new NextResponse(null, { status: 204, headers })
    }

    const corsHeaders = buildCorsHeaders(request)
    if (Object.keys(corsHeaders).length === 0) {
      return NextResponse.next()
    }

    const response = NextResponse.next()
    for (const [key, value] of Object.entries(corsHeaders)) {
      response.headers.set(key, value)
    }

    return response
  }

  return Object.assign(middlewareAsync, { async: middlewareAsync })
}
