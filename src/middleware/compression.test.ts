import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import {
  createCompressionMiddleware,
  compressStream,
  compressResponseBody,
  isCompressibleContentType,
  getPreferredAlgorithm,
  shouldCompress,
  type CompressionAlgorithm,
} from './compression'

describe('isCompressibleContentType', () => {
  it('returns true for JSON content types', () => {
    expect(isCompressibleContentType('application/json')).toBe(true)
    expect(isCompressibleContentType('application/json; charset=utf-8')).toBe(true)
  })

  it('returns true for HTML content types', () => {
    expect(isCompressibleContentType('text/html')).toBe(true)
    expect(isCompressibleContentType('text/html; charset=utf-8')).toBe(true)
  })

  it('returns true for text content types', () => {
    expect(isCompressibleContentType('text/plain')).toBe(true)
    expect(isCompressibleContentType('text/css')).toBe(true)
    expect(isCompressibleContentType('text/javascript')).toBe(true)
    expect(isCompressibleContentType('text/xml')).toBe(true)
  })

  it('returns true for application content types with json/xml', () => {
    expect(isCompressibleContentType('application/javascript')).toBe(true)
    expect(isCompressibleContentType('application/xml')).toBe(true)
    expect(isCompressibleContentType('application/ld+json')).toBe(true)
    expect(isCompressibleContentType('application/vnd.api+json')).toBe(true)
  })

  it('returns false for binary content types', () => {
    expect(isCompressibleContentType('image/png')).toBe(false)
    expect(isCompressibleContentType('image/jpeg')).toBe(false)
    expect(isCompressibleContentType('application/pdf')).toBe(false)
    expect(isCompressibleContentType('video/mp4')).toBe(false)
    expect(isCompressibleContentType('audio/mpeg')).toBe(false)
  })

  it('returns false for null or empty content type', () => {
    expect(isCompressibleContentType(null)).toBe(false)
    expect(isCompressibleContentType('')).toBe(false)
    expect(isCompressibleContentType('binary/octet-stream')).toBe(false)
  })

  it('is case insensitive', () => {
    expect(isCompressibleContentType('APPLICATION/JSON')).toBe(true)
    expect(isCompressibleContentType('Text/Html')).toBe(true)
    expect(isCompressibleContentType('Image/Png')).toBe(false)
  })
})

describe('getPreferredAlgorithm', () => {
  it('returns br for brotli Accept-Encoding', () => {
    expect(getPreferredAlgorithm('br', ['gzip', 'br'])).toBe('br')
  })

  it('returns br when client lists br first', () => {
    expect(getPreferredAlgorithm('br, gzip', ['gzip', 'br'])).toBe('br')
  })

  it('returns br when both algorithms accepted (server prefers br)', () => {
    // Server prefers br over gzip when both are available
    expect(getPreferredAlgorithm('gzip, br', ['gzip', 'br'])).toBe('br')
    expect(getPreferredAlgorithm('gzip', ['gzip', 'br'])).toBe('gzip')
    expect(getPreferredAlgorithm('deflate, gzip', ['gzip', 'br'])).toBe('gzip')
    expect(getPreferredAlgorithm('gzip, deflate', ['gzip', 'br'])).toBe('gzip')
  })

  it('returns null when no matching algorithm', () => {
    expect(getPreferredAlgorithm('identity', ['gzip', 'br'])).toBe(null)
    expect(getPreferredAlgorithm('', ['gzip', 'br'])).toBe(null)
  })

  it('returns null for null Accept-Encoding', () => {
    expect(getPreferredAlgorithm(null, ['gzip', 'br'])).toBe(null)
  })

  it('returns null when client first choice not in server algorithms', () => {
    // When client prefers br first but server only has gzip
    expect(getPreferredAlgorithm('br, gzip', ['gzip'])).toBe(null)
    expect(getPreferredAlgorithm('gzip', ['gzip'])).toBe('gzip')

    // When client prefers gzip first but server only has br
    expect(getPreferredAlgorithm('gzip, br', ['br'])).toBe(null)
    expect(getPreferredAlgorithm('br', ['br'])).toBe('br')
  })
})

describe('shouldCompress', () => {
  it('returns true for compressible content above threshold', () => {
    expect(shouldCompress('application/json', 2000, 1024)).toBe(true)
    expect(shouldCompress('text/html', 1500, 1024)).toBe(true)
  })

  it('returns false for compressible content below threshold', () => {
    expect(shouldCompress('application/json', 500, 1024)).toBe(false)
    expect(shouldCompress('text/html', 100, 1024)).toBe(false)
  })

  it('returns false for incompressible content', () => {
    expect(shouldCompress('image/png', 5000, 1024)).toBe(false)
    expect(shouldCompress('application/pdf', 10000, 1024)).toBe(false)
  })

  it('returns true when content length is unknown (null)', () => {
    expect(shouldCompress('application/json', null, 1024)).toBe(true)
    expect(shouldCompress('text/html', null, 1024)).toBe(true)
  })

  it('handles edge case at exactly threshold', () => {
    expect(shouldCompress('application/json', 1024, 1024)).toBe(false)
    expect(shouldCompress('application/json', 1025, 1024)).toBe(true)
  })
})

