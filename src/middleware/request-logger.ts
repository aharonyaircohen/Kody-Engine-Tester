import { NextRequest, NextResponse } from 'next/server'

export interface RequestLoggerConfig {
  skipPaths?: string[]
  logger?: (info: RequestLogInfo) => void
  correlationIdHeader?: string
}

export interface RequestLogInfo {
  method: string
  pathname: string
  statusCode: number
  responseTimeMs: number
  correlationId: string
}

const HEALTH_PATHS = ['/api/health', '/health']
const DEFAULT_CORRELATION_ID_HEADER = 'X-Correlation-ID'

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
  const correlationIdHeader = config.correlationIdHeader ?? DEFAULT_CORRELATION_ID_HEADER

  return function requestLoggerMiddleware(request: NextRequest): NextResponse {
    const pathname = request.nextUrl.pathname

    if (shouldSkipPath(pathname, skipPaths)) {
      return NextResponse.next()
    }

    const correlationId = request.headers.get(correlationIdHeader.toLowerCase()) ?? 'unknown'
    const startTime = Date.now()

    // Create response and set correlation ID header
    const response = NextResponse.next()
    response.headers.set(correlationIdHeader, correlationId)

    const logRequest = () => {
      const responseTimeMs = Date.now() - startTime
      logger({
        method: request.method,
        pathname,
        statusCode: response.status,
        responseTimeMs,
        correlationId,
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
  const { method, pathname, statusCode, responseTimeMs, correlationId } = info
  const ts = new Date().toISOString()
  console.log(
    `[${ts}] ${method} ${pathname} ${statusCode} ${responseTimeMs}ms correlationId=${correlationId}`
  )
}

export { HEALTH_PATHS, DEFAULT_CORRELATION_ID_HEADER, shouldSkipPath }
