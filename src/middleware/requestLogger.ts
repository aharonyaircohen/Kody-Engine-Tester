import { NextRequest, NextResponse } from 'next/server'

export interface RequestLoggerConfig {
  skipPaths?: string[]
  logger?: (info: RequestLogInfo) => void
}

export interface RequestLogInfo {
  method: string
  url: string
  status?: number
  responseTimeMs: number
  requestId: string
}

const HEALTH_PATHS = ['/api/health', '/health']

function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
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

  function middleware(request: NextRequest): NextResponse {
    const pathname = request.nextUrl.pathname

    if (shouldSkipPath(pathname, skipPaths)) {
      return NextResponse.next()
    }

    const requestId = request.headers.get('x-request-id') ?? generateRequestId()
    const startTime = Date.now()

    const response = NextResponse.next()
    response.headers.set('X-Request-ID', requestId)

    const responseTimeMs = Date.now() - startTime

    logger({
      method: request.method,
      url: request.url,
      status: response.status,
      responseTimeMs,
      requestId,
    })

    return response
  }

  middleware.generateRequestId = generateRequestId
  return middleware
}

function defaultLogger(info: RequestLogInfo): void {
  const { method, url, status, responseTimeMs, requestId } = info
  const ts = new Date().toISOString()
  console.log(`[${ts}] ${method} ${url} ${status ?? '-'} ${responseTimeMs}ms requestId=${requestId}`)
}

export { generateRequestId, shouldSkipPath }
