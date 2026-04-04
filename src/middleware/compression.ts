import { NextRequest, NextResponse } from 'next/server'
import zlib from 'zlib'

export type CompressionAlgorithm = 'gzip' | 'br'

export interface CompressionMiddlewareConfig {
  threshold?: number
  excludePaths?: string[]
  algorithms?: CompressionAlgorithm[]
}

export interface CompressionResult {
  compressed: boolean
  algorithm: CompressionAlgorithm | null
  originalSize: number
  compressedSize: number
}

const DEFAULT_THRESHOLD = 1024
const DEFAULT_ALGORITHMS: CompressionAlgorithm[] = ['gzip', 'br']

const COMPRESSIBLE_CONTENT_TYPES = [
  'application/json',
  'application/javascript',
  'application/xml',
  'application/xml',
  'text/plain',
  'text/html',
  'text/css',
  'text/xml',
  'text/javascript',
]

export function isCompressibleContentType(contentType: string | null): boolean {
  if (!contentType) return false
  const lower = contentType.toLowerCase()
  for (const type of COMPRESSIBLE_CONTENT_TYPES) {
    if (lower.includes(type)) return true
  }
  // Handle content types like application/*+json, text/*+something
  if (lower.startsWith('application/') && (lower.includes('json') || lower.includes('xml')))
    return true
  if (lower.startsWith('text/')) return true
  return false
}

export function getPreferredAlgorithm(acceptEncoding: string | null, algorithms: CompressionAlgorithm[]): CompressionAlgorithm | null {
  if (!acceptEncoding) return null
  const lower = acceptEncoding.toLowerCase()
  const parts = lower.split(',').map((s) => s.trim().split(';')[0])
  const firstChoice = parts[0]

  // If only one encoding accepted and it's available → use it
  if (parts.length === 1) {
    if (firstChoice === 'br' && algorithms.includes('br')) return 'br'
    if ((firstChoice === 'gzip' || firstChoice === 'deflate') && algorithms.includes('gzip')) return 'gzip'
    return null
  }

  // Multiple encodings accepted
  const acceptsBr = lower.includes('br')
  const acceptsGzip = lower.includes('gzip') || lower.includes('deflate')

  // If both accepted and both available → server prefers br
  if (acceptsBr && acceptsGzip && algorithms.includes('br') && algorithms.includes('gzip')) return 'br'

  // Otherwise use first available choice from client preference order
  if (firstChoice === 'br' && algorithms.includes('br')) return 'br'
  if ((firstChoice === 'gzip' || firstChoice === 'deflate') && algorithms.includes('gzip')) return 'gzip'

  // First choice not available, no fall back
  return null
}

export async function compressStream(
  body: string | Uint8Array,
  algorithm: CompressionAlgorithm,
): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const inputBytes = typeof body === 'string' ? encoder.encode(body) : body

  return new Promise((resolve, reject) => {
    const callback = (err: Error | null, result: Buffer) => {
      if (err) reject(err)
      else resolve(new Uint8Array(result))
    }

    if (algorithm === 'br') {
      zlib.brotliCompress(inputBytes, callback)
    } else {
      zlib.gzip(inputBytes, callback)
    }
  })
}

export function createCompressionMiddleware(config: CompressionMiddlewareConfig = {}) {
  const threshold = config.threshold ?? DEFAULT_THRESHOLD
  const excludePaths = new Set(config.excludePaths ?? ['/health', '/favicon.ico'])
  const algorithms = config.algorithms ?? DEFAULT_ALGORITHMS

  function middleware(request: NextRequest): NextResponse {
    const path = request.nextUrl.pathname

    // Skip excluded paths
    if (excludePaths.has(path)) {
      return NextResponse.next()
    }

    // Store the original response
    const response = NextResponse.next()

    // Get accept-encoding header
    const acceptEncoding = request.headers.get('accept-encoding')
    const algorithm = getPreferredAlgorithm(acceptEncoding, algorithms)

    // Store compression metadata on the response for later use
    // The actual compression will be applied by the response wrapper
    if (algorithm) {
      response.headers.set('X-Compression-Algorithm', algorithm)
    }
    response.headers.set('X-Compression-Threshold', String(threshold))

    return response
  }

  middleware.threshold = threshold
  middleware.algorithms = algorithms

  return middleware
}

// Helper to check if a response should be compressed
export function shouldCompress(
  contentType: string | null,
  contentLength: number | null,
  threshold: number,
): boolean {
  if (!isCompressibleContentType(contentType)) return false
  if (contentLength === null) return true // Compress if we don't know size
  return contentLength > threshold
}

// Synchronous compression check without streaming
export async function compressResponseBody(
  body: string | Uint8Array,
  algorithm: CompressionAlgorithm,
): Promise<Uint8Array> {
  return compressStream(body, algorithm)
}