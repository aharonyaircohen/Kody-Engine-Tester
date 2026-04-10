import { NextRequest, NextResponse } from 'next/server'

export interface CorsOptions {
  origin?: string | string[] | boolean
  methods?: string[]
  allowedHeaders?: string[]
  exposedHeaders?: string[]
  credentials?: boolean
  maxAge?: number
}

export interface CorsMiddleware {
  (request: NextRequest): NextResponse
}

function parseOrigin(
  origin: string | string[] | boolean | undefined,
  requestOrigin: string | null,
): string | null {
  if (origin === undefined) return null
  if (origin === true) return requestOrigin
  if (origin === false) return null
  if (typeof origin === 'string') return origin
  if (Array.isArray(origin)) {
    if (origin.includes(requestOrigin ?? '')) return requestOrigin
    return origin[0] ?? null
  }
  return null
}

function stringifyHeaderValue(value: string | number | boolean | string[] | undefined): string | undefined {
  if (value === undefined) return undefined
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}

export function createCorsMiddleware(options: CorsOptions = {}): CorsMiddleware {
  const {
    origin,
    methods = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = [],
    exposedHeaders = [],
    credentials = false,
    maxAge,
  } = options

  function middleware(request: NextRequest): NextResponse {
    const requestOrigin = request.headers.get('origin')
    const response = NextResponse.next()

    const varyHeader = response.headers.get('vary') ?? ''
    if (!varyHeader.includes('Origin')) {
      response.headers.set('vary', varyHeader ? `${varyHeader}, Origin` : 'Origin')
    }

    const allowedOrigin = parseOrigin(origin, requestOrigin)
    if (allowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', allowedOrigin)
    }

    if (credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }

    const methodsHeader = methods.join(', ')
    response.headers.set('Access-Control-Allow-Methods', methodsHeader)

    const allowedHeadersValue = allowedHeaders.join(', ')
    if (allowedHeadersValue) {
      response.headers.set('Access-Control-Allow-Headers', allowedHeadersValue)
    }

    const exposedHeadersValue = exposedHeaders.join(', ')
    if (exposedHeadersValue) {
      response.headers.set('Access-Control-Expose-Headers', exposedHeadersValue)
    }

    if (maxAge !== undefined) {
      response.headers.set('Access-Control-Max-Age', String(maxAge))
    }

    return response
  }

  return middleware
}

export { parseOrigin, stringifyHeaderValue }
