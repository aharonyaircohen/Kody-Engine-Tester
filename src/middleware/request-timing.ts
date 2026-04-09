import { NextRequest, NextResponse } from 'next/server'

export interface RequestTimingConfig {
  headerName?: string
  excludePaths?: string[]
}

export interface RequestTiming {
  middleware: (request: NextRequest) => NextResponse
}

export function createRequestTimingMiddleware(config: RequestTimingConfig = {}): RequestTiming {
  const headerName = config.headerName ?? 'X-Response-Time'
  const excludePaths = new Set(config.excludePaths ?? ['/health', '/favicon.ico'])

  function middleware(request: NextRequest): NextResponse {
    const path = request.nextUrl.pathname

    if (excludePaths.has(path)) {
      return NextResponse.next()
    }

    const startTime = Date.now()
    const response = NextResponse.next()

    response.headers.set(headerName, `${Date.now() - startTime}ms`)

    return response
  }

  return { middleware }
}