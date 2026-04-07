import { NextRequest, NextResponse } from 'next/server'

export type RoutePattern = string

export interface CacheInvalidationConfig {
  routes?: RoutePattern[]
  debug?: boolean
}

export class CacheInvalidationStore {
  private invalidations = new Map<string, () => void>()
  private keysByPattern = new Map<string, Set<string>>()

  add(pattern: RoutePattern, cacheKey: string): void {
    if (!this.keysByPattern.has(pattern)) {
      this.keysByPattern.set(pattern, new Set())
    }
    this.keysByPattern.get(pattern)!.add(cacheKey)
  }

  invalidate(pattern: RoutePattern): void {
    const callback = this.invalidations.get(pattern)
    if (callback) {
      callback()
    }
  }

  registerInvalidation(pattern: RoutePattern, callback: () => void): void {
    this.invalidations.set(pattern, callback)
  }

  reset(): void {
    this.invalidations.clear()
    this.keysByPattern.clear()
  }

  destroy(): void {
    this.reset()
  }

  get size(): number {
    return this.keysByPattern.size
  }
}

export function createCacheInvalidationMiddleware(config: CacheInvalidationConfig) {
  const store = new CacheInvalidationStore()
  const routes: RoutePattern[] = config.routes ?? []
  const debug = config.debug ?? false

  for (const route of routes) {
    store.registerInvalidation(route, () => {})
  }

  function middleware(request: NextRequest): NextResponse {
    const pathname = request.nextUrl.pathname
    const method = request.method

    const shouldIntercept =
      method === 'POST' || method === 'PUT' || method === 'DELETE'

    if (!shouldIntercept) {
      return NextResponse.next()
    }

    const matchedPattern = routes.find((route) => {
      if (pathname === route) return true
      if (pathname.startsWith(route + '/')) return true
      return false
    })

    if (!matchedPattern) {
      return NextResponse.next()
    }

    store.invalidate(matchedPattern)

    const response = NextResponse.next()
    response.headers.set('x-cache-invalidated', 'true')

    if (debug) {
      response.headers.set(
        'x-cache-debug',
        `invalidated:${matchedPattern}`,
      )
    }

    return response
  }

  middleware.store = store
  return middleware
}
