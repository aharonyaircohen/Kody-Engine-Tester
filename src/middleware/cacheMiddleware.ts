import { NextRequest, NextResponse } from 'next/server'
import { createCacheManager, CacheManager, CacheMode } from '../cache/cacheManager'

export interface CacheMiddlewareConfig {
  cacheKeyResolver?: (request: NextRequest) => string | null
  ttl?: number
  mode?: CacheMode
  responseHeader?: string
  cacheControlHeader?: string
  onCacheHit?: (request: NextRequest, key: string) => void
  onCacheMiss?: (request: NextRequest, key: string) => void
}

const DEFAULT_RESPONSE_HEADER = 'X-Cache'
const DEFAULT_CACHE_CONTROL_HEADER = 'X-Cache-Control'

export function createCacheMiddleware(config: CacheMiddlewareConfig) {
  let cacheManager: CacheManager<unknown> | null = null
  const cacheKeyResolver = config.cacheKeyResolver ?? defaultCacheKeyResolver
  const ttl = config.ttl ?? 60_000
  const mode = config.mode ?? 'memory'
  const responseHeader = config.responseHeader ?? DEFAULT_RESPONSE_HEADER
  const cacheControlHeader = config.cacheControlHeader ?? DEFAULT_CACHE_CONTROL_HEADER

  async function getCache(): Promise<CacheManager<unknown>> {
    if (!cacheManager) {
      cacheManager = await createCacheManager({ mode })
    }
    return cacheManager
  }

  async function middleware(request: NextRequest): Promise<NextResponse> {
    const cache = await getCache()
    const cacheKey = cacheKeyResolver(request)

    if (!cacheKey) {
      return NextResponse.next()
    }

    const cached = await cache.get(cacheKey)

    if (cached !== undefined) {
      config.onCacheHit?.(request, cacheKey)

      const responseHeaders = new Headers()
      responseHeaders.set(responseHeader, 'HIT')
      responseHeaders.set(cacheControlHeader, `max-age=${Math.floor(ttl / 1000)}`)

      if (cached instanceof NextResponse) {
        const mergedHeaders = new Headers()
        cached.headers.forEach((value: string, key: string) => {
          mergedHeaders.set(key, value)
        })
        responseHeaders.forEach((value: string, key: string) => {
          mergedHeaders.set(key, value)
        })
        const response = new NextResponse(cached.body, {
          status: cached.status,
          statusText: cached.statusText,
          headers: mergedHeaders,
        })
        return response
      }

      return new NextResponse(JSON.stringify(cached), {
        status: 200,
        headers: responseHeaders,
      })
    }

    config.onCacheMiss?.(request, cacheKey)

    const response = NextResponse.next()
    response.headers.set(responseHeader, 'MISS')
    return response
  }

  middleware.cache = async () => getCache()

  return middleware
}

function defaultCacheKeyResolver(request: NextRequest): string | null {
  const url = request.nextUrl.pathname
  const searchParams = request.nextUrl.searchParams.toString()
  const cacheKey = searchParams ? `${url}?${searchParams}` : url
  return cacheKey
}

export function createStaticCacheMiddleware<V>(
  cache: CacheManager<V>,
  config: { ttl?: number; cacheKeyResolver?: (request: NextRequest) => string | null } = {},
) {
  const ttl = config.ttl ?? 60_000
  const cacheKeyResolver = config.cacheKeyResolver ?? defaultCacheKeyResolver

  return async function cacheMiddleware(request: NextRequest): Promise<NextResponse> {
    const cacheKey = cacheKeyResolver(request)

    if (!cacheKey) {
      return NextResponse.next()
    }

    const cached = await cache.get(cacheKey)

    if (cached !== undefined) {
      const response = new NextResponse(JSON.stringify(cached), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
        },
      })
      return response
    }

    const response = NextResponse.next()
    response.headers.set('X-Cache', 'MISS')
    return response
  }
}

export function cacheResponse<V>(
  cache: CacheManager<V>,
  key: string,
  value: V,
  ttl?: number,
): Promise<void> {
  return cache.set(key, value, ttl)
}

export async function invalidateCache(cache: CacheManager<unknown>, key: string): Promise<void> {
  await cache.delete(key)
}

export async function clearCache(cache: CacheManager<unknown>): Promise<void> {
  await cache.clear()
}