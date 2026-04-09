import { NextRequest, NextResponse } from 'next/server'

export interface TimeoutMiddlewareConfig {
  timeoutMs?: number
  excludePaths?: string[]
}

export interface TimeoutResult {
  timedOut: boolean
  elapsedMs: number
}

function getDefaultTimeout(): number {
  return 30_000 // 30 seconds
}

// In-memory store for request start times (shared across middleware instances per worker)
const requestStartTimes = new Map<string, number>()

export function createTimeoutMiddleware(config: TimeoutMiddlewareConfig = {}) {
  const timeoutMs = config.timeoutMs ?? getDefaultTimeout()
  const excludePaths = new Set(config.excludePaths ?? ['/health', '/favicon.ico'])

  function generateRequestId(request: NextRequest): string {
    return (
      request.headers.get('x-request-id') ??
      `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    )
  }

  function middleware(request: NextRequest): NextResponse {
    const path = request.nextUrl.pathname

    // Skip excluded paths
    if (excludePaths.has(path)) {
      return NextResponse.next()
    }

    const requestId = generateRequestId(request)
    const now = Date.now()

    // Get or set start time for this request
    let startTime = requestStartTimes.get(requestId)
    if (startTime === undefined) {
      startTime = now
      requestStartTimes.set(requestId, startTime)
    }

    const elapsedMs = now - startTime

    if (elapsedMs > timeoutMs) {
      // Clean up the start time since the request is now terminated
      requestStartTimes.delete(requestId)
      const response = new NextResponse(JSON.stringify({ error: 'Gateway Timeout' }), {
        status: 504,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Timeout': 'true',
        },
      })
      return response
    }

    const response = NextResponse.next()
    response.headers.set('X-Request-Id', requestId)

    return response
  }

  middleware.checkTimeout = function (request: NextRequest): TimeoutResult {
    const requestId = generateRequestId(request)
    const startTime = requestStartTimes.get(requestId)

    if (startTime === undefined) {
      const now = Date.now()
      return {
        timedOut: false,
        elapsedMs: 0,
      }
    }

    const elapsedMs = Date.now() - startTime
    return {
      timedOut: elapsedMs > timeoutMs,
      elapsedMs,
    }
  }

  middleware.timeoutMs = timeoutMs

  middleware.clearStore = function (): void {
    requestStartTimes.clear()
  }

  return middleware
}

export { getDefaultTimeout }
export default createTimeoutMiddleware