import { NextRequest, NextResponse } from 'next/server'

export interface RouteMetrics {
  requestCount: number
  totalResponseTimeMs: number
  statusCodes: Record<string, number>
}

export interface Metrics {
  totalRequests: number
  totalResponseTimeMs: number
  routes: Record<string, RouteMetrics>
}

export interface MetricsMiddlewareConfig {
  excludePaths?: string[]
  metricsPath?: string
}

export interface MetricsMiddleware {
  middleware: (request: NextRequest) => NextResponse
  getMetrics: () => Metrics
  resetMetrics: () => void
}

function createDefaultMetrics(): Metrics {
  return {
    totalRequests: 0,
    totalResponseTimeMs: 0,
    routes: {},
  }
}

function createDefaultRouteMetrics(): RouteMetrics {
  return {
    requestCount: 0,
    totalResponseTimeMs: 0,
    statusCodes: {},
  }
}

export function createMetricsMiddleware(config: MetricsMiddlewareConfig = {}): MetricsMiddleware {
  const excludePaths = new Set(config.excludePaths ?? ['/favicon.ico'])
  const metricsPath = config.metricsPath ?? '/metrics'
  const metrics = createDefaultMetrics()

  function getRouteKey(path: string): string {
    return path
  }

  function recordRequest(path: string, status: number, responseTimeMs: number): void {
    metrics.totalRequests++
    metrics.totalResponseTimeMs += responseTimeMs

    const routeKey = getRouteKey(path)
    if (!metrics.routes[routeKey]) {
      metrics.routes[routeKey] = createDefaultRouteMetrics()
    }

    const routeMetrics = metrics.routes[routeKey]
    routeMetrics.requestCount++
    routeMetrics.totalResponseTimeMs += responseTimeMs

    const statusKey = String(status)
    routeMetrics.statusCodes[statusKey] = (routeMetrics.statusCodes[statusKey] ?? 0) + 1
  }

  function middleware(request: NextRequest): NextResponse {
    const path = request.nextUrl.pathname

    // Handle metrics endpoint
    if (path === metricsPath) {
      const metricsResponse = NextResponse.json(getMetrics())
      metricsResponse.headers.set('X-Response-Time', '0ms')
      return metricsResponse
    }

    // Skip excluded paths
    if (excludePaths.has(path)) {
      return NextResponse.next()
    }

    const startTime = Date.now()

    // Create response with X-Response-Time header
    const response = NextResponse.next()
    const responseTimeMs = Date.now() - startTime

    response.headers.set('X-Response-Time', `${responseTimeMs}ms`)

    // Record metrics for the request
    recordRequest(path, 200, responseTimeMs)

    return response
  }

  function getMetrics(): Metrics {
    return { ...metrics, routes: { ...metrics.routes } }
  }

  function resetMetrics(): void {
    metrics.totalRequests = 0
    metrics.totalResponseTimeMs = 0
    metrics.routes = {}
  }

  return { middleware, getMetrics, resetMetrics }
}

export { createMetricsMiddleware as default }
