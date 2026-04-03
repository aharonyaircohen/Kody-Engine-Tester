import { describe, it, expect } from 'vitest'
import { encodeBase64, decodeBase64, encodeBase64Buffer, decodeBase64Buffer } from './base64'

describe('encodeBase64', () => {
  it('encodes a simple string to base64', () => {
    expect(encodeBase64('Hello, World!')).toBe('SGVsbG8sIFdvcmxkIQ==')
  })

  it('encodes an empty string', () => {
    expect(encodeBase64('')).toBe('')
  })

  it('encodes unicode characters', () => {
    expect(encodeBase64('日本語')).toBe('5pel5pys6Kqe')
  })

  it('encodes with URL-safe option', () => {
    expect(encodeBase64('Hello+World/This==', true)).toBe('SGVsbG8rV29ybGQvVGhpcz09')
  })

  it('removes padding when URL-safe', () => {
    expect(encodeBase64('Hello', true)).toBe('SGVsbG8')
  })
})

describe('decodeBase64', () => {
  it('decodes a base64 string', () => {
    expect(decodeBase64('SGVsbG8sIFdvcmxkIQ==')).toBe('Hello, World!')
  })

  it('decodes an empty string', () => {
    expect(decodeBase64('')).toBe('')
  })

  it('decodes unicode characters', () => {
    expect(decodeBase64('5pel5pys6Kqe')).toBe('日本語')
  })

  it('decodes URL-safe encoded string', () => {
    expect(decodeBase64('SGVsbG8rV29ybGQvVGhpcz09', true)).toBe('Hello+World/This==')
  })
})

describe('encodeBase64Buffer', () => {
  it('encodes a buffer to base64', () => {
    const buffer = Buffer.from('Hello, World!')
    expect(encodeBase64Buffer(buffer)).toBe('SGVsbG8sIFdvcmxkIQ==')
  })

  it('encodes a buffer with URL-safe option', () => {
    const buffer = Buffer.from('Hello+World/This==')
    expect(encodeBase64Buffer(buffer, true)).toBe('SGVsbG8rV29ybGQvVGhpcz09')
  })
})

describe('decodeBase64Buffer', () => {
  it('decodes a base64 string to buffer', () => {
    const result = decodeBase64Buffer('SGVsbG8sIFdvcmxkIQ==')
    expect(result).toBeInstanceOf(Buffer)
    expect(result.toString()).toBe('Hello, World!')
  })

  it('decodes a URL-safe base64 string to buffer', () => {
    const result = decodeBase64Buffer('SGVsbG8rV29ybGQvVGhpcz09', true)
    expect(result).toBeInstanceOf(Buffer)
    expect(result.toString()).toBe('Hello+World/This==')
  })
})
