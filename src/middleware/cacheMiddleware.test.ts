import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { createCacheMiddleware } from './cacheMiddleware'
import type { CacheManager } from './cacheManager'
import type { CacheAdapter } from './cache/memoryAdapter'

// Mock cache adapter
function createMockAdapter(): CacheAdapter<unknown> {
  const store: Map<string, unknown> = new Map()

  return {
    get(key: string): unknown {
      return store.get(key)
    },
    set(key: string, value: unknown): void {
      store.set(key, value)
    },
    delete(key: string): void {
      store.delete(key)
    },
    has(key: string): boolean {
      return store.has(key)
    },
    clear(): void {
      store.clear()
    },
    stats() {
      return { hits: 0, misses: 0, evictions: 0, size: store.size }
    },
  }
}

// Mock cache manager
function createMockCacheManager(adapter: CacheAdapter<unknown>): CacheManager {
  return {
    get<V>(key: string): V | undefined {
      return adapter.get(key) as V | undefined
    },
    set<V>(key: string, value: V): void {
      adapter.set(key, value)
    },
    delete(key: string): void {
      adapter.delete(key)
    },
    has(key: string): boolean {
      return adapter.has(key)
    },
    clear(): void {
      adapter.clear()
    },
    stats() {
      return { adapter: adapter.stats() }
    },
  }
}

describe('createCacheMiddleware', () => {
  let adapter: CacheAdapter<unknown>
  let cacheManager: CacheManager

  beforeEach(() => {
    adapter = createMockAdapter()
    cacheManager = createMockCacheManager(adapter)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function makeRequest(path: string = '/api/test', method: string = 'GET'): NextRequest {
    const url = new URL(`http://localhost${path}`)
    return new NextRequest(url, { method })
  }

  describe('cache hit', () => {
    it('returns cached response with X-Cache: HIT header', () => {
      const mw = createCacheMiddleware({ cacheManager })
      adapter.set('GET:/api/test', 'cached-response-body')

      const response = mw(makeRequest('/api/test'))

      expect(response.headers.get('X-Cache')).toBe('HIT')
    })

    it('returns cached string body', () => {
      const mw = createCacheMiddleware({ cacheManager })
      adapter.set('GET:/api/test', 'cached-response-body')

      const response = mw(makeRequest('/api/test'))

      // The response body should be readable
      expect(response.body).toBeTruthy()
    })
  })

  describe('cache miss', () => {
    it('passes through with X-Cache: MISS header', () => {
      const mw = createCacheMiddleware({ cacheManager })

      const response = mw(makeRequest('/api/test'))

      expect(response.headers.get('X-Cache')).toBe('MISS')
    })

    it('does not cache the NextResponse.next() response', () => {
      const mw = createCacheMiddleware({ cacheManager })

      mw(makeRequest('/api/test'))

      // NextResponse.next() should not be cached since it has no body
      expect(adapter.get('GET:/api/test')).toBeUndefined()
    })
  })

  describe('cache key resolution', () => {
    it('uses default cache key resolver (method + path + query)', () => {
      const mw = createCacheMiddleware({ cacheManager })
      adapter.set('GET:/api/test?foo=bar', 'cached')

      const response = mw(makeRequest('/api/test?foo=bar'))

      expect(response.headers.get('X-Cache')).toBe('HIT')
    })

    it('uses custom cacheKeyResolver when provided', () => {
      const mw = createCacheMiddleware({
        cacheManager,
        cacheKeyResolver: (request) => `custom:${request.nextUrl.pathname}`,
      })
      adapter.set('custom:/api/test', 'cached')

      const response = mw(makeRequest('/api/test'))

      expect(response.headers.get('X-Cache')).toBe('HIT')
    })

    it('different paths produce different cache keys', () => {
      const mw = createCacheMiddleware({ cacheManager })
      adapter.set('GET:/api/test', 'cached')

      const response = mw(makeRequest('/api/other'))

      expect(response.headers.get('X-Cache')).toBe('MISS')
    })

    it('different methods produce different cache keys', () => {
      const mw = createCacheMiddleware({ cacheManager })
      adapter.set('GET:/api/test', 'cached')

      const response = mw(makeRequest('/api/test', 'POST'))

      expect(response.headers.get('X-Cache')).toBe('MISS')
    })
  })

  describe('enabled flag', () => {
    it('passes through when enabled = false', () => {
      const mw = createCacheMiddleware({ cacheManager, enabled: false })
      adapter.set('GET:/api/test', 'cached')

      const response = mw(makeRequest('/api/test'))

      // Should pass through without checking cache
      expect(response.headers.get('X-Cache')).toBeNull()
    })

    it('passes through with X-Cache header when enabled = true', () => {
      const mw = createCacheMiddleware({ cacheManager, enabled: true })

      const response = mw(makeRequest('/api/test'))

      expect(response.headers.get('X-Cache')).toBe('MISS')
    })

    it('defaults to enabled', () => {
      const mw = createCacheMiddleware({ cacheManager })

      const response = mw(makeRequest('/api/test'))

      expect(response.headers.get('X-Cache')).toBe('MISS')
    })
  })

  describe('attached properties', () => {
    it('attaches cacheManager to returned function', () => {
      const mw = createCacheMiddleware({ cacheManager })

      expect((mw as unknown as { cacheManager: CacheManager }).cacheManager).toBe(cacheManager)
    })

    it('attaches resolveCacheKey to returned function', () => {
      const mw = createCacheMiddleware({ cacheManager })

      expect(typeof (mw as unknown as { resolveCacheKey: unknown }).resolveCacheKey).toBe('function')
    })

    it('resolveCacheKey uses custom resolver when provided', () => {
      const customResolver = vi.fn((_request: NextRequest) => 'custom-key')
      const mw = createCacheMiddleware({ cacheManager, cacheKeyResolver: customResolver })

      const request = makeRequest('/api/test')
      ;(mw as unknown as { resolveCacheKey: (req: NextRequest) => string }).resolveCacheKey(request)

      expect(customResolver).toHaveBeenCalledWith(request)
    })
  })
})