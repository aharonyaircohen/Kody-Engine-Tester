import { describe, it, expect } from 'vitest'
import { parseUrl, isValidUrl, buildUrl } from './url-parser'

describe('parseUrl', () => {
  it('parses a simple URL with all components', () => {
    const result = parseUrl('https://example.com/users/123?lang=en&page=1#intro')

    expect(result.protocol).toBe('https')
    expect(result.host).toBe('example.com')
    expect(result.path).toBe('/users/123')
    expect(result.queryParams).toEqual({ lang: 'en', page: '1' })
    expect(result.fragment).toBe('intro')
    expect(result.originalUrl).toBe('https://example.com/users/123?lang=en&page=1#intro')
  })

  it('parses HTTP protocol', () => {
    const result = parseUrl('http://example.com/path')

    expect(result.protocol).toBe('http')
    expect(result.host).toBe('example.com')
    expect(result.path).toBe('/path')
    expect(result.fragment).toBe('')
  })

  it('parses URL with port number', () => {
    const result = parseUrl('http://localhost:3000/api/users')

    expect(result.protocol).toBe('http')
    expect(result.host).toBe('localhost:3000')
    expect(result.path).toBe('/api/users')
  })

  it('hides non-standard port by default for standard ports', () => {
    const result = parseUrl('http://example.com:80/path')

    expect(result.host).toBe('example.com')
  })

  it('shows port when showPort option is true', () => {
    const result = parseUrl('http://example.com:80/path', { showPort: true })

    expect(result.host).toBe('example.com:80')
  })

  it('keeps non-standard port by default', () => {
    const result = parseUrl('http://example.com:8080/path')

    expect(result.host).toBe('example.com:8080')
  })

  it('parses URL with only path and query', () => {
    const result = parseUrl('/api/users?sort=name')

    expect(result.protocol).toBe('')
    expect(result.host).toBe('')
    expect(result.path).toBe('/api/users')
    expect(result.queryParams).toEqual({ sort: 'name' })
  })

  it('parses URL with only fragment', () => {
    const result = parseUrl('#section')

    expect(result.protocol).toBe('')
    expect(result.host).toBe('')
    expect(result.path).toBe('')
    expect(result.fragment).toBe('section')
  })

  it('parses URL without query string', () => {
    const result = parseUrl('https://example.com/users/123#intro')

    expect(result.protocol).toBe('https')
    expect(result.host).toBe('example.com')
    expect(result.path).toBe('/users/123')
    expect(result.queryParams).toEqual({})
    expect(result.fragment).toBe('intro')
  })

  it('parses URL without fragment', () => {
    const result = parseUrl('https://example.com/users/123?lang=en')

    expect(result.protocol).toBe('https')
    expect(result.host).toBe('example.com')
    expect(result.path).toBe('/users/123')
    expect(result.queryParams).toEqual({ lang: 'en' })
    expect(result.fragment).toBe('')
  })

  it('parses URL with empty query string', () => {
    const result = parseUrl('https://example.com/path?')

    expect(result.protocol).toBe('https')
    expect(result.host).toBe('example.com')
    expect(result.path).toBe('/path')
    expect(result.queryParams).toEqual({})
  })

  it('decodes URL-encoded characters by default', () => {
    const result = parseUrl('https://example.com/%2F%3F%26%3D?param=%2F%3F%26%3D')

    // %2F decodes to /, so /%2F becomes //
    expect(result.path).toBe('//?&=')
    expect(result.queryParams).toEqual({ param: '/?&=' })
  })

  it('preserves encoded characters when decode is false', () => {
    const result = parseUrl('https://example.com/%2F%3F%26%3D?param=%2F%3F%26%3D', { decode: false })

    expect(result.path).toBe('/%2F%3F%26%3D')
    expect(result.queryParams).toEqual({ param: '%2F%3F%26%3D' })
  })

  it('handles multiple query params with same key', () => {
    const result = parseUrl('https://example.com/path?key=value1&key=value2')

    // Last value wins when there are duplicate keys
    expect(result.queryParams).toEqual({ key: 'value2' })
  })

  it('handles URL with empty value query param', () => {
    const result = parseUrl('https://example.com/path?key=&other=value')

    expect(result.queryParams).toEqual({ key: '', other: 'value' })
  })

  it('handles URL with no value query param', () => {
    const result = parseUrl('https://example.com/path?key')

    expect(result.queryParams).toEqual({ key: '' })
  })

  it('handles URL with special characters in fragment', () => {
    const result = parseUrl('https://example.com/path#section-1/sub-section')

    expect(result.fragment).toBe('section-1/sub-section')
  })

  it('handles FTP protocol', () => {
    const result = parseUrl('ftp://files.example.com/download')

    expect(result.protocol).toBe('ftp')
    expect(result.host).toBe('files.example.com')
    expect(result.path).toBe('/download')
  })

  it('handles protocol with plus characters', () => {
    const result = parseUrl('view-source:https://example.com/path')

    expect(result.protocol).toBe('view-source')
    expect(result.host).toBe('example.com')
    expect(result.path).toBe('/path')
  })

  it('returns empty strings for empty input', () => {
    const result = parseUrl('')

    expect(result.protocol).toBe('')
    expect(result.host).toBe('')
    expect(result.path).toBe('')
    expect(result.queryParams).toEqual({})
    expect(result.fragment).toBe('')
    expect(result.originalUrl).toBe('')
  })

  it('returns empty strings for null/undefined input', () => {
    const resultNull = parseUrl(null as unknown as string)
    const resultUndefined = parseUrl(undefined as unknown as string)

    expect(resultNull.protocol).toBe('')
    expect(resultUndefined.protocol).toBe('')
  })

  it('handles URL with hyphen in path', () => {
    const result = parseUrl('https://example.com/user-profile/123')

    expect(result.path).toBe('/user-profile/123')
  })

  it('handles URL with numeric subdomain', () => {
    const result = parseUrl('https://api2.example.com/endpoint')

    expect(result.host).toBe('api2.example.com')
  })
})

