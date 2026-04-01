import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import {
  createRequestLogger,
  formatJson,
  formatText,
  getLogLevel,
  LEVEL_PRIORITY,
  type LogEntry,
} from './request-logger'

function makeRequest(path: string, ip?: string, userAgent?: string): NextRequest {
  const req = new NextRequest(`http://localhost${path}`, {
    headers: {
      ...(ip ? { 'x-forwarded-for': ip } : {}),
      ...(userAgent ? { 'user-agent': userAgent } : {}),
    },
  })
  return req
}

describe('getLogLevel', () => {
  it('returns error for 500+ status codes', () => {
    expect(getLogLevel(500)).toBe('error')
    expect(getLogLevel(502)).toBe('error')
    expect(getLogLevel(503)).toBe('error')
    expect(getLogLevel(599)).toBe('error')
  })

  it('returns warn for 400-499 status codes', () => {
    expect(getLogLevel(400)).toBe('warn')
    expect(getLogLevel(401)).toBe('warn')
    expect(getLogLevel(403)).toBe('warn')
    expect(getLogLevel(404)).toBe('warn')
    expect(getLogLevel(422)).toBe('warn')
    expect(getLogLevel(499)).toBe('warn')
  })

  it('returns info for 2xx and 3xx status codes', () => {
    expect(getLogLevel(200)).toBe('info')
    expect(getLogLevel(201)).toBe('info')
    expect(getLogLevel(204)).toBe('info')
    expect(getLogLevel(301)).toBe('info')
    expect(getLogLevel(302)).toBe('info')
    expect(getLogLevel(304)).toBe('info')
  })
})

describe('LEVEL_PRIORITY', () => {
  it('has correct ordering', () => {
    expect(LEVEL_PRIORITY.debug).toBe(0)
    expect(LEVEL_PRIORITY.info).toBe(1)
    expect(LEVEL_PRIORITY.warn).toBe(2)
    expect(LEVEL_PRIORITY.error).toBe(3)
  })
})

describe('formatJson', () => {
  it('formats log entry as JSON string', () => {
    const entry: LogEntry = {
      timestamp: '2026-04-01T12:00:00.000Z',
      method: 'GET',
      path: '/api/test',
      status: 200,
      responseTimeMs: 45,
      level: 'info',
      userAgent: 'TestAgent/1.0',
      ip: '192.168.1.1',
    }

    const result = formatJson(entry)
    const parsed = JSON.parse(result)

    expect(parsed.timestamp).toBe(entry.timestamp)
    expect(parsed.method).toBe(entry.method)
    expect(parsed.path).toBe(entry.path)
    expect(parsed.status).toBe(entry.status)
    expect(parsed.responseTimeMs).toBe(entry.responseTimeMs)
    expect(parsed.level).toBe(entry.level)
    expect(parsed.userAgent).toBe(entry.userAgent)
    expect(parsed.ip).toBe(entry.ip)
  })

  it('handles entry without optional fields', () => {
    const entry: LogEntry = {
      timestamp: '2026-04-01T12:00:00.000Z',
      method: 'GET',
      path: '/api/test',
      status: 200,
      responseTimeMs: 45,
      level: 'info',
    }

    const result = formatJson(entry)
    const parsed = JSON.parse(result)

    expect(parsed.method).toBe('GET')
    expect(parsed.userAgent).toBeUndefined()
    expect(parsed.ip).toBeUndefined()
  })
})

describe('formatText', () => {
  it('formats log entry as human-readable text', () => {
    const entry: LogEntry = {
      timestamp: '2026-04-01T12:00:00.000Z',
      method: 'POST',
      path: '/api/users',
      status: 201,
      responseTimeMs: 120,
      level: 'info',
      userAgent: 'TestAgent/1.0',
      ip: '10.0.0.1',
    }

    const result = formatText(entry)

    expect(result).toContain('[2026-04-01T12:00:00.000Z]')
    expect(result).toContain('POST')
    expect(result).toContain('/api/users')
    expect(result).toContain('201')
    expect(result).toContain('120ms')
    expect(result).toContain('ip=10.0.0.1')
    expect(result).toContain('ua="TestAgent/1.0"')
  })

  it('formats entry without optional fields', () => {
    const entry: LogEntry = {
      timestamp: '2026-04-01T12:00:00.000Z',
      method: 'GET',
      path: '/health',
      status: 200,
      responseTimeMs: 5,
      level: 'info',
    }

    const result = formatText(entry)

    expect(result).toContain('GET')
    expect(result).toContain('/health')
    expect(result).toContain('200')
    expect(result).toContain('5ms')
    expect(result).not.toContain('ip=')
    expect(result).not.toContain('ua=')
  })
})

