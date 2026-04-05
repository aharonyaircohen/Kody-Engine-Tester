import { NextRequest, NextResponse } from 'next/server'
import { createGzip, createDeflate, createBrotliCompress } from 'zlib'

export type EncodingType = 'gzip' | 'deflate' | 'br'

export interface CompressionConfig {
  /**
   * Minimum response size in bytes to trigger compression.
   * Default: 1024 (1KB)
   */
  threshold?: number
  /**
   * Supported content encodings in preference order.
   * Default: ['gzip']
   */
  encodings?: EncodingType[]
  /**
   * MIME types to compress. If not set, compress all types.
   */
  mimeTypes?: Set<string>
  /**
   * Paths to exclude from compression.
   * Default: ['/health', '/favicon.ico']
   */
  excludePaths?: Set<string>
}

export interface CompressionResult {
  canCompress: boolean
  encoding: EncodingType | null
  compressedBuffer?: Buffer
}

export function parseEncodings(acceptEncoding: string | null): EncodingType[] {
  if (!acceptEncoding) return []

  const encodings: EncodingType[] = []
  const parts = acceptEncoding.split(',').map((s) => s.trim().toLowerCase())

  for (const part of parts) {
    const [encoding] = part.split(';')
    if (encoding === 'gzip' || encoding === 'deflate' || encoding === 'br') {
      encodings.push(encoding)
    }
  }

  return encodings
}

function getEncodingStream(encoding: EncodingType) {
  switch (encoding) {
    case 'gzip':
      return createGzip()
    case 'deflate':
      return createDeflate()
    case 'br':
      // Brotli may not be available in all environments
      if (createBrotliCompress) {
        return createBrotliCompress()
      }
      return createGzip()
    default:
      return createGzip()
  }
}

export function canCompressResponse(
  response: NextResponse,
  config: CompressionConfig,
  acceptEncoding: string | null,
): CompressionResult {
  const threshold = config.threshold ?? 1024
  const configuredEncodings = config.encodings ?? ['gzip']
  const excludePaths = config.excludePaths ?? new Set(['/health', '/favicon.ico'])
  const mimeTypes = config.mimeTypes

  const path = response.headers.get('x-invoke-path') ?? response.headers.get('x-middleware-original-path') ?? ''

  // Check if path is excluded
  if (excludePaths.has(path)) {
    return { canCompress: false, encoding: null }
  }

  // Check content type
  const contentType = response.headers.get('content-type') ?? ''
  if (mimeTypes && mimeTypes.size > 0) {
    const mimeMatch = contentType.split(';')[0].trim()
    if (!mimeTypes.has(mimeMatch)) {
      return { canCompress: false, encoding: null }
    }
  }

  // Check if response is already compressed
  const contentEncoding = response.headers.get('content-encoding')
  if (contentEncoding) {
    return { canCompress: false, encoding: null }
  }

  // Check if response has a body
  if (!response.body) {
    return { canCompress: false, encoding: null }
  }

  // Check response size (Content-Length header)
  const contentLength = response.headers.get('content-length')
  if (contentLength) {
    const size = parseInt(contentLength, 10)
    if (size > 0 && size < threshold) {
      return { canCompress: false, encoding: null }
    }
  }

  // Parse acceptable encodings from Accept-Encoding header
  const clientEncodings = parseEncodings(acceptEncoding)

  // Find best matching encoding - respect client's preference order (first match wins)
  let selectedEncoding: EncodingType | null = null
  for (const clientEncoding of clientEncodings) {
    if (configuredEncodings.includes(clientEncoding)) {
      selectedEncoding = clientEncoding
      break
    }
  }

  if (!selectedEncoding) {
    return { canCompress: false, encoding: null }
  }

  return { canCompress: true, encoding: selectedEncoding }
}

export async function compressBuffer(
  buffer: Buffer,
  encoding: EncodingType,
): Promise<Buffer> {
  const stream = getEncodingStream(encoding)

  const chunks: Buffer[] = []
  stream.on('data', (chunk: Buffer) => chunks.push(chunk))
  stream.end(buffer)

  return new Promise((resolve, reject) => {
    stream.on('end', () => resolve(Buffer.concat(chunks)))
    stream.on('error', reject)
  })
}

export async function compressStream(
  body: ReadableStream<Uint8Array>,
  encoding: EncodingType,
): Promise<Buffer> {
  const reader = body.getReader()
  const chunks: Uint8Array[] = []

  let result = await reader.read()
  while (!result.done) {
    chunks.push(result.value)
    result = await reader.read()
  }

  const buffer = Buffer.concat(chunks.map((c) => (c instanceof Buffer ? c : Buffer.from(c))))
  return compressBuffer(buffer, encoding)
}

export function createCompressionMiddleware(config: CompressionConfig = {}) {
  const threshold = config.threshold ?? 1024
  const encodings = config.encodings ?? ['gzip']
  const mimeTypes = config.mimeTypes
  const excludePaths = config.excludePaths ?? new Set(['/health', '/favicon.ico'])

  function middleware(request: NextRequest): NextResponse {
    const path = request.nextUrl.pathname

    // Skip excluded paths
    if (excludePaths.has(path)) {
      return NextResponse.next()
    }

    // Get Accept-Encoding header for downstream use
    const acceptEncoding = request.headers.get('accept-encoding')

    // Store values in request for later use
    const response = NextResponse.next()
    response.headers.set('X-Compression-Threshold', String(threshold))
    response.headers.set('X-Accepted-Encodings', encodings.join(','))

    return response
  }

  middleware.canCompressResponse = (response: NextResponse, acceptEncoding: string | null) =>
    canCompressResponse(response, { threshold, encodings, mimeTypes, excludePaths }, acceptEncoding)

  middleware.compressBuffer = compressBuffer

  return middleware
}

export type CompressionMiddleware = ReturnType<typeof createCompressionMiddleware>
