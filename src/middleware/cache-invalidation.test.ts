import { describe, it, expect, vi, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import {
  CacheInvalidationStore,
  createCacheInvalidationMiddleware,
} from './cache-invalidation'

describe('CacheInvalidationStore', () => {
  let store: CacheInvalidationStore

  afterEach(() => {
    store?.destroy()
  })

  it('starts empty', () => {
    store = new CacheInvalidationStore()
    expect(store.size).toBe(0)
  })

  it('adds a cache key under a pattern', () => {
    store = new CacheInvalidationStore()
    store.add('/api/courses', 'courses-list')
    expect(store.size).toBe(1)
  })

  it('adds multiple keys under the same pattern', () => {
    store = new CacheInvalidationStore()
    store.add('/api/courses', 'courses-list')
    store.add('/api/courses', 'courses-grid')
    expect(store.size).toBe(1)
  })

  it('adds keys under different patterns', () => {
    store = new CacheInvalidationStore()
    store.add('/api/courses', 'courses-list')
    store.add('/api/lessons', 'lessons-list')
    expect(store.size).toBe(2)
  })

  it('invalidates all keys for a matching pattern', () => {
    store = new CacheInvalidationStore()
    const invalidateSpy = vi.fn()
    ;(store as unknown as { invalidations: Map<string, () => void> }).invalidations.set('/api/courses', invalidateSpy)

    store.invalidate('/api/courses')
    expect(invalidateSpy).toHaveBeenCalled()
  })

  it('invalidates by exact path', () => {
    store = new CacheInvalidationStore()
    const invalidateSpy = vi.fn()
    ;(store as unknown as { invalidations: Map<string, () => void> }).invalidations.set('/api/courses', invalidateSpy)

    store.invalidate('/api/courses')
    expect(invalidateSpy).toHaveBeenCalled()
    store.invalidate('/api/other')
    expect(invalidateSpy).toHaveBeenCalledTimes(1)
  })

  it('reset clears all entries', () => {
    store = new CacheInvalidationStore()
    store.add('/api/courses', 'courses-list')
    store.add('/api/lessons', 'lessons-list')
    expect(store.size).toBe(2)

    store.reset()
    expect(store.size).toBe(0)
  })

  it('destroy clears all entries and stops timers', () => {
    store = new CacheInvalidationStore()
    store.add('/api/courses', 'courses-list')
    expect(store.size).toBe(1)

    store.destroy()
    expect(store.size).toBe(0)
  })

  it('handles invalidate on non-existent pattern without error', () => {
    store = new CacheInvalidationStore()
    expect(() => store.invalidate('/api/nonexistent')).not.toThrow()
  })

  it('reset on empty store does not error', () => {
    store = new CacheInvalidationStore()
    expect(() => store.reset()).not.toThrow()
  })
})

describe('createCacheInvalidationMiddleware', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function makeRequest(method: string, path: string): NextRequest {
    return new NextRequest(`http://localhost${path}`, {
      method,
    })
  }

  it('returns NextResponse.next() for GET requests unchanged', () => {
    const mw = createCacheInvalidationMiddleware({ routes: [] })
    const req = makeRequest('GET', '/api/courses')
    const res = mw(req)
    expect(res.status).toBe(200)
    expect(res.headers.get('x-cache-invalidated')).toBeNull()
    mw.store.destroy()
  })

  it('returns NextResponse.next() for GET with no routes configured', () => {
    const mw = createCacheInvalidationMiddleware({})
    const req = makeRequest('GET', '/api/courses')
    const res = mw(req)
    expect(res.status).toBe(200)
    mw.store.destroy()
  })

  it('attaches store to middleware function', () => {
    const mw = createCacheInvalidationMiddleware({ routes: [] })
    expect(mw.store).toBeInstanceOf(CacheInvalidationStore)
    mw.store.destroy()
  })

  it('intercepts POST requests to configured routes', () => {
    const mw = createCacheInvalidationMiddleware({
      routes: ['/api/courses'],
    })
    const req = makeRequest('POST', '/api/courses')
    const res = mw(req)
    expect(res.status).toBe(200)
    expect(res.headers.get('x-cache-invalidated')).toBe('true')
    mw.store.destroy()
  })

  it('intercepts PUT requests to configured routes', () => {
    const mw = createCacheInvalidationMiddleware({
      routes: ['/api/courses'],
    })
    const req = makeRequest('PUT', '/api/courses')
    const res = mw(req)
    expect(res.status).toBe(200)
    expect(res.headers.get('x-cache-invalidated')).toBe('true')
    mw.store.destroy()
  })

  it('intercepts DELETE requests to configured routes', () => {
    const mw = createCacheInvalidationMiddleware({
      routes: ['/api/courses'],
    })
    const req = makeRequest('DELETE', '/api/courses')
    const res = mw(req)
    expect(res.status).toBe(200)
    expect(res.headers.get('x-cache-invalidated')).toBe('true')
    mw.store.destroy()
  })

  it('does not intercept GET to configured routes', () => {
    const mw = createCacheInvalidationMiddleware({
      routes: ['/api/courses'],
    })
    const req = makeRequest('GET', '/api/courses')
    const res = mw(req)
    expect(res.status).toBe(200)
    expect(res.headers.get('x-cache-invalidated')).toBeNull()
    mw.store.destroy()
  })

  it('does not intercept POST to non-configured routes', () => {
    const mw = createCacheInvalidationMiddleware({
      routes: ['/api/courses'],
    })
    const req = makeRequest('POST', '/api/lessons')
    const res = mw(req)
    expect(res.status).toBe(200)
    expect(res.headers.get('x-cache-invalidated')).toBeNull()
    mw.store.destroy()
  })

  it('matches route prefix patterns', () => {
    const mw = createCacheInvalidationMiddleware({
      routes: ['/api/courses'],
    })
    const req = makeRequest('POST', '/api/courses/123')
    const res = mw(req)
    expect(res.status).toBe(200)
    expect(res.headers.get('x-cache-invalidated')).toBe('true')
    mw.store.destroy()
  })

  it('matches multiple configured routes', () => {
    const mw = createCacheInvalidationMiddleware({
      routes: ['/api/courses', '/api/lessons'],
    })
    const res1 = mw(makeRequest('POST', '/api/courses'))
    const res2 = mw(makeRequest('POST', '/api/lessons'))
    expect(res1.headers.get('x-cache-invalidated')).toBe('true')
    expect(res2.headers.get('x-cache-invalidated')).toBe('true')
    mw.store.destroy()
  })

  it('only intercepts POST, PUT, DELETE methods', () => {
    const mw = createCacheInvalidationMiddleware({
      routes: ['/api/courses'],
    })
    const methods = ['GET', 'HEAD', 'OPTIONS', 'PATCH']
    for (const method of methods) {
      const req = makeRequest(method, '/api/courses')
      const res = mw(req)
      expect(res.headers.get('x-cache-invalidated')).toBeNull()
    }
    mw.store.destroy()
  })

  it('handles route with no cache keys gracefully', () => {
    const mw = createCacheInvalidationMiddleware({
      routes: ['/api/nocache'],
    })
    const req = makeRequest('POST', '/api/nocache')
    expect(() => mw(req)).not.toThrow()
    mw.store.destroy()
  })

  it('sets debug header when debug option is true', () => {
    const mw = createCacheInvalidationMiddleware({
      routes: ['/api/courses'],
      debug: true,
    })
    const req = makeRequest('POST', '/api/courses')
    const res = mw(req)
    expect(res.headers.get('x-cache-debug')).toBeTruthy()
    mw.store.destroy()
  })

  it('does not set debug header when debug is false', () => {
    const mw = createCacheInvalidationMiddleware({
      routes: ['/api/courses'],
      debug: false,
    })
    const req = makeRequest('POST', '/api/courses')
    const res = mw(req)
    expect(res.headers.has('x-cache-debug')).toBe(false)
    mw.store.destroy()
  })
})
