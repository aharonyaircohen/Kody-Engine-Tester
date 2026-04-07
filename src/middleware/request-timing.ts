import { NextRequest, NextResponse } from 'next/server'

export interface RequestTimingConfig {
  excludePaths?: string[]
}

export interface RequestTiming {
  middleware: (request: NextRequest) => NextResponse
}

export function createRequestTiming(_config: RequestTimingConfig = {}): RequestTiming {
  function middleware(request: NextRequest): NextResponse {
    const startTime = Date.now()

    // Create response and let it pass through
    const response = NextResponse.next()

    // Calculate elapsed time and set header
    const responseTimeMs = Date.now() - startTime
    response.headers.set('X-Response-Time', `${responseTimeMs}`)

    return response
  }

  return { middleware }
}