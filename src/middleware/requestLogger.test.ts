import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { createRequestLoggerMiddleware, generateRequestId, shouldSkipPath } from './requestLogger'

describe('generateRequestId', () => {
  it('generates unique IDs', () => {
    const id1 = generateRequestId()
    const id2 = generateRequestId()
    expect(id1).not.toBe(id2)
  })

  it('starts with req_ prefix', () => {
    const id = generateRequestId()
    expect(id.startsWith('req_')).toBe(true)
  })
})

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

describe('createRequestLoggerMiddleware', () => {
  let logSpy: ReturnType<typeof vi.spyOn>
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy = vi.fn()
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

  describe('request ID handling', () => {
    it('generates and sets X-Request-ID header when not provided', () => {
      const mw = createRequestLoggerMiddleware({ logger: logSpy })
      const req = makeRequest('/api/users')
      const res = mw(req)
      expect(res.headers.get('X-Request-ID')).toMatch(/^req_/)
    })

    it('uses existing X-Request-ID header if provided', () => {
      const mw = createRequestLoggerMiddleware({ logger: logSpy })
      const req = makeRequest('/api/users', { 'x-request-id': 'custom-id-123' })
      const res = mw(req)
      expect(res.headers.get('X-Request-ID')).toBe('custom-id-123')
    })

    it('passes request ID to logger', () => {
      const mw = createRequestLoggerMiddleware({ logger: logSpy })
      const req = makeRequest('/api/users', { 'x-request-id': 'test-id' })
      mw(req)
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ requestId: 'test-id' })
      )
    })
  })

  describe('logging', () => {
    it('logs method, URL, status, and response time', () => {
      const mw = createRequestLoggerMiddleware({ logger: logSpy })
      const req = makeRequest('/api/users')
      mw(req)
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: expect.stringContaining('/api/users'),
          responseTimeMs: expect.any(Number),
        })
      )
    })

    it('uses default console logger when no logger provided', () => {
      const mw = createRequestLoggerMiddleware()
      const req = makeRequest('/api/users')
      mw(req)
      expect(consoleSpy).toHaveBeenCalled()
      const logOutput = consoleSpy.mock.calls[0][0] as string
      expect(logOutput).toContain('GET')
      expect(logOutput).toContain('/api/users')
      expect(logOutput).toContain('requestId=')
    })

    it('logs with custom logger when provided', () => {
      const customLogger = vi.fn()
      const mw = createRequestLoggerMiddleware({ logger: customLogger })
      const req = makeRequest('/api/courses')
      mw(req)
      expect(customLogger).toHaveBeenCalledTimes(1)
    })
  })

  describe('health check path skipping', () => {
    it('skips /api/health endpoint', () => {
      const mw = createRequestLoggerMiddleware({ logger: logSpy })
      const req = makeRequest('/api/health')
      const res = mw(req)
      expect(res.headers.has('X-Request-ID')).toBe(false)
      expect(logSpy).not.toHaveBeenCalled()
    })

    it('skips /health endpoint', () => {
      const mw = createRequestLoggerMiddleware({ logger: logSpy })
      const req = makeRequest('/health')
      const res = mw(req)
      expect(res.headers.has('X-Request-ID')).toBe(false)
      expect(logSpy).not.toHaveBeenCalled()
    })

    it('skips nested health paths', () => {
      const mw = createRequestLoggerMiddleware({ logger: logSpy })
      const req = makeRequest('/api/health/deep')
      const res = mw(req)
      expect(res.headers.has('X-Request-ID')).toBe(false)
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
      expect(res.headers.has('X-Request-ID')).toBe(false)
      expect(logSpy).not.toHaveBeenCalled()
    })

    it('skips nested custom paths', () => {
      const mw = createRequestLoggerMiddleware({
        logger: logSpy,
        skipPaths: ['/api/internal'],
      })
      const req = makeRequest('/api/internal/v2/status')
      const res = mw(req)
      expect(res.headers.has('X-Request-ID')).toBe(false)
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
    it('always passes through to next middleware', () => {
      const mw = createRequestLoggerMiddleware({ logger: logSpy })
      const req = makeRequest('/api/courses')
      const res = mw(req)
      expect(res.status).toBe(200)
    })
  })

  describe('multiple requests', () => {
    it('handles multiple requests with different IDs', () => {
      const mw = createRequestLoggerMiddleware({ logger: logSpy })
      const req1 = makeRequest('/api/users')
      const req2 = makeRequest('/api/courses')
      const res1 = mw(req1)
      const res2 = mw(req2)
      expect(res1.headers.get('X-Request-ID')).not.toBe(res2.headers.get('X-Request-ID'))
    })
  })
})
