import { NextRequest, NextResponse } from 'next/server'

export interface RequestLoggerConfig {
  skipPaths?: string[]
  logger?: (info: RequestLogInfo) => void
}

export interface RequestLogInfo {
  method: string
  pathname: string
  status?: number
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

    // Clone the request to allow reading the body for response time measurement
    // The actual route handler status is not available in middleware - we measure
    // the middleware processing time and note this limitation in the log
    const response = NextResponse.next()

    // Set the request ID header on the response
    response.headers.set('X-Request-ID', requestId)

    const responseTimeMs = Date.now() - startTime

    // Note: response.status reflects the initial response status from NextResponse.next()
    // The actual final status code from the route handler is not available in middleware.
    // responseTimeMs measures middleware processing time, not full request handling time.
    logger({
      method: request.method,
      pathname,
      status: response.status,
      responseTimeMs,
      requestId,
    })

    return response
  }
}

function defaultLogger(info: RequestLogInfo): void {
  const { method, pathname, status, responseTimeMs, requestId } = info
  const ts = new Date().toISOString()
  console.log(`[${ts}] ${method} ${pathname} ${status ?? '-'} ${responseTimeMs}ms requestId=${requestId}`)
}

export { generateRequestId, shouldSkipPath }
