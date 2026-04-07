import { NextRequest, NextResponse } from 'next/server'

export interface TimestampMiddlewareConfig {
  headerName?: string
}

export function createTimestampMiddleware(config: TimestampMiddlewareConfig = {}): {
  middleware: (request: NextRequest) => NextResponse
} {
  const headerName = config.headerName ?? 'X-Timestamp'

  function middleware(request: NextRequest): NextResponse {
    const response = NextResponse.next()
    response.headers.set(headerName, new Date().toISOString())
    return response
  }

  return { middleware }
}

export function createTimestampHeader(): string {
  return new Date().toISOString()
}