describe('createRequestLogger', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-01T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('middleware', () => {
    it('logs request with method, path, status, and response time', () => {
      const logSpy = vi.fn()
      const logger = createRequestLogger({
        logger: {
          debug: logSpy,
          info: logSpy,
          warn: logSpy,
          error: logSpy,
        },
      })

      const req = makeRequest('/api/test')
      logger.middleware(req)

      expect(logSpy).toHaveBeenCalledTimes(1)
      const logCall = logSpy.mock.calls[0]
      const logMessage = logCall[0]

      // Verify JSON format contains expected fields
      const parsed = JSON.parse(logMessage)
      expect(parsed.method).toBe('GET')
      expect(parsed.path).toBe('/api/test')
      expect(parsed.status).toBe(200)
      expect(parsed.responseTimeMs).toBe(0)
    })

    it('adds X-Request-Id header to response', () => {
      const logger = createRequestLogger()
      const req = makeRequest('/api/test')
      const response = logger.middleware(req)

      expect(response.headers.has('X-Request-Id')).toBe(true)
      expect(response.headers.get('X-Request-Id')).toMatch(/^\d+-[a-z0-9]+$/)
    })

    it('skips excluded paths', () => {
      const logSpy = vi.fn()
      const logger = createRequestLogger({
        excludePaths: ['/health', '/favicon.ico'],
        logger: {
          debug: logSpy,
          info: logSpy,
          warn: logSpy,
          error: logSpy,
        },
      })

      const healthReq = makeRequest('/health')
      const healthResponse = logger.middleware(healthReq)

      expect(logSpy).not.toHaveBeenCalled()
      expect(healthResponse.headers.has('X-Request-Id')).toBe(false)
    })

    it('uses default excluded paths when not specified', () => {
      const logSpy = vi.fn()
      const logger = createRequestLogger({
        logger: {
          debug: logSpy,
          info: logSpy,
          warn: logSpy,
          error: logSpy,
        },
      })

      const healthReq = makeRequest('/health')
      logger.middleware(healthReq)

      const faviconReq = makeRequest('/favicon.ico')
      logger.middleware(faviconReq)

      expect(logSpy).not.toHaveBeenCalled()
    })

    it('extracts IP from x-forwarded-for header', () => {
      const logSpy = vi.fn()
      const logger = createRequestLogger({
        logger: {
          debug: logSpy,
          info: logSpy,
          warn: logSpy,
          error: logSpy,
        },
      })

      const req = makeRequest('/api/test', '203.0.113.50, 70.41.3.18, 150.172.238.178')
      logger.middleware(req)

      const parsed = JSON.parse(logSpy.mock.calls[0][0])
      expect(parsed.ip).toBe('203.0.113.50')
    })

    it('extracts IP from x-real-ip header', () => {
      const logSpy = vi.fn()
      const logger = createRequestLogger({
        logger: {
          debug: logSpy,
          info: logSpy,
          warn: logSpy,
          error: logSpy,
        },
      })

      const req = new NextRequest('http://localhost/api/test', {
        headers: { 'x-real-ip': '192.168.1.100' },
      })
      logger.middleware(req)

      const parsed = JSON.parse(logSpy.mock.calls[0][0])
      expect(parsed.ip).toBe('192.168.1.100')
    })

    it('includes user agent in log entry', () => {
      const logSpy = vi.fn()
      const logger = createRequestLogger({
        logger: {
          debug: logSpy,
          info: logSpy,
          warn: logSpy,
          error: logSpy,
        },
      })

      const req = makeRequest('/api/test', undefined, 'Mozilla/5.0 TestBrowser')
      logger.middleware(req)

      const parsed = JSON.parse(logSpy.mock.calls[0][0])
      expect(parsed.userAgent).toBe('Mozilla/5.0 TestBrowser')
    })
  })

  describe('log levels', () => {
    it('logs at info level by default', () => {
      const debugSpy = vi.fn()
      const infoSpy = vi.fn()
      const warnSpy = vi.fn()
      const errorSpy = vi.fn()

      const logger = createRequestLogger({
        logger: {
          debug: debugSpy,
          info: infoSpy,
          warn: warnSpy,
          error: errorSpy,
        },
      })

      const req = makeRequest('/api/test')
      logger.middleware(req)

      expect(infoSpy).toHaveBeenCalled()
      expect(debugSpy).not.toHaveBeenCalled()
      expect(warnSpy).not.toHaveBeenCalled()
      expect(errorSpy).not.toHaveBeenCalled()
    })

    it('respects configured log level - filters info when level is warn', () => {
      const debugSpy = vi.fn()
      const infoSpy = vi.fn()
      const warnSpy = vi.fn()
      const errorSpy = vi.fn()

      const logger = createRequestLogger({
        level: 'warn',
        logger: {
          debug: debugSpy,
          info: infoSpy,
          warn: warnSpy,
          error: errorSpy,
        },
      })

      const req = makeRequest('/api/test')
      // With status 200 (info level), and configured level 'warn',
      // the info log should be filtered out (not called)
      logger.middleware(req)

      // Since status 200 -> 'info' level, and min level is 'warn', info should be filtered
      expect(infoSpy).not.toHaveBeenCalled()
      expect(warnSpy).not.toHaveBeenCalled()
      expect(debugSpy).not.toHaveBeenCalled()
      expect(errorSpy).not.toHaveBeenCalled()
    })

    it('logs at warn level when status is 400+ and level is warn', () => {
      const debugSpy = vi.fn()
      const infoSpy = vi.fn()
      const warnSpy = vi.fn()
      const errorSpy = vi.fn()

      const logger = createRequestLogger({
        level: 'warn',
        logger: {
          debug: debugSpy,
          info: infoSpy,
          warn: warnSpy,
          error: errorSpy,
        },
      })

      const req = makeRequest('/api/test')
      // Call completeAndLog with 404 to get warn level
      const response = new NextResponse(null, { status: 404 })
      logger.completeAndLog(req, response)

      // 404 -> warn level, which should pass the 'warn' threshold
      expect(warnSpy).toHaveBeenCalled()
      expect(infoSpy).not.toHaveBeenCalled()
    })

    it('logs error level for 500 status via completeAndLog', () => {
      const debugSpy = vi.fn()
      const infoSpy = vi.fn()
      const warnSpy = vi.fn()
      const errorSpy = vi.fn()

      const logger = createRequestLogger({
        logger: {
          debug: debugSpy,
          info: infoSpy,
          warn: warnSpy,
          error: errorSpy,
        },
      })

      const req = makeRequest('/api/test')
      // Use new NextResponse to create a response with specific status
      const response = new NextResponse(null, { status: 500 })

      logger.completeAndLog(req, response)

      expect(errorSpy).toHaveBeenCalled()
      const logMessage = errorSpy.mock.calls[0][0]
      const parsed = JSON.parse(logMessage)
      expect(parsed.status).toBe(500)
      expect(parsed.level).toBe('error')
    })
  })

  describe('output formats', () => {
    it('uses JSON format by default', () => {
      const logSpy = vi.fn()
      const logger = createRequestLogger({
        logger: {
          debug: logSpy,
          info: logSpy,
          warn: logSpy,
          error: logSpy,
        },
      })

      const req = makeRequest('/api/test')
      logger.middleware(req)

      const logMessage = logSpy.mock.calls[0][0]
      expect(() => JSON.parse(logMessage)).not.toThrow()
    })

    it('uses text format when configured', () => {
      const logSpy = vi.fn()
      const logger = createRequestLogger({
        format: 'text',
        logger: {
          debug: logSpy,
          info: logSpy,
          warn: logSpy,
          error: logSpy,
        },
      })

      const req = makeRequest('/api/test')
      logger.middleware(req)

      const logMessage = logSpy.mock.calls[0][0]
      // Text format should not parse as JSON
      expect(() => JSON.parse(logMessage)).toThrow()
      // But should contain expected text parts
      expect(logMessage).toContain('GET')
      expect(logMessage).toContain('/api/test')
    })
  })

  describe('completeAndLog', () => {
    it('creates log entry with correct status from response', () => {
      const logSpy = vi.fn()
      const logger = createRequestLogger({
        logger: {
          debug: logSpy,
          info: logSpy,
          warn: logSpy,
          error: logSpy,
        },
      })

      const req = makeRequest('/api/users', '192.168.1.1', 'TestAgent/1.0')
      const response = new NextResponse(JSON.stringify({ created: true }), { status: 201 })

      const entry = logger.completeAndLog(req, response)

      expect(entry.status).toBe(201)
      expect(entry.method).toBe('GET')
      expect(entry.path).toBe('/api/users')
      expect(entry.ip).toBe('192.168.1.1')
      expect(entry.userAgent).toBe('TestAgent/1.0')
    })

    it('returns LogEntry object with all fields', () => {
      const logger = createRequestLogger()

      const req = makeRequest('/api/test', '10.0.0.1', 'CustomAgent')
      const response = NextResponse.next()
      response.headers.set('X-Request-Id', 'test-id')

      const entry = logger.completeAndLog(req, response)

      expect(entry).toMatchObject({
        method: 'GET',
        path: '/api/test',
        status: 200,
        level: 'info',
        ip: '10.0.0.1',
        userAgent: 'CustomAgent',
      })
      expect(entry.timestamp).toBeDefined()
      expect(entry.responseTimeMs).toBeDefined()
    })

    it('uses warn level for 404 responses', () => {
      const warnSpy = vi.fn()
      const logger = createRequestLogger({
        logger: {
          debug: () => {},
          info: () => {},
          warn: warnSpy,
          error: () => {},
        },
      })

      const req = makeRequest('/api/nonexistent')
      const response = new NextResponse(JSON.stringify({ error: 'Not Found' }), { status: 404 })

      logger.completeAndLog(req, response)

      expect(warnSpy).toHaveBeenCalled()
      const logMessage = warnSpy.mock.calls[0][0]
      const parsed = JSON.parse(logMessage)
      expect(parsed.status).toBe(404)
      expect(parsed.level).toBe('warn')
    })
  })

  describe('logResponse', () => {
    it('logs entry for in-flight request with given status', () => {
      const logSpy = vi.fn()
      const logger = createRequestLogger({
        logger: {
          debug: logSpy,
          info: logSpy,
          warn: logSpy,
          error: logSpy,
        },
      })

      const req = makeRequest('/api/test')
      const response = logger.middleware(req)
      const requestId = response.headers.get('X-Request-Id')!

      // Simulate route handler completing with 201 status
      logger.logResponse(requestId, 201)

      // Should have logged twice: once for middleware entry, once for response
      expect(logSpy).toHaveBeenCalledTimes(2)

      // Second log should have the updated status
      const secondLog = JSON.parse(logSpy.mock.calls[1][0])
      expect(secondLog.status).toBe(201)
    })
  })
})

