import { NextRequest, NextResponse } from 'next/server'

export interface RequestTimingConfig {
  excludePaths?: string[]
}

export interface RequestTiming {
  middleware: (request: NextRequest) => NextResponse
}

export function createRequestTimingMiddleware(config: RequestTimingConfig = {}): RequestTiming {
  const excludePaths = new Set(config.excludePaths ?? ['/health', '/favicon.ico'])

  function middleware(request: NextRequest): NextResponse {
    const path = request.nextUrl.pathname

    // Skip excluded paths
    if (excludePaths.has(path)) {
      return NextResponse.next()
    }

    const startTime = Date.now()

    // Create response and add timing header
    const response = NextResponse.next()
    const responseTimeMs = Date.now() - startTime

    response.headers.set('X-Response-Time', `${responseTimeMs}ms`)

    return response
  }

  return { middleware }
}