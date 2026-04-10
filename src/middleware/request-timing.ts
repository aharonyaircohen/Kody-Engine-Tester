import { NextRequest, NextResponse } from 'next/server'

export interface RequestTimingConfig {
  excludedPaths?: string[]
}

export interface RequestTiming {
  middleware: (request: NextRequest) => NextResponse
}

function isExcluded(path: string, excludedPaths: Set<string>): boolean {
  return excludedPaths.has(path)
}

export function createRequestTiming(config: RequestTimingConfig = {}): RequestTiming {
  const excludedPaths = new Set(config.excludedPaths ?? ['/health', '/favicon.ico'])

  function middleware(request: NextRequest): NextResponse {
    const path = request.nextUrl.pathname

    if (isExcluded(path, excludedPaths)) {
      return NextResponse.next()
    }

    const startTime = Date.now()

    const response = NextResponse.next()
    const responseTimeMs = Date.now() - startTime

    response.headers.set('X-Response-Time', `${responseTimeMs}ms`)

    return response
  }

  return { middleware }
}