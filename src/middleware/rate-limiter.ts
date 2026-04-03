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

export interface RateLimitResultTenanted extends RateLimitResult {
  tenantKey: string
  globalKey: string
}

export interface TenantRateLimitConfig {
  maxRequests: number
  windowMs: number
  tenants: Record<string, { maxRequests: number; windowMs?: number }>
}

export interface RateLimiterMiddlewareConfig extends RateLimiterConfig {
  keyResolver?: (request: NextRequest) => string | null
  message?: string
  ipWhitelist?: string[]
  ipBlacklist?: string[]
  enableRateLimitHeaders?: boolean
  tenantResolver?: (request: NextRequest) => string | null
  tenantConfigs?: Record<string, { maxRequests: number; windowMs?: number }>
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

/**
 * Tenant-aware sliding window rate limiter
 * Supports per-tenant rate limits in addition to global limits
 */
export class TenantAwareRateLimiter {
  private globalLimiter: SlidingWindowRateLimiter
  private tenantLimiters = new Map<string, SlidingWindowRateLimiter>()
  private tenantConfigs: Record<string, { maxRequests: number; windowMs?: number }>
  private defaultMaxRequests: number
  private defaultWindowMs: number
  private cleanupTimer: ReturnType<typeof setInterval> | null = null

  constructor(config: TenantRateLimitConfig) {
    this.defaultMaxRequests = config.maxRequests
    this.defaultWindowMs = config.windowMs
    this.tenantConfigs = config.tenants

    // Global limiter uses default config
    this.globalLimiter = new SlidingWindowRateLimiter({
      maxRequests: config.maxRequests,
      windowMs: config.windowMs,
    })

    // Initialize cleanup timer
    this.cleanupTimer = setInterval(() => this.cleanup(), 60_000)
    this.cleanupTimer.unref()
  }

  /**
   * Check rate limit with tenant isolation
   * Returns combined result from both global and tenant-specific limits
   */
  check(key: string, tenantId: string | null): RateLimitResultTenanted {
    const globalKey = `global:${key}`
    const tenantKey = tenantId ? `tenant:${tenantId}:${key}` : globalKey

    // Check global limit first
    const globalResult = this.globalLimiter.check(globalKey)
    if (!globalResult.allowed) {
      return {
        ...globalResult,
        tenantKey,
        globalKey,
      }
    }

    // If tenantId is provided, check tenant-specific limit
    if (tenantId) {
      const tenantConfig = this.tenantConfigs[tenantId]
      const maxRequests = tenantConfig?.maxRequests ?? this.defaultMaxRequests
      const windowMs = tenantConfig?.windowMs ?? this.defaultWindowMs

      let tenantLimiter = this.tenantLimiters.get(tenantId)
      if (!tenantLimiter) {
        tenantLimiter = new SlidingWindowRateLimiter({ maxRequests, windowMs })
        this.tenantLimiters.set(tenantId, tenantLimiter)
      }

      const tenantResult = tenantLimiter.check(tenantKey)
      if (!tenantResult.allowed) {
        return {
          ...tenantResult,
          tenantKey,
          globalKey,
        }
      }

      // Return the more restrictive remaining count
      return {
        allowed: true,
        remaining: Math.min(globalResult.remaining, tenantResult.remaining),
        retryAfterMs: 0,
        tenantKey,
        globalKey,
      }
    }

    return {
      ...globalResult,
      tenantKey,
      globalKey,
    }
  }

  /**
   * Get rate limit config for a specific tenant
   */
  getTenantConfig(tenantId: string): { maxRequests: number; windowMs: number } | null {
    const config = this.tenantConfigs[tenantId]
    if (!config) return null
    return {
      maxRequests: config.maxRequests,
      windowMs: config.windowMs ?? this.defaultWindowMs,
    }
  }

  /**
   * Update rate limit config for a tenant
   */
  setTenantConfig(tenantId: string, config: { maxRequests: number; windowMs?: number }): void {
    this.tenantConfigs[tenantId] = config
    // Recreate tenant limiter with new config
    const limiter = new SlidingWindowRateLimiter({
      maxRequests: config.maxRequests,
      windowMs: config.windowMs ?? this.defaultWindowMs,
    })
    this.tenantLimiters.set(tenantId, limiter)
  }

  cleanup(): void {
    this.globalLimiter.cleanup()
    for (const limiter of this.tenantLimiters.values()) {
      limiter.cleanup()
    }
  }

  reset(key?: string, tenantId?: string): void {
    if (key && tenantId) {
      this.tenantLimiters.get(tenantId)?.reset(`tenant:${tenantId}:${key}`)
    } else if (tenantId) {
      this.tenantLimiters.delete(tenantId)
    } else if (key) {
      this.globalLimiter.reset(`global:${key}`)
    } else {
      this.globalLimiter.reset()
      this.tenantLimiters.clear()
    }
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.globalLimiter.destroy()
    for (const limiter of this.tenantLimiters.values()) {
      limiter.destroy()
    }
    this.tenantLimiters.clear()
  }

  get size(): number {
    return this.globalLimiter.size + Array.from(this.tenantLimiters.values()).reduce((sum, l) => sum + l.size, 0)
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

export interface TenantAwareRateLimiterMiddlewareConfig extends RateLimiterMiddlewareConfig {
  tenantResolver: (request: NextRequest) => string | null
  tenantConfigs?: Record<string, { maxRequests: number; windowMs?: number }>
}

/**
 * Create tenant-aware rate limiter middleware
 * Supports per-tenant rate limits in addition to global limits
 */
export function createTenantAwareRateLimiterMiddleware(config: TenantAwareRateLimiterMiddlewareConfig) {
  const tenantLimiter = new TenantAwareRateLimiter({
    maxRequests: config.maxRequests,
    windowMs: config.windowMs,
    tenants: config.tenantConfigs ?? {},
  })

  const keyResolver = config.keyResolver ?? byIp
  const tenantResolver = config.tenantResolver
  const message = config.message ?? 'Too Many Requests'
  const enableHeaders = config.enableRateLimitHeaders ?? true

  function middleware(request: NextRequest): NextResponse {
    const key = keyResolver(request)
    if (!key) return NextResponse.next()

    const tenantId = tenantResolver(request)

    // IP blacklist — 403 immediately
    if (config.ipBlacklist?.length && config.ipBlacklist.includes(key)) {
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

    const result = tenantLimiter.check(key, tenantId)

    if (result.allowed) {
      const response = NextResponse.next()
      // Use tenant-specific limit for headers if available
      const limit = tenantId && config.tenantConfigs?.[tenantId]
        ? config.tenantConfigs[tenantId].maxRequests
        : config.maxRequests
      setRateLimitHeaders(response, limit, result.remaining, result.retryAfterMs, enableHeaders)
      return response
    }

    const retryAfterSeconds = Math.ceil(result.retryAfterMs / 1000)
    const limit = tenantId && config.tenantConfigs?.[tenantId]
      ? config.tenantConfigs[tenantId].maxRequests
      : config.maxRequests
    const response = new NextResponse(JSON.stringify({ error: message }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSeconds),
      },
    })
    setRateLimitHeaders(response, limit, result.remaining, result.retryAfterMs, enableHeaders)
    return response
  }

  middleware.limiter = tenantLimiter
  return middleware
}
