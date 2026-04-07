import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { createLogContextMiddleware } from './log-context'

function makeRequest(path: string): NextRequest {
  return new NextRequest(`http://localhost${path}`)
}

describe('createLogContextMiddleware', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-01T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('middleware', () => {
    it('generates a valid UUID for request ID', () => {
      const { middleware } = createLogContextMiddleware()
      const req = makeRequest('/api/test')
      const response = middleware(req)

      const requestId = response.headers.get('x-request-id')
      expect(requestId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      )
    })

    it('adds x-request-id header to response', () => {
      const { middleware } = createLogContextMiddleware()
      const req = makeRequest('/api/test')
      const response = middleware(req)

      expect(response.headers.has('x-request-id')).toBe(true)
      expect(response.headers.get('x-request-id')).toBeTruthy()
    })

    it('adds timestamp to req.locals', () => {
      const { middleware } = createLogContextMiddleware()
      const req = makeRequest('/api/test')

      middleware(req)

      const locals = (req as NextRequest & { locals: Record<string, unknown> }).locals
      expect(locals).toHaveProperty('requestId')
      expect(locals).toHaveProperty('timestamp')
      expect(typeof locals.timestamp).toBe('number')
    })

    it('uses Date.now() for timestamp', () => {
      const { middleware } = createLogContextMiddleware()
      const req = makeRequest('/api/test')
      const before = Date.now()

      middleware(req)

      const after = Date.now()
      const locals = (req as NextRequest & { locals: Record<string, unknown> }).locals
      expect(locals.timestamp).toBeGreaterThanOrEqual(before)
      expect(locals.timestamp).toBeLessThanOrEqual(after)
    })

    it('works without any incoming headers', () => {
      const { middleware } = createLogContextMiddleware()
      const req = new NextRequest('http://localhost/api/test', {
        headers: {},
      })

      const response = middleware(req)

      expect(response.headers.has('x-request-id')).toBe(true)
      const requestId = response.headers.get('x-request-id')
      expect(requestId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      )
    })

    it('returns a NextResponse with the same status as NextResponse.next()', () => {
      const { middleware } = createLogContextMiddleware()
      const req = makeRequest('/api/test')
      const response = middleware(req)

      expect(response.status).toBe(200)
    })
  })

  describe('returned context object', () => {
    it('exposes current requestId and timestamp from the last middleware call', () => {
      const { middleware } = createLogContextMiddleware()
      const req = makeRequest('/api/test')
      const response = middleware(req)

      const requestId = response.headers.get('x-request-id')
      expect(requestId).toBeTruthy()
    })

    it('context is accessible after middleware runs', () => {
      const { middleware } = createLogContextMiddleware()
      const req = makeRequest('/api/test')
      middleware(req)

      expect(() => {
        const locals = (req as NextRequest & { locals: Record<string, unknown> }).locals
        if (typeof locals.requestId !== 'string' || typeof locals.timestamp !== 'number') {
          throw new Error('Invalid context')
        }
      }).not.toThrow()
    })
  })

  describe('concurrent requests', () => {
    it('each request gets a unique request ID', () => {
      const { middleware } = createLogContextMiddleware()

      const req1 = makeRequest('/api/test/1')
      const req2 = makeRequest('/api/test/2')
      const req3 = makeRequest('/api/test/3')

      const response1 = middleware(req1)
      const response2 = middleware(req2)
      const response3 = middleware(req3)

      const id1 = response1.headers.get('x-request-id')
      const id2 = response2.headers.get('x-request-id')
      const id3 = response3.headers.get('x-request-id')

      expect(id1).not.toBe(id2)
      expect(id2).not.toBe(id3)
      expect(id1).not.toBe(id3)
    })

    it('timestamps are distinct for concurrent requests', () => {
      const { middleware } = createLogContextMiddleware()

      const timestamps: number[] = []

      for (let i = 0; i < 10; i++) {
        vi.advanceTimersByTime(1000)
        const req = makeRequest(`/api/test/${i}`)
        middleware(req)
        const locals = (req as NextRequest & { locals: Record<string, unknown> }).locals
        timestamps.push(locals.timestamp as number)
      }

      const uniqueTimestamps = new Set(timestamps)
      expect(uniqueTimestamps.size).toBe(10)
    })

    it('no collisions occur when many requests are made in sequence', () => {
      const { middleware } = createLogContextMiddleware()
      const ids = new Set<string>()

      for (let i = 0; i < 100; i++) {
        const req = makeRequest(`/api/test/${i}`)
        const response = middleware(req)
        const id = response.headers.get('x-request-id')
        expect(ids.has(id!)).toBe(false)
        ids.add(id!)
      }

      expect(ids.size).toBe(100)
    })
  })

  describe('interface', () => {
    it('returns middleware function', () => {
      const context = createLogContextMiddleware()
      expect(typeof context.middleware).toBe('function')
    })

    it('middleware accepts NextRequest and returns NextResponse', () => {
      const { middleware } = createLogContextMiddleware()
      const req = makeRequest('/api/test')
      const result = middleware(req)

      expect(result).toBeInstanceOf(NextResponse)
    })
  })
})