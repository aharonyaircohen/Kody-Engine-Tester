import { NextRequest, NextResponse } from 'next/server'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type OutputFormat = 'json' | 'text'

export interface RequestLoggerConfig {
  level?: LogLevel
  format?: OutputFormat
  excludePaths?: string[]
  includeBody?: boolean
  includeHeaders?: boolean
  logger?: {
    debug: (msg: string, data?: Record<string, unknown>) => void
    info: (msg: string, data?: Record<string, unknown>) => void
    warn: (msg: string, data?: Record<string, unknown>) => void
    error: (msg: string, data?: Record<string, unknown>) => void
  }
}

export interface LogEntry {
  timestamp: string
  method: string
  path: string
  status: number
  responseTimeMs: number
  level: LogLevel
  userAgent?: string
  ip?: string
}

export interface RequestLogger {
  log: (entry: LogEntry) => void
  logResponse: (requestId: string, status: number) => void
  middleware: (request: NextRequest) => NextResponse
  completeAndLog: (request: NextRequest, response: NextResponse) => LogEntry
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

export function formatJson(entry: LogEntry): string {
  return JSON.stringify(entry)
}

export function formatText(entry: LogEntry): string {
  const { timestamp, method, path, status, responseTimeMs, userAgent, ip } = entry
  const parts = [`[${timestamp}]`, `${method}`, `${path}`, `${status}`, `${responseTimeMs}ms`]
  if (ip) parts.push(`ip=${ip}`)
  if (userAgent) parts.push(`ua="${userAgent}"`)
  return parts.join(' ')
}

export function getLogLevel(status: number): LogLevel {
  if (status >= 500) return 'error'
  if (status >= 400) return 'warn'
  return 'info'
}

function createDefaultLogger(minLevel: LogLevel) {
  const threshold = LEVEL_PRIORITY[minLevel]

  return {
    debug: (msg: string, data?: Record<string, unknown>) => {
      if (LEVEL_PRIORITY['debug'] >= threshold) {
        console.debug(msg, data ?? {})
      }
    },
    info: (msg: string, data?: Record<string, unknown>) => {
      if (LEVEL_PRIORITY['info'] >= threshold) {
        console.info(msg, data ?? {})
      }
    },
    warn: (msg: string, data?: Record<string, unknown>) => {
      if (LEVEL_PRIORITY['warn'] >= threshold) {
        console.warn(msg, data ?? {})
      }
    },
    error: (msg: string, data?: Record<string, unknown>) => {
      if (LEVEL_PRIORITY['error'] >= threshold) {
        console.error(msg, data ?? {})
      }
    },
  }
}

export function createRequestLogger(config: RequestLoggerConfig = {}): RequestLogger {
  const level = config.level ?? 'info'
  const format = config.format ?? 'json'
  const excludePaths = new Set(config.excludePaths ?? ['/health', '/favicon.ico'])
  const customLogger = config.logger
  const defaultLogger = createDefaultLogger(level)
  const logger = customLogger ?? defaultLogger
  const minLevelPriority = LEVEL_PRIORITY[level]

  // Store in-flight request data for later completion
  const inFlightRequests = new Map<string, { startTime: number; entry: Partial<LogEntry> }>()

  function generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  }

  function log(entry: LogEntry): void {
    const logLevel = getLogLevel(entry.status)
    const formatted = format === 'json' ? formatJson(entry) : formatText(entry)

    // Apply level filtering - skip if entry level is below configured minimum
    if (LEVEL_PRIORITY[logLevel] < minLevelPriority) {
      return
    }

    switch (logLevel) {
      case 'error':
        logger.error(formatted, { ...entry })
        break
      case 'warn':
        logger.warn(formatted, { ...entry })
        break
      case 'info':
        logger.info(formatted, { ...entry })
        break
      default:
        logger.debug(formatted, { ...entry })
    }
  }

  function logResponse(requestId: string, status: number): void {
    const requestData = inFlightRequests.get(requestId)
    if (!requestData) return

    const { startTime, entry } = requestData
    const responseTimeMs = Date.now() - startTime

    const fullEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      method: entry.method ?? 'GET',
      path: entry.path ?? '/',
      status,
      responseTimeMs,
      level: getLogLevel(status),
      userAgent: entry.userAgent,
      ip: entry.ip,
    }

    log(fullEntry)
    inFlightRequests.delete(requestId)
  }

  function completeAndLog(request: NextRequest, response: NextResponse): LogEntry {
    const requestId = response.headers.get('x-request-id') ?? generateRequestId()
    const status = response.status
    const responseTimeMs = Date.now()

    // Try to get stored start time, or use current time
    const requestData = inFlightRequests.get(requestId)
    const startTime = requestData?.startTime ?? Date.now()

    const method = request.method
    const path = request.nextUrl.pathname
    const userAgent = request.headers.get('user-agent') ?? undefined
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      undefined

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      method,
      path,
      status,
      responseTimeMs: Date.now() - startTime,
      level: getLogLevel(status),
      userAgent,
      ip,
    }

    log(entry)

    if (requestData) {
      inFlightRequests.delete(requestId)
    }

    return entry
  }

  function middleware(request: NextRequest): NextResponse {
    const path = request.nextUrl.pathname

    // Skip excluded paths
    if (excludePaths.has(path)) {
      return NextResponse.next()
    }

    const requestId = generateRequestId()
    const startTime = Date.now()
    const method = request.method
    const userAgent = request.headers.get('user-agent') ?? undefined
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      undefined

    // Store start time for later use via logResponse() or completeAndLog()
    inFlightRequests.set(requestId, {
      startTime,
      entry: {
        method,
        path,
        userAgent,
        ip,
      },
    })

    // Create response with request ID header so downstream can complete the log
    const response = NextResponse.next()
    response.headers.set('X-Request-Id', requestId)

    // Calculate response time for middleware-level logging
    const responseTimeMs = Date.now() - startTime

    // Create and emit the log entry with default 200 status
    // Note: The actual route handler status may differ; use completeAndLog() for accuracy
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      method,
      path,
      status: 200,
      responseTimeMs,
      level: 'info',
      userAgent,
      ip,
    }

    log(entry)

    return response
  }

  return { log, logResponse, middleware, completeAndLog }
}

// Export utilities and factory
export { LEVEL_PRIORITY }
export { createRequestLogger as default }
