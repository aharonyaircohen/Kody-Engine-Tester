import { describe, it, expect, vi, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { createCacheMiddleware } from './cache-middleware'

describe('createCacheMiddleware', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function makeRequest(url: string, method = 'GET', headers?: Record<string, string>): NextRequest {
    return new NextRequest(url, {
      method,
      headers,
    })
  }

  describe('cache hit/miss', () => {
    it('returns cached response on cache hit', async () => {
      const mw = createCacheMiddleware({ defaultTTL: 10_000 })
      const req1 = makeRequest('http://localhost/api/test')
      const res1 = await mw(req1, new Response('original'))
      expect(res1.status).toBe(200)

      const req2 = makeRequest('http://localhost/api/test')
      const res2 = await mw(req2, new Response('should not use this'))
      expect(res2.headers.get('X-Cache')).toBe('HIT')
      mw.cache.destroy()
    })

    it('returns original response and caches it on cache miss', async () => {
      const mw = createCacheMiddleware({ defaultTTL: 10_000 })
      const req = makeRequest('http://localhost/api/test')
      const originalResponse = new Response('original', { status: 200 })
      const res = await mw(req, originalResponse)
      expect(res.headers.get('X-Cache')).toBe('MISS')
      mw.cache.destroy()
    })

    it('does not cache responses with non-200 status by default', async () => {
      const mw = createCacheMiddleware({ defaultTTL: 10_000 })
      const req1 = makeRequest('http://localhost/api/test')
      await mw(req1, new Response('error', { status: 500 }))
      const req2 = makeRequest('http://localhost/api/test')
      const res2 = await mw(req2, new Response('cached?', { status: 200 }))
      expect(res2.headers.get('X-Cache')).toBe('MISS')
      mw.cache.destroy()
    })

    it('caches responses with non-200 status when cacheNonGet is true', async () => {
      const mw = createCacheMiddleware({ defaultTTL: 10_000, cacheNonGet: true })
      const req1 = makeRequest('http://localhost/api/test', 'POST')
      await mw(req1, new Response('created', { status: 201 }))
      const req2 = makeRequest('http://localhost/api/test', 'POST')
      const res2 = await mw(req2, new Response('original', { status: 201 }))
      expect(res2.headers.get('X-Cache')).toBe('HIT')
      mw.cache.destroy()
    })
  })

  describe('TTL expiry', () => {
    it('evicts entry after TTL expires', async () => {
      vi.useFakeTimers()
      const mw = createCacheMiddleware({ defaultTTL: 1000 })
      const req1 = makeRequest('http://localhost/api/test')
      await mw(req1, new Response('original'))
      expect(mw.cache.stats().size).toBe(1)

      vi.advanceTimersByTime(1001)
      const req2 = makeRequest('http://localhost/api/test')
      const res2 = await mw(req2, new Response('fresh'))
      expect(res2.headers.get('X-Cache')).toBe('MISS')
      expect(mw.cache.stats().size).toBe(1)
      mw.cache.destroy()
      vi.useRealTimers()
    })

    it('respects per-request TTL override', async () => {
      vi.useFakeTimers()
      const mw = createCacheMiddleware({ defaultTTL: 1000 })
      const req1 = makeRequest('http://localhost/api/test')
      await mw(req1, new Response('original'), 500)

      // At 500ms exactly, entry should still be valid
      vi.advanceTimersByTime(500)
      const req2 = makeRequest('http://localhost/api/test')
      const res2 = await mw(req2, new Response('should not use this'))
      expect(res2.headers.get('X-Cache')).toBe('HIT')

      // At 501ms, entry should be expired (500 + 500 < 501)
      vi.advanceTimersByTime(1)
      const req3 = makeRequest('http://localhost/api/test')
      const res3 = await mw(req3, new Response('fresh'))
      expect(res3.headers.get('X-Cache')).toBe('MISS')
      mw.cache.destroy()
      vi.useRealTimers()
    })
  })

  describe('key generation', () => {
    it('generates different cache keys for different URLs', async () => {
      const mw = createCacheMiddleware({ defaultTTL: 10_000 })
      const req1 = makeRequest('http://localhost/api/test')
      await mw(req1, new Response('test1'))
      const req2 = makeRequest('http://localhost/api/other')
      await mw(req2, new Response('test2'))

      const req1Again = makeRequest('http://localhost/api/test')
      const res = await mw(req1Again, new Response('should not use'))
      expect(res.headers.get('X-Cache')).toBe('HIT')
      mw.cache.destroy()
    })

    it('generates different cache keys for different query strings', async () => {
      const mw = createCacheMiddleware({ defaultTTL: 10_000 })
      const req1 = makeRequest('http://localhost/api/test?foo=bar')
      await mw(req1, new Response('with query'))
      const req2 = makeRequest('http://localhost/api/test?foo=baz')
      await mw(req2, new Response('different query'))

      const res = await mw(makeRequest('http://localhost/api/test?foo=bar'), new Response('should not use'))
      expect(res.headers.get('X-Cache')).toBe('HIT')
      mw.cache.destroy()
    })

    it('supports custom key resolver', async () => {
      const mw = createCacheMiddleware({
        defaultTTL: 10_000,
        keyResolver: (req) => req.headers.get('x-user-id') ?? null,
      })
      const req1 = makeRequest('http://localhost/api/test', 'GET', { 'x-user-id': 'user-a' })
      await mw(req1, new Response('user-a data'))
      const req2 = makeRequest('http://localhost/api/test', 'GET', { 'x-user-id': 'user-b' })
      await mw(req2, new Response('user-b data'))

      const req1Again = makeRequest('http://localhost/api/test', 'GET', { 'x-user-id': 'user-a' })
      const res = await mw(req1Again, new Response('should not use'))
      expect(res.headers.get('X-Cache')).toBe('HIT')
      mw.cache.destroy()
    })

    it('returns null key and bypasses cache when key resolver returns null', async () => {
      const mw = createCacheMiddleware({
        defaultTTL: 10_000,
        keyResolver: () => null,
      })
      const req1 = makeRequest('http://localhost/api/test')
      await mw(req1, new Response('first'))
      const req2 = makeRequest('http://localhost/api/test')
      const res2 = await mw(req2, new Response('second'))
      expect(res2.headers.get('X-Cache')).toBe('MISS')
      mw.cache.destroy()
    })
  })

  describe('HTTP method filtering', () => {
    it('only caches GET requests by default', async () => {
      const mw = createCacheMiddleware({ defaultTTL: 10_000 })
      const postReq = makeRequest('http://localhost/api/test', 'POST')
      await mw(postReq, new Response('posted'))

      const getReq = makeRequest('http://localhost/api/test')
      const res = await mw(getReq, new Response('should not use'))
      expect(res.headers.get('X-Cache')).toBe('MISS')
      mw.cache.destroy()
    })

    it('caches POST requests when cacheNonGet is true', async () => {
      const mw = createCacheMiddleware({ defaultTTL: 10_000, cacheNonGet: true })
      const postReq = makeRequest('http://localhost/api/test', 'POST')
      await mw(postReq, new Response('posted'))

      const postReq2 = makeRequest('http://localhost/api/test', 'POST')
      const res = await mw(postReq2, new Response('should not use'))
      expect(res.headers.get('X-Cache')).toBe('HIT')
      mw.cache.destroy()
    })

    it('does not cache DELETE requests even with cacheNonGet true', async () => {
      const mw = createCacheMiddleware({ defaultTTL: 10_000, cacheNonGet: true })
      const delReq = makeRequest('http://localhost/api/test', 'DELETE')
      await mw(delReq, new Response('deleted'))

      const delReq2 = makeRequest('http://localhost/api/test', 'DELETE')
      const res = await mw(delReq2, new Response('should not use'))
      expect(res.headers.get('X-Cache')).toBe('MISS')
      mw.cache.destroy()
    })
  })

  describe('cache headers', () => {
    it('sets X-Cache header to HIT on cache hit', async () => {
      const mw = createCacheMiddleware({ defaultTTL: 10_000 })
      const req1 = makeRequest('http://localhost/api/test')
      await mw(req1, new Response('original'))
      const req2 = makeRequest('http://localhost/api/test')
      const res = await mw(req2, new Response('not used'))
      expect(res.headers.get('X-Cache')).toBe('HIT')
      mw.cache.destroy()
    })

    it('sets X-Cache header to MISS on cache miss', async () => {
      const mw = createCacheMiddleware({ defaultTTL: 10_000 })
      const req = makeRequest('http://localhost/api/test')
      const res = await mw(req, new Response('original'))
      expect(res.headers.get('X-Cache')).toBe('MISS')
      mw.cache.destroy()
    })

    it('sets X-Cache-Key header on cached responses', async () => {
      const mw = createCacheMiddleware({ defaultTTL: 10_000 })
      const req = makeRequest('http://localhost/api/test')
      const res = await mw(req, new Response('original'))
      expect(res.headers.get('X-Cache-Key')).toBeTruthy()
      mw.cache.destroy()
    })

    it('does not set cache headers when enableCacheHeaders is false', async () => {
      const mw = createCacheMiddleware({ defaultTTL: 10_000, enableCacheHeaders: false })
      const req1 = makeRequest('http://localhost/api/test')
      await mw(req1, new Response('original'))
      const req2 = makeRequest('http://localhost/api/test')
      const res = await mw(req2, new Response('should not use'))
      expect(res.headers.get('X-Cache')).toBeNull()
      mw.cache.destroy()
    })
  })

  describe('maxSize and LRU eviction', () => {
    it('respects maxSize limit', async () => {
      const mw = createCacheMiddleware({ defaultTTL: 10_000, maxSize: 2 })
      await mw(makeRequest('http://localhost/api/a'), new Response('a'))
      await mw(makeRequest('http://localhost/api/b'), new Response('b'))
      expect(mw.cache.stats().size).toBe(2)

      await mw(makeRequest('http://localhost/api/c'), new Response('c'))
      expect(mw.cache.stats().size).toBe(2)
      // First entry should be evicted
      expect(mw.cache.stats().evictions).toBe(1)
      mw.cache.destroy()
    })

    it('LRU eviction refreshes recently accessed entries', async () => {
      const mw = createCacheMiddleware({ defaultTTL: 10_000, maxSize: 2 })
      await mw(makeRequest('http://localhost/api/a'), new Response('a'))
      await mw(makeRequest('http://localhost/api/b'), new Response('b'))

      // Access 'a' to refresh it as most recently used
      await mw(makeRequest('http://localhost/api/a'), new Response('a2'))

      // Adding 'c' should evict 'b' (least recently used)
      await mw(makeRequest('http://localhost/api/c'), new Response('c'))

      // 'a' should still be cached
      const res = await mw(makeRequest('http://localhost/api/a'), new Response('should not use'))
      expect(res.headers.get('X-Cache')).toBe('HIT')
      // 'b' should have been evicted
      const resB = await mw(makeRequest('http://localhost/api/b'), new Response('should not use'))
      expect(resB.headers.get('X-Cache')).toBe('MISS')
      mw.cache.destroy()
    })
  })

  describe('stats', () => {
    it('exposes cache stats via cache.stats()', async () => {
      const mw = createCacheMiddleware({ defaultTTL: 10_000 })
      const req1 = makeRequest('http://localhost/api/test')
      await mw(req1, new Response('original'))
      const req2 = makeRequest('http://localhost/api/test')
      await mw(req2, new Response('not used'))
      expect(mw.cache.stats().hits).toBe(1)
      expect(mw.cache.stats().misses).toBe(1)
      mw.cache.destroy()
    })
  })

  describe('destroy and reset lifecycle', () => {
    it('destroy clears the cache and stops timers', async () => {
      const mw = createCacheMiddleware({ defaultTTL: 10_000 })
      await mw(makeRequest('http://localhost/api/test'), new Response('original'))
      expect(mw.cache.stats().size).toBe(1)
      mw.cache.destroy()
      expect(mw.cache.stats().size).toBe(0)
    })

    it('cache.reset() clears all entries', async () => {
      const mw = createCacheMiddleware({ defaultTTL: 10_000 })
      await mw(makeRequest('http://localhost/api/a'), new Response('a'))
      await mw(makeRequest('http://localhost/api/b'), new Response('b'))
      expect(mw.cache.stats().size).toBe(2)
      mw.cache.reset()
      expect(mw.cache.stats().size).toBe(0)
      mw.cache.destroy()
    })

    it('cache.reset(key) clears specific entry', async () => {
      const mw = createCacheMiddleware({ defaultTTL: 10_000 })
      await mw(makeRequest('http://localhost/api/a'), new Response('a'))
      await mw(makeRequest('http://localhost/api/b'), new Response('b'))
      expect(mw.cache.stats().size).toBe(2)
      mw.cache.reset('http://localhost/api/a')
      expect(mw.cache.stats().size).toBe(1)
      mw.cache.destroy()
    })
  })
})