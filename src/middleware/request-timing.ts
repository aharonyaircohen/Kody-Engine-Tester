import { NextRequest, NextResponse } from 'next/server'

export interface RequestTimingConfig {
  excludedPaths?: string[]
  headerName?: string
  precision?: number
}

export interface RequestTiming {
  middleware: (request: NextRequest) => NextResponse
}

export function createRequestTimingMiddleware(config: RequestTimingConfig = {}): RequestTiming {
  const excludedPaths = new Set(config.excludedPaths ?? ['/health', '/favicon.ico'])
  const headerName = config.headerName ?? 'X-Response-Time'
  const precision = config.precision ?? 2

  function middleware(request: NextRequest): NextResponse {
    const path = request.nextUrl.pathname

    if (excludedPaths.has(path)) {
      return NextResponse.next()
    }

    const startTime = Date.now()
    const response = NextResponse.next()

    const elapsed = Date.now() - startTime
    response.headers.set(headerName, `${elapsed.toFixed(precision)}ms`)

    return response
  }

  return { middleware }
}
