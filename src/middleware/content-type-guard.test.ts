import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { createContentTypeGuard } from './content-type-guard'

function makeRequest(
  method: string,
  path = '/api/test',
  options: { contentType?: string; body?: BodyInit } = {},
): NextRequest {
  const req = new NextRequest(`http://localhost${path}`, {
    method,
    headers: options.contentType ? { 'Content-Type': options.contentType } : {},
    ...(options.body ? { body: options.body } : {}),
  })
  return req
}

describe('createContentTypeGuard', () => {
  describe('requests with body', () => {
    it('rejects POST request with body but no Content-Type header', () => {
      const guard = createContentTypeGuard()
      const req = makeRequest('POST', '/api/test', { body: JSON.stringify({ foo: 'bar' }) })
      const response = guard.middleware(req)
      expect(response.status).toBe(400)
    })

    it('rejects PUT request with body but no Content-Type header', () => {
      const guard = createContentTypeGuard()
      const req = makeRequest('PUT', '/api/test', { body: JSON.stringify({ foo: 'bar' }) })
      const response = guard.middleware(req)
      expect(response.status).toBe(400)
    })

    it('rejects PATCH request with body but no Content-Type header', () => {
      const guard = createContentTypeGuard()
      const req = makeRequest('PATCH', '/api/test', { body: JSON.stringify({ foo: 'bar' }) })
      const response = guard.middleware(req)
      expect(response.status).toBe(400)
    })

    it('allows POST request with application/json Content-Type', () => {
      const guard = createContentTypeGuard()
      const req = makeRequest('POST', '/api/test', {
        contentType: 'application/json',
        body: JSON.stringify({ foo: 'bar' }),
      })
      const response = guard.middleware(req)
      expect(response.status).toBe(200)
    })

    it('allows POST request with multipart/form-data Content-Type', () => {
      const guard = createContentTypeGuard()
      const req = makeRequest('POST', '/api/test', {
        contentType: 'multipart/form-data; boundary=----WebKitFormBoundary',
        body: '------WebKitFormBoundary\r\nContent-Disposition: form-data; name="field"\r\n\r\nvalue\r\n------WebKitFormBoundary--\r\n',
      })
      const response = guard.middleware(req)
      expect(response.status).toBe(200)
    })

    it('allows POST request with application/json and charset', () => {
      const guard = createContentTypeGuard()
      const req = makeRequest('POST', '/api/test', {
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify({ foo: 'bar' }),
      })
      const response = guard.middleware(req)
      expect(response.status).toBe(200)
    })

    it('rejects request with invalid Content-Type', () => {
      const guard = createContentTypeGuard()
      const req = makeRequest('POST', '/api/test', {
        contentType: 'text/plain',
        body: 'some text',
      })
      const response = guard.middleware(req)
      expect(response.status).toBe(400)
    })

    it('rejects request with xml content type', () => {
      const guard = createContentTypeGuard()
      const req = makeRequest('PUT', '/api/test', {
        contentType: 'application/xml',
        body: '<root/>',
      })
      const response = guard.middleware(req)
      expect(response.status).toBe(400)
    })
  })

  describe('requests without body', () => {
    it('allows GET request without Content-Type', () => {
      const guard = createContentTypeGuard()
      const req = makeRequest('GET')
      const response = guard.middleware(req)
      expect(response.status).toBe(200)
    })

    it('allows DELETE request without Content-Type', () => {
      const guard = createContentTypeGuard()
      const req = makeRequest('DELETE', '/api/test/1')
      const response = guard.middleware(req)
      expect(response.status).toBe(200)
    })

    it('allows HEAD request without Content-Type', () => {
      const guard = createContentTypeGuard()
      const req = makeRequest('HEAD', '/api/test')
      const response = guard.middleware(req)
      expect(response.status).toBe(200)
    })

    it('allows OPTIONS request without Content-Type', () => {
      const guard = createContentTypeGuard()
      const req = makeRequest('OPTIONS', '/api/test')
      const response = guard.middleware(req)
      expect(response.status).toBe(200)
    })

    it('allows GET request with any Content-Type header (ignored when no body)', () => {
      const guard = createContentTypeGuard()
      const req = makeRequest('GET', '/api/test', { contentType: 'text/plain' })
      const response = guard.middleware(req)
      expect(response.status).toBe(200)
    })
  })

  describe('custom allowed types', () => {
    it('allows custom content type when configured', () => {
      const guard = createContentTypeGuard({ allowedTypes: ['application/json', 'text/xml'] })
      const req = makeRequest('POST', '/api/test', {
        contentType: 'text/xml',
        body: '<root/>',
      })
      const response = guard.middleware(req)
      expect(response.status).toBe(200)
    })

    it('rejects non-configured content type', () => {
      const guard = createContentTypeGuard({ allowedTypes: ['application/json', 'text/xml'] })
      const req = makeRequest('POST', '/api/test', {
        contentType: 'multipart/form-data',
        body: 'data',
      })
      const response = guard.middleware(req)
      expect(response.status).toBe(400)
    })
  })

  describe('error response body', () => {
    it('returns JSON error message when Content-Type is missing', async () => {
      const guard = createContentTypeGuard()
      const req = makeRequest('POST', '/api/test', { body: JSON.stringify({ foo: 'bar' }) })
      const response = guard.middleware(req)
      const body = await response.json()
      expect(body.error).toContain('Content-Type')
    })

    it('returns JSON error message listing allowed types', async () => {
      const guard = createContentTypeGuard()
      const req = makeRequest('POST', '/api/test', {
        contentType: 'text/plain',
        body: 'some text',
      })
      const response = guard.middleware(req)
      const body = await response.json()
      expect(body.error).toContain('application/json')
      expect(body.error).toContain('multipart/form-data')
    })
  })
})