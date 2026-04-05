import { describe, it, expect, vi, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import {
  createCompressionMiddleware,
  canCompressResponse,
  compressBuffer,
  compressStream,
  parseEncodings,
  type EncodingType,
} from './compression'

// Simple ReadableStream helper for tests
function createReadableStream(chunks: Uint8Array[]): ReadableStream<Uint8Array> {
  let index = 0
  return new ReadableStream({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(chunks[index])
        index++
      } else {
        controller.close()
      }
    },
  })
}

describe('parseEncodings', () => {
  it('parses gzip encoding', () => {
    expect(parseEncodings('gzip')).toEqual(['gzip'])
  })

  it('parses multiple encodings', () => {
    expect(parseEncodings('gzip, deflate')).toEqual(['gzip', 'deflate'])
  })

  it('handles quality values', () => {
    expect(parseEncodings('gzip;q=0.8, deflate')).toEqual(['gzip', 'deflate'])
  })

  it('returns empty array for null', () => {
    expect(parseEncodings(null)).toEqual([])
  })

  it('filters out unsupported encodings', () => {
    expect(parseEncodings('gzip, identity, deflate')).toEqual(['gzip', 'deflate'])
  })

  it('handles br (brotli) encoding', () => {
    expect(parseEncodings('br, gzip')).toEqual(['br', 'gzip'])
  })

  it('is case insensitive', () => {
    expect(parseEncodings('GZIP, Deflate')).toEqual(['gzip', 'deflate'])
  })
})

describe('canCompressResponse', () => {
  it('returns canCompress=false for excluded paths', () => {
    const response = new NextResponse('test', {
      headers: { 'x-middleware-original-path': '/health' },
    })
    const result = canCompressResponse(
      response,
      { threshold: 1024, excludePaths: new Set(['/health']) },
      'gzip',
    )
    expect(result.canCompress).toBe(false)
  })

  it('returns canCompress=false for responses smaller than threshold', () => {
    const response = new NextResponse('test', {
      headers: { 'content-length': '500', 'x-middleware-original-path': '/api/data' },
    })
    const result = canCompressResponse(
      response,
      { threshold: 1024 },
      'gzip',
    )
    expect(result.canCompress).toBe(false)
  })

  it('returns canCompress=true for responses larger than threshold', () => {
    const response = new NextResponse('x'.repeat(2000), {
      headers: { 'content-length': '2000', 'x-middleware-original-path': '/api/data' },
    })
    const result = canCompressResponse(response, { threshold: 1024 }, 'gzip')
    expect(result.canCompress).toBe(true)
    expect(result.encoding).toBe('gzip')
  })

  it('returns canCompress=false for already compressed responses', () => {
    const response = new NextResponse('test', {
      headers: { 'content-encoding': 'gzip', 'content-length': '100' },
    })
    const result = canCompressResponse(response, { threshold: 1024 }, 'gzip')
    expect(result.canCompress).toBe(false)
  })

  it('returns canCompress=false when client does not accept compression', () => {
    const response = new NextResponse('x'.repeat(2000), {
      headers: { 'content-length': '2000' },
    })
    const result = canCompressResponse(response, { threshold: 1024 }, 'identity')
    expect(result.canCompress).toBe(false)
  })

  it('selects best matching encoding from client preferences', () => {
    const response = new NextResponse('x'.repeat(2000), {
      headers: { 'content-length': '2000' },
    })
    const result = canCompressResponse(response, { threshold: 1024, encodings: ['gzip', 'deflate'] }, 'deflate, gzip')
    expect(result.canCompress).toBe(true)
    expect(result.encoding).toBe('deflate')
  })

  it('respects configured encodings order when client accepts multiple', () => {
    const response = new NextResponse('x'.repeat(2000), {
      headers: { 'content-length': '2000' },
    })
    const result = canCompressResponse(response, { threshold: 1024, encodings: ['gzip'] }, 'gzip, deflate')
    expect(result.canCompress).toBe(true)
    expect(result.encoding).toBe('gzip')
  })

  it('filters by mimeTypes when configured', () => {
    const jsonResponse = new NextResponse('{"test":true}', {
      headers: { 'content-type': 'application/json', 'content-length': '100' },
    })
    const htmlResponse = new NextResponse('<html></html>', {
      headers: { 'content-type': 'text/html', 'content-length': '100' },
    })

    const mimeTypes = new Set(['application/json'])

    const jsonResult = canCompressResponse(jsonResponse, { threshold: 50, mimeTypes }, 'gzip')
    expect(jsonResult.canCompress).toBe(true)

    const htmlResult = canCompressResponse(htmlResponse, { threshold: 50, mimeTypes }, 'gzip')
    expect(htmlResult.canCompress).toBe(false)
  })

  it('returns canCompress=false for responses without body', () => {
    // Create a response without a body (like a redirect)
    const response = new NextResponse(null, { status: 302 })
    const result = canCompressResponse(response, { threshold: 1024 }, 'gzip')
    expect(result.canCompress).toBe(false)
  })
})

