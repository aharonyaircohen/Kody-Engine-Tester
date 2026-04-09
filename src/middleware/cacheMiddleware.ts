import { NextRequest, NextResponse } from 'next/server'
import type { CacheManager } from '@/cache/cacheManager'

/**
 * Configuration for the cache middleware.
 */
export interface CacheMiddlewareConfig {
  /**
   * The cache manager to use.
   */
  cacheManager: CacheManager

  /**
   * Resolves the cache key from the request.
   * @param request - The incoming request
   * @returns The cache key or null to skip caching
   */
  keyResolver?: (request: NextRequest) => string | null

  /**
   * Default TTL in milliseconds for cache entries.
   * @default 60000 (1 minute)
   */
  defaultTtl?: number

  /**
   * Whether to cache only successful responses.
   * @default true
   */
  cacheOnlyOnSuccess?: boolean

  /**
   * List of request methods to cache.
   * @default ['GET']
   */
  methods?: string[]

  /**
   * List of paths to exclude from caching.
   */
  excludePaths?: string[]
}

interface CachedResponse {
  data: unknown
  status: number
  headers: Record<string, string>
}

// Extended middleware type with attached methods
interface CacheMiddleware {
  (request: NextRequest): NextResponse | undefined
  cacheManager: CacheManager
  getCached: (key: string) => Promise<CachedResponse | undefined>
  setCached: (key: string, response: NextResponse, ttl?: number) => Promise<void>
}

/**
 * Creates a cache middleware function following the factory pattern.
 * @param config - Configuration for the cache middleware
 * @returns A middleware function with attached cacheManager
 */
export function createCacheMiddleware(config: CacheMiddlewareConfig): CacheMiddleware {
  const cacheManager = config.cacheManager
  const keyResolver = config.keyResolver ?? defaultKeyResolver
  const defaultTtl = config.defaultTtl ?? 60000
  const cacheOnlyOnSuccess = config.cacheOnlyOnSuccess ?? true
  const methods = config.methods ?? ['GET']
  const excludePaths = config.excludePaths ?? []

  async function getCached(key: string): Promise<CachedResponse | undefined> {
    const value = await cacheManager.get(key)
    return value as CachedResponse | undefined
  }

  async function setCached(
    key: string,
    response: NextResponse,
    ttl?: number
  ): Promise<void> {
    if (cacheOnlyOnSuccess && response.status >= 400) {
      return
    }

    const data = await response.json()
    const headers: Record<string, string> = {}
    response.headers.forEach((value, header) => {
      headers[header] = value
    })

    await cacheManager.set(
      key,
      { data, status: response.status, headers },
      ttl ?? defaultTtl
    )
  }

  function middleware(request: NextRequest): NextResponse | undefined {
    // Only cache specified methods
    if (!methods.includes(request.method)) {
      return undefined
    }

    // Check exclude paths
    const pathname = request.nextUrl.pathname
    if (excludePaths.some((path) => pathname.startsWith(path))) {
      return undefined
    }

    const key = keyResolver(request)
    if (!key) {
      return undefined
    }

    // Synchronous cache check - we'll handle async in the response chain
    // This is a simplified approach; for full async support, consider using edge runtime
    return undefined // Let the request proceed; caching happens via hooks in route handlers
  }

  // Attach properties to the middleware function
  Object.assign(middleware, {
    cacheManager,
    getCached,
    setCached,
  })

  return middleware as CacheMiddleware
}

// Default key resolver using the full URL
function defaultKeyResolver(request: NextRequest): string | null {
  return request.url
}

export default createCacheMiddleware
