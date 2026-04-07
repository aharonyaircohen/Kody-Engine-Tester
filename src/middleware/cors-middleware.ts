import { NextRequest, NextResponse } from 'next/server'

export interface CorsMiddlewareConfig {
  origin: string[]
  methods: string[]
  credentials: boolean
}

export interface CorsResult {
  allowed: boolean
  headers: Record<string, string>
}

const DEFAULT_CORS_CONFIG: CorsMiddlewareConfig = {
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: false,
}

function isOriginAllowed(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) return false
  // Support wildcard in development
  if (allowedOrigins.includes('*')) return true
  return allowedOrigins.includes(origin)
}

function buildCorsHeaders(config: CorsMiddlewareConfig, requestOrigin: string | null): Record<string, string> {
  const headers: Record<string, string> = {}

  if (config.origin.includes('*')) {
    headers['Access-Control-Allow-Origin'] = '*'
  } else if (requestOrigin) {
    headers['Access-Control-Allow-Origin'] = requestOrigin
  }

  if (config.credentials) {
    headers['Access-Control-Allow-Credentials'] = 'true'
  }

  headers['Access-Control-Allow-Methods'] = config.methods.join(', ')
  headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'

  return headers
}

export { isOriginAllowed, buildCorsHeaders }

export function createCorsMiddleware(config: Partial<CorsMiddlewareConfig> = {}) {
  const mergedConfig: CorsMiddlewareConfig = {
    origin: config.origin ?? DEFAULT_CORS_CONFIG.origin,
    methods: config.methods ?? DEFAULT_CORS_CONFIG.methods,
    credentials: config.credentials ?? DEFAULT_CORS_CONFIG.credentials,
  }

  function middleware(request: NextRequest): NextResponse {
    // Handle preflight OPTIONS requests
    if (request.method === 'OPTIONS') {
      const requestOrigin = request.headers.get('origin')
      const allowed = isOriginAllowed(requestOrigin, mergedConfig.origin)

      if (!allowed) {
        return new NextResponse(null, { status: 403 })
      }

      const headers = buildCorsHeaders(mergedConfig, requestOrigin)
      return new NextResponse(null, {
        status: 204,
        headers,
      })
    }

    // For actual requests, check origin and attach CORS headers if allowed
    const requestOrigin = request.headers.get('origin')
    const allowed = isOriginAllowed(requestOrigin, mergedConfig.origin)

    if (!allowed) {
      return NextResponse.next()
    }

    const headers = buildCorsHeaders(mergedConfig, requestOrigin)
    const response = NextResponse.next()
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }

  middleware.config = mergedConfig
  return middleware
}

// Export utilities and factory
export { DEFAULT_CORS_CONFIG }
export { createCorsMiddleware as default }