describe('compressBuffer', () => {
  it('compresses buffer using gzip by default', async () => {
    const input = Buffer.from('Hello, World! '.repeat(100))
    const compressed = await compressBuffer(input, 'gzip')

    expect(compressed).toBeInstanceOf(Buffer)
    expect(compressed.length).toBeLessThan(input.length)

    // Verify it's valid gzip by decompressing
    const { gunzip } = await import('zlib')
    const decompressed = await new Promise<Buffer>((resolve, reject) => {
      gunzip(compressed, (err, result) => {
        if (err) reject(err)
        else resolve(result)
      })
    })
    expect(decompressed.equals(input)).toBe(true)
  })

  it('compresses buffer using deflate', async () => {
    const input = Buffer.from('Test data for compression '.repeat(50))
    const compressed = await compressBuffer(input, 'deflate')

    expect(compressed).toBeInstanceOf(Buffer)
    expect(compressed.length).toBeLessThan(input.length)
  })

  it('handles empty buffer', async () => {
    const input = Buffer.from('')
    const compressed = await compressBuffer(input, 'gzip')
    expect(compressed).toBeInstanceOf(Buffer)
  })

  it('achieves significant compression for repetitive data', async () => {
    const input = Buffer.from('AAAAAAAAAA'.repeat(1000))
    const compressed = await compressBuffer(input, 'gzip')

    // Compressed should be much smaller than original
    expect(compressed.length).toBeLessThan(input.length / 10)
  })
})

describe('compressStream', () => {
  it('compresses stream data', async () => {
    const data = 'Stream test data '.repeat(50)
    const chunks = [Buffer.from(data.slice(0, 100)), Buffer.from(data.slice(100))]
    const stream = createReadableStream(chunks)

    const compressed = await compressStream(stream, 'gzip')

    expect(compressed).toBeInstanceOf(Buffer)
    expect(compressed.length).toBeLessThan(Buffer.from(data).length)
  })

  it('handles single chunk stream', async () => {
    const data = 'Single chunk'
    const stream = createReadableStream([Buffer.from(data)])
    const compressed = await compressStream(stream, 'gzip')

    expect(compressed).toBeInstanceOf(Buffer)
  })
})

describe('createCompressionMiddleware', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function makeRequest(path: string, headers?: Record<string, string>): NextRequest {
    return new NextRequest(`http://localhost${path}`, {
      headers,
    })
  }

  it('creates middleware with default config', () => {
    const mw = createCompressionMiddleware()
    expect(typeof mw).toBe('function')
    expect(typeof mw.canCompressResponse).toBe('function')
    expect(typeof mw.compressBuffer).toBe('function')
  })

  it('excludes health path by default', () => {
    const mw = createCompressionMiddleware()
    const req = makeRequest('/health')
    const res = mw(req)
    expect(res.headers.get('X-Compression-Threshold')).toBeNull()
  })

  it('sets compression headers on response', () => {
    const mw = createCompressionMiddleware({ threshold: 2048 })
    const req = makeRequest('/api/data', { 'accept-encoding': 'gzip' })
    const res = mw(req)
    expect(res.headers.get('X-Compression-Threshold')).toBe('2048')
    expect(res.headers.get('X-Accepted-Encodings')).toBe('gzip')
  })

  it('uses custom encodings when specified', () => {
    const mw = createCompressionMiddleware({ encodings: ['gzip', 'deflate'] })
    const req = makeRequest('/api/data')
    const res = mw(req)
    expect(res.headers.get('X-Accepted-Encodings')).toBe('gzip,deflate')
  })

  it('canCompressResponse uses middleware config', () => {
    const mw = createCompressionMiddleware({ threshold: 500 })
    const response = new NextResponse('x'.repeat(1000), {
      headers: { 'content-length': '1000' },
    })
    const result = mw.canCompressResponse(response, 'gzip')
    expect(result.canCompress).toBe(true)
  })

  it('excludes custom paths when specified', () => {
    const mw = createCompressionMiddleware({
      excludePaths: new Set(['/api/health', '/metrics']),
    })
    const response = new NextResponse('test', {
      headers: { 'x-middleware-original-path': '/api/health' },
    })
    const result = mw.canCompressResponse(response, 'gzip')
    expect(result.canCompress).toBe(false)
  })
})

describe('end-to-end compression scenarios', () => {
  it('large JSON response qualifies for compression', async () => {
    const largeData = { items: Array(500).fill({ id: 1, name: 'test' }) }
    const jsonString = JSON.stringify(largeData)
    const response = new NextResponse(jsonString, {
      headers: {
        'content-type': 'application/json',
        'content-length': String(Buffer.from(jsonString).length),
      },
    })

    const result = canCompressResponse(response, { threshold: 1024 }, 'gzip')
    expect(result.canCompress).toBe(true)
    expect(result.encoding).toBe('gzip')
  })

  it('small text response does not qualify for compression', () => {
    const response = new NextResponse('OK', {
      headers: { 'content-length': '2' },
    })

    const result = canCompressResponse(response, { threshold: 1024 }, 'gzip')
    expect(result.canCompress).toBe(false)
  })

  it('image response with small size does not compress', () => {
    const response = new NextResponse('PNGData', {
      headers: {
        'content-type': 'image/png',
        'content-length': '500',
      },
    })

    const result = canCompressResponse(response, { threshold: 1024, mimeTypes: new Set(['text/plain']) }, 'gzip')
    expect(result.canCompress).toBe(false)
  })

  it('text response with large size compresses', () => {
    const largeText = 'A'.repeat(3000)
    const response = new NextResponse(largeText, {
      headers: {
        'content-type': 'text/plain',
        'content-length': String(Buffer.from(largeText).length),
      },
    })

    const result = canCompressResponse(response, { threshold: 1024 }, 'gzip')
    expect(result.canCompress).toBe(true)
  })
})
