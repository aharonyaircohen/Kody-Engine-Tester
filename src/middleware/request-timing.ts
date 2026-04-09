import { NextRequest, NextResponse } from 'next/server'

export interface RequestTimingConfig {
  excludePaths?: string[]
}

export function createRequestTiming(config: RequestTimingConfig = {}) {
  const excludePaths = new Set(config.excludePaths ?? ['/health', '/favicon.ico'])

  return function middleware(request: NextRequest): NextResponse {
    const path = request.nextUrl.pathname

    if (excludePaths.has(path)) {
      return NextResponse.next()
    }

    const startTime = Date.now()
    const response = NextResponse.next()
    response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`)

    return response
  }
}