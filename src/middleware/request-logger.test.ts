import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import {
  createRequestLoggerMiddleware,
  shouldSkipPath,
  HEALTH_PATHS,
  DEFAULT_CORRELATION_ID_HEADER,
} from './request-logger'

describe('shouldSkipPath', () => {
  it('returns true for exact match', () => {
    expect(shouldSkipPath('/api/health', ['/api/health'])).toBe(true)
  })

  it('returns true for nested paths', () => {
    expect(shouldSkipPath('/api/health/check', ['/api/health'])).toBe(true)
  })

  it('returns false for non-matching paths', () => {
    expect(shouldSkipPath('/api/users', ['/api/health'])).toBe(false)
  })

  it('handles multiple skip paths', () => {
    expect(shouldSkipPath('/api/health', ['/api/health', '/api/other'])).toBe(true)
    expect(shouldSkipPath('/api/other', ['/api/health', '/api/other'])).toBe(true)
    expect(shouldSkipPath('/api/users', ['/api/health', '/api/other'])).toBe(false)
  })
})

describe('HEALTH_PATHS', () => {
  it('contains /api/health and /health', () => {
    expect(HEALTH_PATHS).toContain('/api/health')
    expect(HEALTH_PATHS).toContain('/health')
  })
})

describe('DEFAULT_CORRELATION_ID_HEADER', () => {
  it('is X-Correlation-ID', () => {
    expect(DEFAULT_CORRELATION_ID_HEADER).toBe('X-Correlation-ID')
  })
})

