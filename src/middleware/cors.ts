import { NextRequest, NextResponse } from 'next/server'

export interface CorsConfig {
  allowedOrigins: string[]
  allowedMethods?: string[]
  allowedHeaders?: string[]
  maxAge?: number
  allowCredentials?: boolean
}

export interface CorsMiddlewareConfig extends CorsConfig {
  originResolver?: (request: NextRequest) => string | null
}

const DEFAULT_ALLOWED_METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
const DEFAULT_ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'X-CSRF-Token',
]

function getOrigin(request: NextRequest): string | null {
  return request.headers.get('origin') ?? null
}

export function createCorsMiddleware(config: CorsMiddlewareConfig) {
  const allowedOrigins = config.allowedOrigins
  const allowedMethods = config.allowedMethods ?? DEFAULT_ALLOWED_METHODS
  const allowedHeaders = config.allowedHeaders ?? DEFAULT_ALLOWED_HEADERS
  const maxAge = config.maxAge ?? 86400
  const allowCredentials = config.allowCredentials ?? false
  const originResolver = config.originResolver ?? getOrigin

  function setCorsHeaders(response: NextResponse, origin: string): void {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', allowedMethods.join(', '))
    response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '))
    if (maxAge > 0) {
      response.headers.set('Access-Control-Max-Age', String(maxAge))
    }
    if (allowCredentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }
  }

  function middleware(request: NextRequest): NextResponse {
    const origin = originResolver(request)
    const method = request.method.toUpperCase()

    // Handle preflight OPTIONS requests
    if (method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 })
      if (origin && isOriginAllowed(origin)) {
        setCorsHeaders(response, origin)
      }
      return response
    }

    // Check if origin is allowed
    if (!origin || !isOriginAllowed(origin)) {
      const response = new NextResponse(
        JSON.stringify({ error: 'Forbidden: CORS policy violation' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
      if (origin) {
        setCorsHeaders(response, origin)
      }
      return response
    }

    // Allow the request with CORS headers
    const response = NextResponse.next()
    setCorsHeaders(response, origin)
    return response
  }

  function isOriginAllowed(origin: string): boolean {
    // Support wildcard in allowed origins
    if (allowedOrigins.includes('*')) {
      return true
    }
    return allowedOrigins.includes(origin)
  }

  return middleware
}