describe('compressStream', () => {
  it('gzip compresses a string', async () => {
    const original = 'Hello, World! This is a test string for compression. '.repeat(10)
    const compressed = await compressStream(original, 'gzip')
    expect(compressed).toBeInstanceOf(Uint8Array)
    expect(compressed.length).toBeLessThan(new TextEncoder().encode(original).length)
  })

  it('brotli compresses a string', async () => {
    const original = 'Hello, World! This is a test string for compression.'
    const compressed = await compressStream(original, 'br')
    expect(compressed).toBeInstanceOf(Uint8Array)
    expect(compressed.length).toBeLessThan(original.length)
  })

  it('gzip compresses binary data', async () => {
    const original = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    const compressed = await compressStream(original, 'gzip')
    expect(compressed).toBeInstanceOf(Uint8Array)
    expect(compressed.length).toBeGreaterThan(0)
  })

  it('brotli compresses binary data', async () => {
    const original = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    const compressed = await compressStream(original, 'br')
    expect(compressed).toBeInstanceOf(Uint8Array)
    expect(compressed.length).toBeGreaterThan(0)
  })

  it('handles empty string', async () => {
    const compressed = await compressStream('', 'gzip')
    expect(compressed).toBeInstanceOf(Uint8Array)
    expect(compressed.length).toBeGreaterThan(0)
  })

  it('handles large JSON content', async () => {
    const largeObject = { users: Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `User ${i}` })) }
    const original = JSON.stringify(largeObject)
    const gzipCompressed = await compressStream(original, 'gzip')
    const brotliCompressed = await compressStream(original, 'br')
    expect(gzipCompressed.length).toBeLessThan(original.length)
    expect(brotliCompressed.length).toBeLessThan(original.length)
    // Brotli should generally be more efficient than gzip
    expect(brotliCompressed.length).toBeLessThanOrEqual(gzipCompressed.length)
  })

  it('produces different output for different algorithms', async () => {
    const original = 'Test content for compression comparison'
    const gzip = await compressStream(original, 'gzip')
    const brotli = await compressStream(original, 'br')
    // Gzip and brotli produce different compressed representations
    expect(gzip).not.toEqual(brotli)
  })
})

describe('compressResponseBody', () => {
  it('accepts string input', async () => {
    const original = 'Test string'
    const result = await compressResponseBody(original, 'gzip')
    expect(result).toBeInstanceOf(Uint8Array)
  })

  it('accepts Uint8Array input', async () => {
    const original = new Uint8Array([1, 2, 3, 4, 5])
    const result = await compressResponseBody(original, 'gzip')
    expect(result).toBeInstanceOf(Uint8Array)
  })

  it('produces consistent results for same input', async () => {
    const original = 'Consistent test string'
    const result1 = await compressResponseBody(original, 'gzip')
    const result2 = await compressResponseBody(original, 'gzip')
    // Same algorithm should produce same output
    expect(result1.length).toBe(result2.length)
  })
})

