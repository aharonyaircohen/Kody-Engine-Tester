import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { createCacheControlMiddleware } from './cacheControl'

describe('createCacheControlMiddleware', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function makeRequest(headers?: Record<string, string>): NextRequest {
    return new NextRequest('http://localhost/api/test', {
      headers,
    })
  }

  describe('Cache-Control header', () => {
    it('sets no-store cache policy', async () => {
      const mw = createCacheControlMiddleware({ cachePolicy: 'no-store' })
      const res = await mw(makeRequest(), 'content')
      expect(res.headers.get('Cache-Control')).toBe('no-store')
    })

    it('sets no-cache cache policy', async () => {
      const mw = createCacheControlMiddleware({ cachePolicy: 'no-cache' })
      const res = await mw(makeRequest(), 'content')
      expect(res.headers.get('Cache-Control')).toBe('no-cache')
    })

    it('sets max-age in cache policy', async () => {
      const mw = createCacheControlMiddleware({ cachePolicy: 'max-age', maxAge: 3600 })
      const res = await mw(makeRequest(), 'content')
      expect(res.headers.get('Cache-Control')).toBe('max-age=3600')
    })

    it('sets private cache policy', async () => {
      const mw = createCacheControlMiddleware({ cachePolicy: 'private' })
      const res = await mw(makeRequest(), 'content')
      expect(res.headers.get('Cache-Control')).toBe('private')
    })

    it('sets stale-while-revalidate when configured', async () => {
      const mw = createCacheControlMiddleware({
        cachePolicy: 'max-age',
        maxAge: 3600,
        staleWhileRevalidate: 600,
      })
      const res = await mw(makeRequest(), 'content')
      expect(res.headers.get('Cache-Control')).toBe('max-age=3600, stale-while-revalidate=600')
    })

    it('passes through without conditional check when no cache headers needed', async () => {
      const mw = createCacheControlMiddleware({ cachePolicy: 'no-store' })
      const res = await mw(makeRequest(), 'content')
      expect(res.status).toBe(200)
      expect(res.headers.get('ETag')).not.toBeNull()
      expect(res.headers.get('Last-Modified')).not.toBeNull()
    })
  })

  describe('ETag header', () => {
    it('generates a weak ETag based on content hash', async () => {
      const mw = createCacheControlMiddleware({ cachePolicy: 'no-store' })
      const res = await mw(makeRequest(), 'hello world')
      const etag = res.headers.get('ETag')
      expect(etag).toMatch(/^W\/".+"$/)
    })

    it('generates different ETags for different content', async () => {
      const mw = createCacheControlMiddleware({ cachePolicy: 'no-store' })
      const res1 = await mw(makeRequest(), 'content-a')
      const res2 = await mw(makeRequest(), 'content-b')
      expect(res1.headers.get('ETag')).not.toBe(res2.headers.get('ETag'))
    })

    it('generates same ETag for same content', async () => {
      const mw = createCacheControlMiddleware({ cachePolicy: 'no-store' })
      const res1 = await mw(makeRequest(), 'same content')
      const res2 = await mw(makeRequest(), 'same content')
      expect(res1.headers.get('ETag')).toBe(res2.headers.get('ETag'))
    })
  })

  describe('Last-Modified header', () => {
    it('sets Last-Modified header', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-04-10T12:00:00Z'))

      const mw = createCacheControlMiddleware({ cachePolicy: 'no-store' })
      const res = await mw(makeRequest(), 'content')

      expect(res.headers.get('Last-Modified')).toBe('Fri, 10 Apr 2026 12:00:00 GMT')

      vi.useRealTimers()
    })
  })

  describe('conditional requests - If-None-Match', () => {
    it('returns 304 when If-None-Match matches ETag', async () => {
      const mw = createCacheControlMiddleware({ cachePolicy: 'no-store' })
      const resWithEtag = await mw(makeRequest(), 'content')
      const etag = resWithEtag.headers.get('ETag')!

      const req = makeRequest({ 'If-None-Match': etag })
      const res = await mw(req, 'content')

      expect(res.status).toBe(304)
    })

    it('returns 200 when If-None-Match does not match ETag', async () => {
      const mw = createCacheControlMiddleware({ cachePolicy: 'no-store' })
      const req = makeRequest({ 'If-None-Match': 'W/"different"' })
      const res = await mw(req, 'content')

      expect(res.status).toBe(200)
    })

    it('returns 200 when ETag is weak and If-None-Match is strong', async () => {
      const mw = createCacheControlMiddleware({ cachePolicy: 'no-store' })
      const req = makeRequest({ 'If-None-Match': '"different"' })
      const res = await mw(req, 'content')

      expect(res.status).toBe(200)
    })
  })

  describe('conditional requests - If-Modified-Since', () => {
    it('returns 304 when If-Modified-Since is after Last-Modified', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-04-10T12:00:00Z'))

      const mw = createCacheControlMiddleware({ cachePolicy: 'no-store' })
      const req = makeRequest({ 'If-Modified-Since': 'Fri, 10 Apr 2026 14:00:00 GMT' })
      const res = await mw(req, 'content')

      expect(res.status).toBe(304)

      vi.useRealTimers()
    })

    it('returns 200 when If-Modified-Since is before Last-Modified', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-04-10T12:00:00Z'))

      const mw = createCacheControlMiddleware({ cachePolicy: 'no-store' })
      const req = makeRequest({ 'If-Modified-Since': 'Fri, 10 Apr 2026 10:00:00 GMT' })
      const res = await mw(req, 'content')

      expect(res.status).toBe(200)

      vi.useRealTimers()
    })
  })

  describe('304 response behavior', () => {
    it('returns empty body on 304 response', async () => {
      const mw = createCacheControlMiddleware({ cachePolicy: 'no-store' })
      const resWithEtag = await mw(makeRequest(), 'content')
      const etag = resWithEtag.headers.get('ETag')!

      const req = makeRequest({ 'If-None-Match': etag })
      const res = await mw(req, 'content')

      expect(res.status).toBe(304)
      expect(res.body).toBeNull()
    })

    it('does not set Cache-Control on 304 response', async () => {
      const mw = createCacheControlMiddleware({ cachePolicy: 'no-store' })
      const resWithEtag = await mw(makeRequest(), 'content')
      const etag = resWithEtag.headers.get('ETag')!

      const req = makeRequest({ 'If-None-Match': etag })
      const res = await mw(req, 'content')

      expect(res.status).toBe(304)
      // 304 responses should not have a body, headers are optional per spec
      expect(res.headers.has('Cache-Control')).toBe(false)
    })
  })

  describe('pass-through behavior', () => {
    it('returns 200 when no conditional headers present', async () => {
      const mw = createCacheControlMiddleware({ cachePolicy: 'no-store' })
      const res = await mw(makeRequest(), 'content')

      expect(res.status).toBe(200)
      expect(res.headers.get('ETag')).not.toBeNull()
      expect(res.headers.get('Last-Modified')).not.toBeNull()
    })

    it('sets cache headers on pass-through response', async () => {
      const mw = createCacheControlMiddleware({ cachePolicy: 'max-age', maxAge: 3600 })
      const res = await mw(makeRequest(), 'content')

      expect(res.status).toBe(200)
      expect(res.headers.get('Cache-Control')).toBe('max-age=3600')
      expect(res.headers.get('ETag')).not.toBeNull()
      expect(res.headers.get('Last-Modified')).not.toBeNull()
    })
  })

  describe('If-None-Match and If-Modified-Since together', () => {
    it('returns 304 when both headers indicate not modified', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-04-10T12:00:00Z'))

      const mw = createCacheControlMiddleware({ cachePolicy: 'no-store' })
      const resWithEtag = await mw(makeRequest(), 'content')
      const etag = resWithEtag.headers.get('ETag')!

      const req = makeRequest({
        'If-None-Match': etag,
        'If-Modified-Since': 'Fri, 10 Apr 2026 14:00:00 GMT',
      })
      const res = await mw(req, 'content')

      expect(res.status).toBe(304)

      vi.useRealTimers()
    })

    it('returns 200 when If-None-Match matches but If-Modified-Since indicates modified', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-04-10T12:00:00Z'))

      const mw = createCacheControlMiddleware({ cachePolicy: 'no-store' })
      const resWithEtag = await mw(makeRequest(), 'content')
      const etag = resWithEtag.headers.get('ETag')!

      // If-None-Match matches but If-Modified-Since is before Last-Modified
      const req = makeRequest({
        'If-None-Match': etag,
        'If-Modified-Since': 'Fri, 10 Apr 2026 10:00:00 GMT',
      })
      const res = await mw(req, 'content')

      expect(res.status).toBe(200)

      vi.useRealTimers()
    })
  })
})

describe('generateHash', () => {
  it('generates consistent hash for same input', async () => {
    const { generateHash } = await import('./cacheControl')
    const hash1 = await generateHash('test content')
    const hash2 = await generateHash('test content')
    expect(hash1).toBe(hash2)
  })

  it('generates different hash for different input', async () => {
    const { generateHash } = await import('./cacheControl')
    const hash1 = await generateHash('content a')
    const hash2 = await generateHash('content b')
    expect(hash1).not.toBe(hash2)
  })
})

describe('generateETag', () => {
  it('generates weak ETag with W/ prefix', async () => {
    const { generateETag } = await import('./cacheControl')
    const etag = await generateETag('content')
    expect(etag).toMatch(/^W\/".+"$/)
  })

  it('generates different ETags for different content', async () => {
    const { generateETag } = await import('./cacheControl')
    const etag1 = await generateETag('content a')
    const etag2 = await generateETag('content b')
    expect(etag1).not.toBe(etag2)
  })
})