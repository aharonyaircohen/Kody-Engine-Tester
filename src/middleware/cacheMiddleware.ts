import { NextRequest, NextResponse } from 'next/server'
import type { CacheManager } from '@/cache/cacheManager'

export interface CacheMiddlewareConfig {
  cacheManager: CacheManager<unknown>
  cacheKeyResolver?: (request: NextRequest) => string | null
  cacheTTL?: number
  enabled?: boolean
  cacheableMethods?: string[]
  cacheableStatuses?: number[]
}

export function createCacheMiddleware(config: CacheMiddlewareConfig) {
  const {
    cacheManager,
    cacheKeyResolver = (req) => req.nextUrl.pathname,
    enabled = true,
    cacheableMethods = ['GET'],
  } = config

  async function middleware(request: NextRequest): Promise<NextResponse> {
    if (!enabled) {
      return NextResponse.next()
    }

    const method = request.method
    if (!cacheableMethods.includes(method)) {
      return NextResponse.next()
    }

    const cacheKey = cacheKeyResolver(request)
    if (!cacheKey) {
      return NextResponse.next()
    }

    // Check cache first
    const cached = await cacheManager.get(cacheKey)
    if (cached.isOk() && cached.value !== null) {
      return NextResponse.json(cached.value)
    }

    // Clone response to intercept and cache
    const response = NextResponse.next()
    response.headers.set('X-Cache-Key', cacheKey)

    return response
  }

  return middleware
}

// Attach cache manager to middleware for access in route handlers
export interface CachedRouteContext {
  cacheManager: CacheManager<unknown>
}

export function createCachedHandler(
  handler: (request: NextRequest, context: CachedRouteContext) => Promise<NextResponse>,
  config: Omit<CacheMiddlewareConfig, 'enabled'>
) {
  return async function cachedHandler(request: NextRequest): Promise<NextResponse> {
    const cacheKey = config.cacheKeyResolver?.(request) ?? request.nextUrl.pathname

    // Try cache
    const cached = await config.cacheManager.get(cacheKey)
    if (cached.isOk() && cached.value !== null) {
      return NextResponse.json(cached.value, {
        headers: { 'X-Cache-Hit': 'true', 'X-Cache-Key': cacheKey },
      })
    }

    // Execute handler
    const response = await handler(request, { cacheManager: config.cacheManager })

    // Cache successful responses
    if (config.cacheableStatuses?.includes(response.status) && request.method === 'GET') {
      const data = await response.json().catch(() => null)
      if (data !== null) {
        await config.cacheManager.set(cacheKey, data, config.cacheTTL)
      }
    }

    return response
  }
}