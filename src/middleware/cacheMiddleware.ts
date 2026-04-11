import { NextRequest, NextResponse } from 'next/server'
import type { CacheManager } from '../cache/cacheManager'

export interface CacheMiddlewareConfig {
  cacheManager: CacheManager
  cacheKeyResolver?: (request: NextRequest) => string
  enabled?: boolean
}

export function createCacheMiddleware(config: CacheMiddlewareConfig) {
  const { cacheManager, enabled = true } = config

  function resolveCacheKey(request: NextRequest): string {
    if (config.cacheKeyResolver) {
      return config.cacheKeyResolver(request)
    }

    const { pathname, searchParams } = request.nextUrl
    const cacheKey = `${request.method}:${pathname}`
    const queryString = searchParams.toString()
    return queryString ? `${cacheKey}?${queryString}` : cacheKey
  }

  function middleware(request: NextRequest): NextResponse {
    if (!enabled) {
      return NextResponse.next()
    }

    const cacheKey = resolveCacheKey(request)

    // Try to get from cache
    const cached = cacheManager.get<string>(cacheKey)
    if (cached !== undefined) {
      const response = new NextResponse(cached, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
      response.headers.set('X-Cache', 'HIT')
      return response
    }

    // Process request - pass through with MISS header
    // Note: Actual response caching must happen at the route handler level
    // since middleware cannot intercept or cache route handler responses
    const response = NextResponse.next()
    response.headers.set('X-Cache', 'MISS')
    return response
  }

  // Attach properties following rate-limiter pattern
  middleware.cacheManager = cacheManager
  middleware.resolveCacheKey = resolveCacheKey

  return middleware
}

// Augment function type for attached properties
declare module './cacheMiddleware' {
  interface CacheMiddlewareFunction {
    cacheManager: CacheManager
    resolveCacheKey: (request: NextRequest) => string
  }
}

export type { CacheManager }