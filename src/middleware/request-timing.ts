import { NextRequest, NextResponse } from 'next/server'

export interface RequestTimingConfig {
  excludePaths?: string[]
  headerName?: string
  format?: 'ms' | 'string'
}

export interface RequestTiming {
  middleware: (request: NextRequest) => NextResponse
  getHeaderValue: (request: NextRequest, response: NextResponse) => string
}

function formatMs(ms: number): string {
  if (ms < 1) return '<1ms'
  if (ms < 1000) return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

function parseHeaderName(headerName?: string): string {
  return headerName ?? 'X-Response-Time'
}

export function createRequestTiming(config: RequestTimingConfig = {}): RequestTiming {
  const excludePaths = new Set(config.excludePaths ?? ['/health', '/favicon.ico'])
  const headerName = parseHeaderName(config.headerName)
  const format = config.format ?? 'ms'

  // Track request start times
  const requestStartTimes = new Map<string, number>()

  function generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  }

  function getHeaderValue(request: NextRequest, response: NextResponse): string {
    const requestId = response.headers.get('x-request-id') ?? generateRequestId()
    const startTime = requestStartTimes.get(requestId) ?? Date.now()
    const elapsed = Date.now() - startTime

    return format === 'string' ? formatMs(elapsed) : `${elapsed}`
  }

  function middleware(request: NextRequest): NextResponse {
    const path = request.nextUrl.pathname

    // Skip excluded paths
    if (excludePaths.has(path)) {
      return NextResponse.next()
    }

    const requestId = generateRequestId()
    const startTime = Date.now()

    // Store start time for later use
    requestStartTimes.set(requestId, startTime)

    // Create response with request ID header
    const response = NextResponse.next()
    response.headers.set('X-Request-Id', requestId)

    // Calculate and set response time header
    const elapsed = Date.now() - startTime
    const headerValue = format === 'string' ? formatMs(elapsed) : `${elapsed}`
    response.headers.set(headerName, headerValue)

    // Clean up
    requestStartTimes.delete(requestId)

    return response
  }

  return { middleware, getHeaderValue }
}

// Export utilities and factory
export { formatMs }
export { createRequestTiming as default }