describe('isValidUrl', () => {
  it('returns true for valid HTTPS URL', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
  })

  it('returns true for valid HTTP URL', () => {
    expect(isValidUrl('http://example.com')).toBe(true)
  })

  it('returns true for URL with port', () => {
    expect(isValidUrl('http://localhost:3000/api')).toBe(true)
  })

  it('returns true for URL with path', () => {
    expect(isValidUrl('https://example.com/users/123')).toBe(true)
  })

  it('returns false for string without protocol', () => {
    expect(isValidUrl('example.com')).toBe(false)
  })

  it('returns false for plain text', () => {
    expect(isValidUrl('not a url')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isValidUrl('')).toBe(false)
  })

  it('returns false for null', () => {
    expect(isValidUrl(null as unknown as string)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isValidUrl(undefined as unknown as string)).toBe(false)
  })

  it('returns false for URL without host', () => {
    expect(isValidUrl('https:///path')).toBe(false)
  })

  it('returns true for FTP URL', () => {
    expect(isValidUrl('ftp://files.example.com')).toBe(true)
  })
})

describe('buildUrl', () => {
  it('builds URL from parsed components', () => {
    const parsed = {
      protocol: 'https',
      host: 'example.com',
      path: '/users/123',
      queryParams: { lang: 'en', page: '1' },
      fragment: 'intro',
      originalUrl: 'https://example.com/users/123?lang=en&page=1#intro',
    }

    const url = buildUrl(parsed)

    expect(url).toBe('https://example.com/users/123?lang=en&page=1#intro')
  })

  it('builds URL without optional components', () => {
    const parsed = {
      protocol: 'https',
      host: 'example.com',
      path: '/path',
      queryParams: {},
      fragment: '',
      originalUrl: 'https://example.com/path',
    }

    const url = buildUrl(parsed)

    expect(url).toBe('https://example.com/path')
  })

  it('builds URL with query params only', () => {
    const parsed = {
      protocol: '',
      host: '',
      path: '/api/users',
      queryParams: { sort: 'name' },
      fragment: '',
      originalUrl: '/api/users?sort=name',
    }

    const url = buildUrl(parsed)

    expect(url).toBe('/api/users?sort=name')
  })

  it('builds URL with fragment only', () => {
    const parsed = {
      protocol: '',
      host: '',
      path: '',
      queryParams: {},
      fragment: 'section',
      originalUrl: '#section',
    }

    const url = buildUrl(parsed)

    expect(url).toBe('#section')
  })

  it('builds URL with special characters encoded', () => {
    const parsed = {
      protocol: 'https',
      host: 'example.com',
      path: '/path with space',
      queryParams: { key: 'value with space' },
      fragment: 'section with space',
      originalUrl: '',
    }

    const url = buildUrl(parsed)

    expect(url).toBe('https://example.com/path%20with%20space?key=value%20with%20space#section%20with%20space')
  })

  it('handles path without leading slash', () => {
    const parsed = {
      protocol: 'https',
      host: 'example.com',
      path: 'users/123',
      queryParams: {},
      fragment: '',
      originalUrl: '',
    }

    const url = buildUrl(parsed)

    expect(url).toBe('https://example.com/users/123')
  })

  it('round-trips parseUrl through buildUrl', () => {
    const original = 'https://example.com/users/123?lang=en&page=1#intro'
    const parsed = parseUrl(original)
    const rebuilt = buildUrl(parsed)

    expect(rebuilt).toBe(original)
  })
})
