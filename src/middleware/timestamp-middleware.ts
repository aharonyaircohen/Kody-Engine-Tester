import { NextRequest, NextResponse } from 'next/server'

export interface TimestampMiddleware {
  middleware: (request: NextRequest) => NextResponse
}

export function createTimestampMiddleware(): TimestampMiddleware {
  function middleware(request: NextRequest): NextResponse {
    const startTime = Date.now()

    const response = NextResponse.next()
    response.headers.set('X-Response-Time', String(Date.now() - startTime))

    return response
  }

  return { middleware }
}