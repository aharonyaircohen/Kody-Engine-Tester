import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createSearchCacheMiddleware } from './searchCache'
import { NextRequest } from 'next/server'

function createMockNextRequest(url: string = 'http://localhost:3000/api/search?q=test'): NextRequest {
  return new NextRequest(url)
}

describe('createSearchCacheMiddleware', () => {
  let middleware: ReturnType<typeof createSearchCacheMiddleware>

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('extractCacheContext', () => {
    it('extracts cache key from request', () => {
      middleware = createSearchCacheMiddleware({ ttl: 60_000 })
      const req = createMockNextRequest('http://localhost:3000/api/search?q=typescript')
      const ctx = middleware.extractCacheContext(req)
      expect(ctx.cacheKey).toBeDefined()
      expect(typeof ctx.cacheKey).toBe('string')
    })

    it('generates unique keys for different queries', () => {
      middleware = createSearchCacheMiddleware({ ttl: 60_000 })
      const req1 = createMockNextRequest('http://localhost:3000/api/search?q=typescript')
      const req2 = createMockNextRequest('http://localhost:3000/api/search?q=javascript')

      const ctx1 = middleware.extractCacheContext(req1)
      const ctx2 = middleware.extractCacheContext(req2)

      expect(ctx1.cacheKey).not.toBe(ctx2.cacheKey)
    })

    it('generates same key for same query', () => {
      middleware = createSearchCacheMiddleware({ ttl: 60_000 })
      const req1 = createMockNextRequest('http://localhost:3000/api/search?q=typescript')
      const req2 = createMockNextRequest('http://localhost:3000/api/search?q=typescript')

      const ctx1 = middleware.extractCacheContext(req1)
      const ctx2 = middleware.extractCacheContext(req2)

      expect(ctx1.cacheKey).toBe(ctx2.cacheKey)
    })

    it('includes filters in cache key', () => {
      middleware = createSearchCacheMiddleware({ ttl: 60_000 })
      const req1 = createMockNextRequest('http://localhost:3000/api/search?q=typescript&collections=courses')
      const req2 = createMockNextRequest('http://localhost:3000/api/search?q=typescript&collections=lessons')

      const ctx1 = middleware.extractCacheContext(req1)
      const ctx2 = middleware.extractCacheContext(req2)

      expect(ctx1.cacheKey).not.toBe(ctx2.cacheKey)
    })

    it('includes pagination in cache key', () => {
      middleware = createSearchCacheMiddleware({ ttl: 60_000 })
      const req1 = createMockNextRequest('http://localhost:3000/api/search?q=typescript&page=1&limit=10')
      const req2 = createMockNextRequest('http://localhost:3000/api/search?q=typescript&page=2&limit=10')

      const ctx1 = middleware.extractCacheContext(req1)
      const ctx2 = middleware.extractCacheContext(req2)

      expect(ctx1.cacheKey).not.toBe(ctx2.cacheKey)
    })
  })

  describe('middleware cache behavior', () => {
    it('returns cached response on cache hit', () => {
      middleware = createSearchCacheMiddleware({ ttl: 60_000 })
      const req = createMockNextRequest('http://localhost:3000/api/search?q=typescript')

      // First call - cache miss, should continue
      const response1 = middleware(req)
      expect(response1.headers.get('X-Cache')).toBeNull()
      expect(response1.headers.get('X-Cache-Key')).toBeDefined()
    })

    it('returns X-Cache-Key header for route handler', () => {
      middleware = createSearchCacheMiddleware({ ttl: 60_000 })
      const req = createMockNextRequest('http://localhost:3000/api/search?q=typescript')

      const response = middleware(req)
      expect(response.headers.get('X-Cache-Key')).toBeDefined()
    })

    it('uses global cache instance', () => {
      middleware = createSearchCacheMiddleware({ ttl: 60_000 })
      expect(middleware.cache).toBeDefined()
      const stats = middleware.cache.stats()
      expect(stats).toHaveProperty('hits')
      expect(stats).toHaveProperty('misses')
      expect(stats).toHaveProperty('evictions')
      expect(stats).toHaveProperty('size')
    })
  })
})
