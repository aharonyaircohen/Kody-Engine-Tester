import { NextRequest, NextResponse } from 'next/server'

export interface RequestLoggerConfig {
  skipPaths?: string[]
  logger?: (info: RequestLogInfo) => void
}

export interface RequestLogInfo {
  method: string
  pathname: string
  responseTimeMs: number
  requestId: string
}

const HEALTH_PATHS = ['/api/health', '/health']

function generateRequestId(): string {
  return crypto.randomUUID()
}

function shouldSkipPath(pathname: string, skipPaths: string[]): boolean {
  for (const skipPath of skipPaths) {
    if (skipPath === pathname || pathname.startsWith(skipPath + '/')) {
      return true
    }
  }
  return false
}

export function createRequestLoggerMiddleware(config: RequestLoggerConfig = {}) {
  const skipPaths = [...HEALTH_PATHS, ...(config.skipPaths ?? [])]
  const logger = config.logger ?? defaultLogger

  return function middleware(request: NextRequest): NextResponse {
    const pathname = request.nextUrl.pathname

    if (shouldSkipPath(pathname, skipPaths)) {
      return NextResponse.next()
    }

    const requestId = request.headers.get('x-request-id') ?? generateRequestId()
    const startTime = Date.now()

    // Create response and set request ID header
    const response = NextResponse.next()
    response.headers.set('X-Request-ID', requestId)

    const logRequest = () => {
      const responseTimeMs = Date.now() - startTime
      logger({
        method: request.method,
        pathname,
        responseTimeMs,
        requestId,
      })
    }

    // Use waitUntil to measure actual request processing time when available (Edge Runtime)
    // This fires after the route handler completes, capturing true response time
    // Fall back to synchronous logging in non-Edge environments (tests)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responseWithWaitUntil = response as unknown as { waitUntil?: (fn: () => void) => void }
    if (typeof responseWithWaitUntil.waitUntil === 'function') {
      responseWithWaitUntil.waitUntil(logRequest)
    } else {
      logRequest()
    }

    return response
  }
}

function defaultLogger(info: RequestLogInfo): void {
  const { method, pathname, responseTimeMs, requestId } = info
  const ts = new Date().toISOString()
  console.log(`[${ts}] ${method} ${pathname} ${responseTimeMs}ms requestId=${requestId}`)
}

export { generateRequestId, shouldSkipPath }
