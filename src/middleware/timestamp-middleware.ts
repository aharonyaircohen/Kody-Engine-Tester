import { NextRequest, NextResponse } from 'next/server'

export interface TimestampMiddleware {
  middleware: (request: NextRequest) => NextResponse
}

export function createTimestampMiddleware(): TimestampMiddleware {
  function middleware(_request: NextRequest): NextResponse {
    const response = NextResponse.next()
    response.headers.set('x-timestamp', new Date().toISOString())
    return response
  }

  return { middleware }
}