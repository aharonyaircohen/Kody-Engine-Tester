import { NextRequest, NextResponse } from 'next/server'

export interface RateLimiterConfig {
  maxRequests: number
  windowMs: number
  cleanupIntervalMs?: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterMs: number
}

export interface RateLimiterMiddlewareConfig extends RateLimiterConfig {
  keyResolver?: (request: NextRequest) => string | null
  message?: string
  ipWhitelist?: string[]
  ipBlacklist?: string[]
  enableRateLimitHeaders?: boolean
}

export class SlidingWindowRateLimiter {
  // TODO: Replace in-memory store with Redis for multi-instance deployments
  private store = new Map<string, number[]>()
  private cleanupTimer: ReturnType<typeof setInterval> | null = null
  private maxRequests: number
  private windowMs: number

  constructor(config: RateLimiterConfig) {
    this.maxRequests = config.maxRequests
    this.windowMs = config.windowMs

    const cleanupInterval = config.cleanupIntervalMs ?? 60_000
    this.cleanupTimer = setInterval(() => this.cleanup(), cleanupInterval)
    this.cleanupTimer.unref()
  }

  check(key: string): RateLimitResult {
    const now = Date.now()
    const windowStart = now - this.windowMs
    const timestamps = this.store.get(key) ?? []
    const active = timestamps.filter((ts) => ts > windowStart)

    if (active.length < this.maxRequests) {
      active.push(now)
      this.store.set(key, active)
      return {
        allowed: true,
        remaining: this.maxRequests - active.length,
        retryAfterMs: 0,
      }
    }

    this.store.set(key, active)
    const retryAfterMs = active[0] + this.windowMs - now
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs,
    }
  }

  cleanup(): void {
    const now = Date.now()
    const windowStart = now - this.windowMs
    for (const [key, timestamps] of this.store) {
      const active = timestamps.filter((ts) => ts > windowStart)
      if (active.length === 0) {
        this.store.delete(key)
      } else {
        this.store.set(key, active)
      }
    }
  }

  reset(key?: string): void {
    if (key) {
      this.store.delete(key)
    } else {
      this.store.clear()
    }
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.store.clear()
  }

  get size(): number {
    return this.store.size
  }
}

export function byIp(request: NextRequest): string | null {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    (request as unknown as { ip?: string }).ip ??
    null
  )
}

export function byApiKey(request: NextRequest): string | null {
  return request.headers.get('x-api-key') ?? null
}

function setRateLimitHeaders(
  response: NextResponse,
  maxRequests: number,
  remaining: number,
  retryAfterMs: number,
  enable: boolean,
): void {
  response.headers.set('X-RateLimit-Limit', String(maxRequests))
  response.headers.set('X-RateLimit-Remaining', String(remaining))
  if (enable) {
    response.headers.set('X-RateLimit-Reset', String(Math.ceil((Date.now() + retryAfterMs) / 1000)))
  }
}

export function createRateLimiterMiddleware(config: RateLimiterMiddlewareConfig) {
  const limiter = new SlidingWindowRateLimiter(config)
  const keyResolver = config.keyResolver ?? byIp
  const message = config.message ?? 'Too Many Requests'
  const enableHeaders = config.enableRateLimitHeaders ?? true

  function middleware(request: NextRequest): NextResponse {
    const key = keyResolver(request)
    if (!key) return NextResponse.next()

    // IP blacklist — 403 immediately (checked before whitelist per plan: whitelist > blacklist precedence)
    // Whitelist is checked after blacklist check: if key is in whitelist, it bypasses all rate limiting
    if (config.ipBlacklist?.length && config.ipBlacklist.includes(key)) {
      // Check whitelist first: if also whitelisted, allow through
      if (config.ipWhitelist?.length && config.ipWhitelist.includes(key)) {
        return NextResponse.next()
      }
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // IP whitelist — bypass rate limiting
    if (config.ipWhitelist?.length && config.ipWhitelist.includes(key)) {
      const response = NextResponse.next()
      setRateLimitHeaders(response, config.maxRequests, config.maxRequests, 0, enableHeaders)
      return response
    }

    const result = limiter.check(key)

    if (result.allowed) {
      const response = NextResponse.next()
      setRateLimitHeaders(response, config.maxRequests, result.remaining, result.retryAfterMs, enableHeaders)
      return response
    }

    const retryAfterSeconds = Math.ceil(result.retryAfterMs / 1000)
    const response = new NextResponse(JSON.stringify({ error: message }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSeconds),
      },
    })
    setRateLimitHeaders(response, config.maxRequests, result.remaining, result.retryAfterMs, enableHeaders)
    return response
  }

  middleware.limiter = limiter
  return middleware
}
