import { describe, it, expect, vi, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import {
  createCacheControlMiddleware,
  CacheControlType,
  generateETag,
} from './cache-control'

function makeRequest(
  path: string,
  headers?: Record<string, string>,
): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    headers,
  })
}

describe('CacheControlType', () => {
  it('has public value', () => {
    expect(CacheControlType.PUBLIC).toBe('public')
  })

  it('has private value', () => {
    expect(CacheControlType.PRIVATE).toBe('private')
  })

  it('has noStore value', () => {
    expect(CacheControlType.NO_STORE).toBe('no-store')
  })
})

describe('generateETag', () => {
  it('generates a valid ETag from body content', () => {
    const etag = generateETag('Hello, World!')
    expect(etag).toMatch(/^"/)
    expect(etag).toMatch(/"$/)
    expect(etag.length).toBeGreaterThan(2)
  })

  it('generates different ETags for different content', () => {
    const etag1 = generateETag('content-a')
    const etag2 = generateETag('content-b')
    expect(etag1).not.toBe(etag2)
  })

  it('generates same ETag for same content', () => {
    const etag1 = generateETag('same content')
    const etag2 = generateETag('same content')
    expect(etag1).toBe(etag2)
  })

  it('handles empty string', () => {
    const etag = generateETag('')
    expect(etag).toMatch(/^"/)
    expect(etag).toMatch(/"$/)
  })
})

describe('createCacheControlMiddleware', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Cache-Control header', () => {
    it('sets public cache type by default', () => {
      const mw = createCacheControlMiddleware({})
      const res = mw(makeRequest('/api/test'))
      expect(res.headers.get('Cache-Control')).toBe('public')
    })

    it('sets private cache type when configured', () => {
      const mw = createCacheControlMiddleware({
        defaultType: CacheControlType.PRIVATE,
      })
      const res = mw(makeRequest('/api/test'))
      expect(res.headers.get('Cache-Control')).toBe('private')
    })

    it('sets no-store cache type when configured', () => {
      const mw = createCacheControlMiddleware({
        defaultType: CacheControlType.NO_STORE,
      })
      const res = mw(makeRequest('/api/test'))
      expect(res.headers.get('Cache-Control')).toBe('no-store')
    })
  })

  describe('ETag support', () => {
    it('does not set ETag header when etag option is false', () => {
      const mw = createCacheControlMiddleware({ etag: false })
      const res = mw(makeRequest('/api/test'))
      expect(res.headers.has('ETag')).toBe(false)
    })

    it('sets ETag header when etag option is true', () => {
      const mw = createCacheControlMiddleware({ etag: true })
      const res = mw(makeRequest('/api/test'))
      expect(res.headers.has('ETag')).toBe(true)
      expect(res.headers.get('ETag')).toMatch(/^"/)
      expect(res.headers.get('ETag')).toMatch(/"$/)
    })

    it('returns 304 Not Modified when If-None-Match matches ETag', () => {
      const mw = createCacheControlMiddleware({ etag: true })
      const res1 = mw(makeRequest('/api/test'))
      const etag = res1.headers.get('ETag')

      const res2 = mw(makeRequest('/api/test', { 'If-None-Match': etag! }))
      expect(res2.status).toBe(304)
    })

    it('returns full response when If-None-Match does not match', () => {
      const mw = createCacheControlMiddleware({ etag: true })
      const res1 = mw(makeRequest('/api/test'))

      const res2 = mw(makeRequest('/api/test', { 'If-None-Match': '"wrong-etag"' }))
      expect(res2.status).toBe(200)
      expect(res2.headers.get('ETag')).toBe(res1.headers.get('ETag'))
    })

    it('returns full response when If-None-Match is absent', () => {
      const mw = createCacheControlMiddleware({ etag: true })
      const res1 = mw(makeRequest('/api/test'))

      const res2 = mw(makeRequest('/api/test'))
      expect(res2.status).toBe(200)
      expect(res2.headers.get('ETag')).toBe(res1.headers.get('ETag'))
    })
  })

  describe('Vary: Accept-Encoding', () => {
    it('does not set Vary header when varyAcceptEncoding is false', () => {
      const mw = createCacheControlMiddleware({ varyAcceptEncoding: false })
      const res = mw(makeRequest('/api/test'))
      expect(res.headers.has('Vary')).toBe(false)
    })

    it('sets Vary: Accept-Encoding when varyAcceptEncoding is true', () => {
      const mw = createCacheControlMiddleware({ varyAcceptEncoding: true })
      const res = mw(makeRequest('/api/test'))
      expect(res.headers.get('Vary')).toBe('Accept-Encoding')
    })
  })

  describe('combined options', () => {
    it('applies all options together', () => {
      const mw = createCacheControlMiddleware({
        defaultType: CacheControlType.PRIVATE,
        etag: true,
        varyAcceptEncoding: true,
      })
      const res = mw(makeRequest('/api/test'))
      expect(res.headers.get('Cache-Control')).toBe('private')
      expect(res.headers.has('ETag')).toBe(true)
      expect(res.headers.get('Vary')).toBe('Accept-Encoding')
    })

    it('handles no-store with etag and vary', () => {
      const mw = createCacheControlMiddleware({
        defaultType: CacheControlType.NO_STORE,
        etag: true,
        varyAcceptEncoding: true,
      })
      const res = mw(makeRequest('/api/test'))
      expect(res.headers.get('Cache-Control')).toBe('no-store')
      expect(res.headers.has('ETag')).toBe(true)
      expect(res.headers.get('Vary')).toBe('Accept-Encoding')
    })
  })

  describe('middleware returns NextResponse', () => {
    it('returns a NextResponse object', () => {
      const mw = createCacheControlMiddleware({})
      const res = mw(makeRequest('/api/test'))
      expect(res).toBeInstanceOf(NextResponse)
    })

    it('response has correct status (200 by default)', () => {
      const mw = createCacheControlMiddleware({})
      const res = mw(makeRequest('/api/test'))
      expect(res.status).toBe(200)
    })

    it('response has correct status (304 for conditional request)', () => {
      const mw = createCacheControlMiddleware({ etag: true })
      const res1 = mw(makeRequest('/api/test'))
      const etag = res1.headers.get('ETag')
      const res2 = mw(makeRequest('/api/test', { 'If-None-Match': etag! }))
      expect(res2.status).toBe(304)
    })
  })
})