describe('createRequestLoggerMiddleware', () => {
  let logSpy: (info: import('./request-logger').RequestLogInfo) => void
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy = vi.fn((_info: import('./request-logger').RequestLogInfo) => {})
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  function makeRequest(path: string, headers?: Record<string, string>): NextRequest {
    return new NextRequest(`http://localhost${path}`, {
      headers,
    })
  }

  describe('correlation ID handling', () => {
    it('uses X-Correlation-ID from request headers', () => {
      const mw = createRequestLoggerMiddleware({ logger: logSpy })
      const req = makeRequest('/api/users', { 'x-correlation-id': 'test-correlation-123' })
      mw(req)

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ correlationId: 'test-correlation-123' })
      )
    })

    it('uses unknown when no correlation ID is provided', () => {
      const mw = createRequestLoggerMiddleware({ logger: logSpy })
      const req = makeRequest('/api/users')
      mw(req)

      expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({ correlationId: 'unknown' }))
    })

    it('uses custom correlation ID header when specified', () => {
      const mw = createRequestLoggerMiddleware({
        logger: logSpy,
        correlationIdHeader: 'X-Request-Id',
      })
      const req = makeRequest('/api/users', { 'x-request-id': 'req-id-789' })
      mw(req)

      expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({ correlationId: 'req-id-789' }))
    })

    it('is case-insensitive for correlation ID header lookup', () => {
      const mw = createRequestLoggerMiddleware({ logger: logSpy })
      const req = makeRequest('/api/users', { 'X-CORRELATION-ID': 'uppercase-id' })
      mw(req)

      expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({ correlationId: 'uppercase-id' }))
    })
  })

  describe('logging', () => {
    it('logs method, pathname, status code, and response time', () => {
      const mw = createRequestLoggerMiddleware({ logger: logSpy })
      const req = makeRequest('/api/users')
      mw(req)

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          pathname: '/api/users',
          statusCode: 200,
          responseTimeMs: expect.any(Number),
        })
      )
    })

    it('logs with custom logger when provided', () => {
      const customLogger = vi.fn()
      const mw = createRequestLoggerMiddleware({ logger: customLogger })
      const req = makeRequest('/api/courses')
      mw(req)

      expect(customLogger).toHaveBeenCalledTimes(1)
    })

    it('uses default console logger when no logger provided', () => {
      const mw = createRequestLoggerMiddleware()
      const req = makeRequest('/api/users')
      mw(req)

      expect(consoleSpy).toHaveBeenCalled()
      const logOutput = consoleSpy.mock.calls[0][0] as string
      expect(logOutput).toContain('GET')
      expect(logOutput).toContain('/api/users')
      expect(logOutput).toContain('correlationId=')
    })

    it('includes correlation ID in default logger output', () => {
      const mw = createRequestLoggerMiddleware()
      const req = makeRequest('/api/users', { 'x-correlation-id': 'my-id' })
      mw(req)

      expect(consoleSpy).toHaveBeenCalled()
      const logOutput = consoleSpy.mock.calls[0][0] as string
      expect(logOutput).toContain('correlationId=my-id')
    })
  })

  describe('health check path skipping', () => {
    it('skips /api/health endpoint', () => {
      const mw = createRequestLoggerMiddleware({ logger: logSpy })
      const req = makeRequest('/api/health')
      const res = mw(req)

      expect(res.headers.has('X-Correlation-ID')).toBe(false)
      expect(logSpy).not.toHaveBeenCalled()
    })

    it('skips /health endpoint', () => {
      const mw = createRequestLoggerMiddleware({ logger: logSpy })
      const req = makeRequest('/health')
      const res = mw(req)

      expect(res.headers.has('X-Correlation-ID')).toBe(false)
      expect(logSpy).not.toHaveBeenCalled()
    })

    it('skips nested health paths', () => {
      const mw = createRequestLoggerMiddleware({ logger: logSpy })
      const req = makeRequest('/api/health/deep')
      const res = mw(req)

      expect(res.headers.has('X-Correlation-ID')).toBe(false)
      expect(logSpy).not.toHaveBeenCalled()
    })

    it('still logs non-health paths', () => {
      const mw = createRequestLoggerMiddleware({ logger: logSpy })
      const req = makeRequest('/api/users')
      mw(req)

      expect(logSpy).toHaveBeenCalled()
    })
  })

  describe('custom skip paths', () => {
    it('skips custom paths in addition to health paths', () => {
      const mw = createRequestLoggerMiddleware({
        logger: logSpy,
        skipPaths: ['/api/secret'],
      })
      const req = makeRequest('/api/secret')
      const res = mw(req)

      expect(res.headers.has('X-Correlation-ID')).toBe(false)
      expect(logSpy).not.toHaveBeenCalled()
    })

    it('skips nested custom paths', () => {
      const mw = createRequestLoggerMiddleware({
        logger: logSpy,
        skipPaths: ['/api/internal'],
      })
      const req = makeRequest('/api/internal/v2/status')
      const res = mw(req)

      expect(res.headers.has('X-Correlation-ID')).toBe(false)
      expect(logSpy).not.toHaveBeenCalled()
    })

    it('does not skip paths not in skip list', () => {
      const mw = createRequestLoggerMiddleware({
        logger: logSpy,
        skipPaths: ['/api/secret'],
      })
      const req = makeRequest('/api/public')
      mw(req)

      expect(logSpy).toHaveBeenCalled()
    })
  })

  describe('response headers', () => {
    it('sets X-Correlation-ID header on response', () => {
      const mw = createRequestLoggerMiddleware({ logger: logSpy })
      const req = makeRequest('/api/users', { 'x-correlation-id': 'my-correlation-id' })
      const res = mw(req)

      expect(res.headers.get('X-Correlation-ID')).toBe('my-correlation-id')
    })

    it('always passes through to next middleware', () => {
      const mw = createRequestLoggerMiddleware({ logger: logSpy })
      const req = makeRequest('/api/courses')
      const res = mw(req)

      expect(res.status).toBe(200)
    })
  })

  describe('multiple requests', () => {
    it('handles multiple requests with different correlation IDs', () => {
      const mw = createRequestLoggerMiddleware({ logger: logSpy })
      const req1 = makeRequest('/api/users', { 'x-correlation-id': 'id-1' })
      const req2 = makeRequest('/api/courses', { 'x-correlation-id': 'id-2' })
      mw(req1)
      mw(req2)

      expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({ correlationId: 'id-1' }))
      expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({ correlationId: 'id-2' }))
    })
  })

  describe('request methods', () => {
    it('logs POST method correctly', () => {
      const mw = createRequestLoggerMiddleware({ logger: logSpy })
      const req = new NextRequest('http://localhost/api/users', {
        method: 'POST',
        headers: { 'x-correlation-id': 'post-id' },
      })
      mw(req)

      expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({ method: 'POST' }))
    })

    it('logs PUT method correctly', () => {
      const mw = createRequestLoggerMiddleware({ logger: logSpy })
      const req = new NextRequest('http://localhost/api/users/1', {
        method: 'PUT',
        headers: { 'x-correlation-id': 'put-id' },
      })
      mw(req)

      expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({ method: 'PUT' }))
    })

    it('logs DELETE method correctly', () => {
      const mw = createRequestLoggerMiddleware({ logger: logSpy })
      const req = new NextRequest('http://localhost/api/users/1', {
        method: 'DELETE',
        headers: { 'x-correlation-id': 'delete-id' },
      })
      mw(req)

      expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({ method: 'DELETE' }))
    })
  })

  describe('response time measurement', () => {
    it('captures response time as a positive number', () => {
      const mw = createRequestLoggerMiddleware({ logger: logSpy })
      const req = makeRequest('/api/users')
      mw(req)

      expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({
        responseTimeMs: expect.any(Number),
      }))
      const call = (logSpy as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.responseTimeMs).toBeGreaterThanOrEqual(0)
    })
  })
})
