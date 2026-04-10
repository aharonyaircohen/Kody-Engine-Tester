import { NextRequest, NextResponse } from 'next/server'

export interface TimestampMiddlewareConfig {
  headerName?: string
}

export interface TimestampMiddleware {
  middleware: (request: NextRequest) => NextResponse
}

export function createTimestampMiddleware(config: TimestampMiddlewareConfig = {}): TimestampMiddleware {
  const headerName = config.headerName ?? 'x-timestamp'

  function middleware(request: NextRequest): NextResponse {
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const response = NextResponse.next()
    response.headers.set(headerName, timestamp)
    return response
  }

  return { middleware }
}