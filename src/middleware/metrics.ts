import { NextRequest, NextResponse } from 'next/server'

export interface MetricsConfig {
  /** Interval in ms between cleanup runs. Default: 60000 (1 minute) */
  cleanupIntervalMs?: number
  /** Time-to-live in ms for metric entries. Default: 300000 (5 minutes) */
  entryTtlMs?: number
  /** Maximum number of latency samples per route for percentile calculation. Default: 1000 */
  maxLatencySamples?: number
  /** Paths to exclude from metrics tracking */
  excludePaths?: string[]
}

interface MetricBucket {
  count: number
  totalLatencyMs: number
  latencies: number[]
  errors4xx: number
  errors5xx: number
  lastUpdated: number
}

export interface RouteMetrics {
  count: number
  avgLatencyMs: number
  percentiles: {
    p50: number
    p95: number
    p99: number
  }
  errors4xx: number
  errors5xx: number
}

export interface MetricsSummary {
  totals: {
    requestCount: number
    avgLatencyMs: number
    errorCount4xx: number
    errorCount5xx: number
  }
  routes: Record<string, RouteMetrics>
  generatedAt: string
}

export interface MetricsInterface {
  middleware: (request: NextRequest) => NextResponse
  getMetrics: () => MetricsSummary
  reset: () => void
  cleanup: () => void
}

/** Regex to match dynamic path segments (numeric IDs, UUIDs, etc.) */
const DYNAMIC_SEGMENT_REGEX = /^([a-f0-9-]{36}|[0-9]+|[a-f0-9]{8,})$/i

/** Normalize a path by replacing dynamic segments with :id */
function normalizeRoutePath(path: string): string {
  const segments = path.split('/')
  const normalized: string[] = []

  for (const segment of segments) {
    if (!segment) {
      normalized.push(segment)
    } else if (DYNAMIC_SEGMENT_REGEX.test(segment)) {
      normalized.push(':id')
    } else {
      normalized.push(segment)
    }
  }

  // Collapse repeated :id segments
  const result = normalized.join('/')
  return result.replace(/\/:id\/:\id/g, '/:id').replace(/:id\/:id/g, ':id')
}

/** Calculate percentile from sorted array */
function calculatePercentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const index = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, index)]
}

/** Calculate percentiles from latency array */
function calculatePercentiles(latencies: number[]): { p50: number; p95: number; p99: number } {
  if (latencies.length === 0) {
    return { p50: 0, p95: 0, p99: 0 }
  }
  const sorted = [...latencies].sort((a, b) => a - b)
  return {
    p50: calculatePercentile(sorted, 50),
    p95: calculatePercentile(sorted, 95),
    p99: calculatePercentile(sorted, 99),
  }
}

export function createMetricsMiddleware(config: MetricsConfig = {}): MetricsInterface {
  const cleanupInterval = config.cleanupIntervalMs ?? 60_000
  const entryTtl = config.entryTtlMs ?? 300_000
  const maxLatencySamples = config.maxLatencySamples ?? 1000
  const excludePaths = new Set(config.excludePaths ?? ['/favicon.ico'])

  const buckets = new Map<string, MetricBucket>()
  let cleanupTimer: ReturnType<typeof setInterval> | null = null

  function getBucket(key: string): MetricBucket {
    let bucket = buckets.get(key)
    if (!bucket) {
      bucket = {
        count: 0,
        totalLatencyMs: 0,
        latencies: [],
        errors4xx: 0,
        errors5xx: 0,
        lastUpdated: Date.now(),
      }
      buckets.set(key, bucket)
    }
    return bucket
  }

  function recordLatency(bucket: MetricBucket, latencyMs: number): void {
    bucket.latencies.push(latencyMs)
    // Trim to max samples (keep most recent)
    if (bucket.latencies.length > maxLatencySamples) {
      bucket.latencies = bucket.latencies.slice(-maxLatencySamples)
    }
  }

  function cleanup(): void {
    const now = Date.now()
    for (const [key, bucket] of buckets) {
      if (now - bucket.lastUpdated > entryTtl) {
        buckets.delete(key)
      }
    }
  }

  // Start periodic cleanup
  cleanupTimer = setInterval(cleanup, cleanupInterval)
  cleanupTimer.unref()

  function middleware(request: NextRequest): NextResponse {
    const path = request.nextUrl.pathname

    // Skip excluded paths
    if (excludePaths.has(path)) {
      return NextResponse.next()
    }

    const startTime = Date.now()
    const method = request.method
    const normalizedPath = normalizeRoutePath(path)
    const key = `${method}|${normalizedPath}`

    // Create response with timing header
    const response = NextResponse.next()
    response.headers.set('X-Response-Time-Ms', String(Date.now() - startTime))

    // Record metrics after response - the middleware doesn't block
    // We track the latency based on when we started
    const latencyMs = Date.now() - startTime
    const bucket = getBucket(key)

    bucket.count++
    bucket.totalLatencyMs += latencyMs
    bucket.lastUpdated = Date.now()
    recordLatency(bucket, latencyMs)

    return response
  }

  function getMetrics(): MetricsSummary {
    let totalCount = 0
    let totalLatencyMs = 0
    let totalErrors4xx = 0
    let totalErrors5xx = 0
    const routes: Record<string, RouteMetrics> = {}

    for (const [key, bucket] of buckets) {
      const separatorIndex = key.indexOf('|')
      const method = key.substring(0, separatorIndex)
      const path = key.substring(separatorIndex + 1)
      const routeKey = `${method}:${path}`
      const avgLatency = bucket.count > 0 ? bucket.totalLatencyMs / bucket.count : 0
      const percentiles = calculatePercentiles(bucket.latencies)

      routes[routeKey] = {
        count: bucket.count,
        avgLatencyMs: Math.round(avgLatency * 100) / 100,
        percentiles: {
          p50: Math.round(percentiles.p50 * 100) / 100,
          p95: Math.round(percentiles.p95 * 100) / 100,
          p99: Math.round(percentiles.p99 * 100) / 100,
        },
        errors4xx: bucket.errors4xx,
        errors5xx: bucket.errors5xx,
      }

      totalCount += bucket.count
      totalLatencyMs += bucket.totalLatencyMs
      totalErrors4xx += bucket.errors4xx
      totalErrors5xx += bucket.errors5xx
    }

    return {
      totals: {
        requestCount: totalCount,
        avgLatencyMs: totalCount > 0 ? Math.round((totalLatencyMs / totalCount) * 100) / 100 : 0,
        errorCount4xx: totalErrors4xx,
        errorCount5xx: totalErrors5xx,
      },
      routes,
      generatedAt: new Date().toISOString(),
    }
  }

  function reset(): void {
    buckets.clear()
  }

  function destroy(): void {
    if (cleanupTimer) {
      clearInterval(cleanupTimer)
      cleanupTimer = null
    }
    buckets.clear()
  }

  return {
    middleware,
    getMetrics,
    reset,
    cleanup,
  }
}

// Export for testing
export { normalizeRoutePath, calculatePercentiles }

// Singleton instance for use across the application
export const metrics = createMetricsMiddleware()
export default createMetricsMiddleware