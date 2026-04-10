import { NextRequest, NextResponse } from 'next/server'

export interface TimeoutMiddlewareConfig {
  timeoutMs: number
}

export function createTimeoutMiddleware(config: TimeoutMiddlewareConfig) {
  const startTime = Date.now()

  function middleware(request: NextRequest): NextResponse {
    const elapsed = Date.now() - startTime

    if (elapsed >= config.timeoutMs) {
      return new NextResponse(JSON.stringify({ error: 'Gateway Timeout' }), {
        status: 504,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return NextResponse.next()
  }

  return middleware
}