describe('configuration options', () => {
  it('accepts custom excludePaths', () => {
    const logSpy = vi.fn()
    const logger = createRequestLogger({
      excludePaths: ['/api/private', '/api/secret'],
      logger: {
        debug: logSpy,
        info: logSpy,
        warn: logSpy,
        error: logSpy,
      },
    })

    const req1 = makeRequest('/api/private')
    logger.middleware(req1)
    expect(logSpy).not.toHaveBeenCalled()

    const req2 = makeRequest('/api/public')
    logger.middleware(req2)
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  it('handles empty excludePaths', () => {
    const logSpy = vi.fn()
    const logger = createRequestLogger({
      excludePaths: [],
      logger: {
        debug: logSpy,
        info: logSpy,
        warn: logSpy,
        error: logSpy,
      },
    })

    const req = makeRequest('/any/path')
    logger.middleware(req)
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  it('handles custom log level configurations', () => {
    const debugSpy = vi.fn()
    const infoSpy = vi.fn()
    const warnSpy = vi.fn()
    const errorSpy = vi.fn()

    // Test debug level logs everything (all levels pass debug threshold)
    const debugLogger = createRequestLogger({
      level: 'debug',
      logger: { debug: debugSpy, info: infoSpy, warn: warnSpy, error: errorSpy },
    })
    debugLogger.middleware(makeRequest('/api/test'))
    // Status 200 -> info level, which passes debug threshold
    expect(infoSpy).toHaveBeenCalled()

    // Reset spies
    debugSpy.mockClear()
    infoSpy.mockClear()
    warnSpy.mockClear()
    errorSpy.mockClear()

    // Test error level logs only errors (threshold is 3)
    const errorLogger = createRequestLogger({
      level: 'error',
      logger: { debug: debugSpy, info: infoSpy, warn: warnSpy, error: errorSpy },
    })
    errorLogger.middleware(makeRequest('/api/test'))
    // Status 200 -> info level (priority 1), error threshold is 3, so info is filtered
    expect(debugSpy).not.toHaveBeenCalled()
    expect(infoSpy).not.toHaveBeenCalled()
    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
  })
})