describe('createCompressionMiddleware', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function makeRequest(url: string, headers?: Record<string, string>): NextRequest {
    return new NextRequest(`http://localhost${url}`, {
      headers,
    })
  }

  it('returns a middleware function', () => {
    const mw = createCompressionMiddleware()
    expect(typeof mw).toBe('function')
  })

  it('has threshold property attached', () => {
    const mw = createCompressionMiddleware({ threshold: 2048 })
    expect(mw.threshold).toBe(2048)
  })

  it('has algorithms property attached', () => {
    const mw = createCompressionMiddleware({ algorithms: ['br'] })
    expect(mw.algorithms).toEqual(['br'])
  })

  it('uses default threshold of 1024', () => {
    const mw = createCompressionMiddleware()
    expect(mw.threshold).toBe(1024)
  })

  it('uses default algorithms of gzip and brotli', () => {
    const mw = createCompressionMiddleware()
    expect(mw.algorithms).toEqual(['gzip', 'br'])
  })

  it('skips excluded paths', () => {
    const mw = createCompressionMiddleware({ excludePaths: ['/health', '/admin'] })
    const healthRequest = makeRequest('/health')
    const response = mw(healthRequest)
    expect(response.headers.get('X-Compression-Algorithm')).toBeNull()
  })

  it('sets compression header when Accept-Encoding is present', () => {
    const mw = createCompressionMiddleware()
    const request = makeRequest('/api/test', { 'accept-encoding': 'gzip, br' })
    const response = mw(request)
    expect(response.headers.get('X-Compression-Algorithm')).not.toBeNull()
  })

  it('does not set compression header when Accept-Encoding is missing', () => {
    const mw = createCompressionMiddleware()
    const request = makeRequest('/api/test')
    const response = mw(request)
    expect(response.headers.get('X-Compression-Algorithm')).toBeNull()
  })

  it('prefers brotli when both algorithms accepted', () => {
    const mw = createCompressionMiddleware()
    const request = makeRequest('/api/test', { 'accept-encoding': 'gzip, br' })
    const response = mw(request)
    expect(response.headers.get('X-Compression-Algorithm')).toBe('br')
  })

  it('prefers gzip when brotli not accepted', () => {
    const mw = createCompressionMiddleware()
    const request = makeRequest('/api/test', { 'accept-encoding': 'gzip, deflate' })
    const response = mw(request)
    expect(response.headers.get('X-Compression-Algorithm')).toBe('gzip')
  })

  it('does not compress when only identity encoding accepted', () => {
    const mw = createCompressionMiddleware()
    const request = makeRequest('/api/test', { 'accept-encoding': 'identity' })
    const response = mw(request)
    expect(response.headers.get('X-Compression-Algorithm')).toBeNull()
  })

  it('respects custom algorithms config', () => {
    const mw = createCompressionMiddleware({ algorithms: ['gzip'] })
    const request = makeRequest('/api/test', { 'accept-encoding': 'gzip, br' })
    const response = mw(request)
    // Should prefer gzip since br is not in allowed algorithms
    expect(response.headers.get('X-Compression-Algorithm')).toBe('gzip')
  })

  it('sets threshold header on response', () => {
    const mw = createCompressionMiddleware({ threshold: 2048 })
    const request = makeRequest('/api/test', { 'accept-encoding': 'gzip' })
    const response = mw(request)
    expect(response.headers.get('X-Compression-Threshold')).toBe('2048')
  })

  it('excluded paths bypass compression check', () => {
    const mw = createCompressionMiddleware({ excludePaths: ['/api/health'] })
    const request = makeRequest('/api/health', { 'accept-encoding': 'gzip, br' })
    const response = mw(request)
    expect(response.headers.get('X-Compression-Algorithm')).toBeNull()
  })

  it('handles multiple exclude paths', () => {
    const mw = createCompressionMiddleware({
      excludePaths: ['/health', '/metrics', '/favicon.ico'],
    })
    for (const path of ['/health', '/metrics', '/favicon.ico']) {
      const request = makeRequest(path, { 'accept-encoding': 'gzip, br' })
      const response = mw(request)
      expect(response.headers.get('X-Compression-Algorithm')).toBeNull()
    }
  })

  it('allows non-excluded paths to be compressed', () => {
    const mw = createCompressionMiddleware({ excludePaths: ['/health'] })
    const request = makeRequest('/api/users', { 'accept-encoding': 'gzip' })
    const response = mw(request)
    expect(response.headers.get('X-Compression-Algorithm')).toBe('gzip')
  })
})

describe('Integration: JSON content compression', () => {
  it('should compress JSON content effectively', async () => {
    const largeJson = JSON.stringify({
      data: Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        description: 'Lorem ipsum dolor sit amet',
      })),
    })

    const originalSize = new TextEncoder().encode(largeJson).length
    const gzipCompressed = await compressStream(largeJson, 'gzip')
    const brotliCompressed = await compressStream(largeJson, 'br')

    expect(gzipCompressed.length).toBeLessThan(originalSize)
    expect(brotliCompressed.length).toBeLessThan(originalSize)
    expect(originalSize).toBeGreaterThan(1024) // Ensure it's above typical threshold
  })
})

describe('Integration: HTML content compression', () => {
  it('should compress HTML content effectively', async () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head><title>Test</title></head>
        <body>
          ${Array.from({ length: 50 }, (_, i) => `<p>Paragraph ${i}: Lorem ipsum dolor sit amet.</p>`).join('\n')}
        </body>
      </html>
    `

    const originalSize = new TextEncoder().encode(html).length
    const gzipCompressed = await compressStream(html, 'gzip')
    const brotliCompressed = await compressStream(html, 'br')

    expect(gzipCompressed.length).toBeLessThan(originalSize)
    expect(brotliCompressed.length).toBeLessThan(originalSize)
  })
})

describe('Integration: binary content compression', () => {
  it('should handle binary content (compressible patterns)', async () => {
    // Create binary data with repeated patterns (compressible)
    const binary = new Uint8Array(1000)
    for (let i = 0; i < 1000; i++) {
      binary[i] = i % 256
    }

    const gzipCompressed = await compressStream(binary, 'gzip')
    const brotliCompressed = await compressStream(binary, 'br')

    expect(gzipCompressed.length).toBeLessThan(binary.length)
    expect(brotliCompressed.length).toBeLessThan(binary.length)
  })
})