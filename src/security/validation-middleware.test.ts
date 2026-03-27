import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { validate } from './validation-middleware'
import { s } from '../utils/schema'

describe('validation middleware', () => {
  function makeRequest(body?: Record<string, unknown>, query?: Record<string, string>): NextRequest {
    const url = new URL('http://localhost/api/test')
    if (query) {
      for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v)
    }
    const req = new NextRequest(url, {
      method: body ? 'POST' : 'GET',
      body: body ? JSON.stringify(body) : undefined,
      headers: body ? { 'content-type': 'application/json' } : {},
    })
    return req
  }

  describe('valid input', () => {
    it('passes valid body through and sets __validated__', async () => {
      const schema = s.object({ name: s.string(), age: s.number() })
      const req = makeRequest({ name: 'Alice', age: 30 })
      const result = await validate({ body: schema })(req)
      expect(result.status).toBe(200)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((req as any).__validated__?.body).toEqual({ name: 'Alice', age: 30 })
    })

    it('passes valid query params through', async () => {
      const schema = s.object({ page: s.string() })
      const req = makeRequest(undefined, { page: '2' })
      const result = await validate({ query: schema })(req)
      expect(result.status).toBe(200)
    })

    it('passes valid params through', async () => {
      const schema = s.object({ id: s.string() })
      // Simulate params by setting them on the request
      const req = makeRequest()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(req as any).params = { id: 'abc123' }
      const result = await validate({ params: schema })(req as NextRequest & { params: Record<string, string> })
      expect(result.status).toBe(200)
    })

    it('validates body, query, and params simultaneously', async () => {
      const bodySchema = s.object({ name: s.string() })
      const querySchema = s.object({ page: s.string() })
      const paramsSchema = s.object({ id: s.string() })
      const req = makeRequest({ name: 'Bob' }, { page: '1' })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(req as any).params = { id: 'xyz' }
      const result = await validate({
        body: bodySchema,
        query: querySchema,
        params: paramsSchema,
      })(req as NextRequest & { params: Record<string, string> })
      expect(result.status).toBe(200)
    })
  })

  describe('invalid input', () => {
    it('returns 400 with structured errors for invalid body', async () => {
      const schema = s.object({ name: s.string() })
      const req = makeRequest({ name: 123 }) // number instead of string
      const result = await validate({ body: schema })(req)
      expect(result.status).toBe(400)
      const body = await result.json()
      expect(body.errors).toBeDefined()
      expect(Array.isArray(body.errors)).toBe(true)
      expect(body.errors.length).toBeGreaterThan(0)
      expect(body.errors[0].path).toBeDefined()
      expect(body.errors[0].message).toBeDefined()
    })

    it('returns 400 for invalid query params', async () => {
      const schema = s.object({ page: s.number() })
      const url = new URL('http://localhost/api/test?page=not-a-number')
      const req = new NextRequest(url)
      const result = await validate({ query: schema })(req)
      expect(result.status).toBe(400)
      const body = await result.json()
      expect(body.errors[0].path).toMatch(/query\.page/)
    })

    it('returns 400 for missing required body fields', async () => {
      const schema = s.object({ email: s.string() })
      const req = makeRequest({})
      const result = await validate({ body: schema })(req)
      expect(result.status).toBe(400)
      const body = await result.json()
      expect(body.errors[0].path).toMatch(/body\.email/)
    })

    it('returns 400 for missing required query fields', async () => {
      const schema = s.object({ page: s.string() })
      const req = makeRequest()
      const result = await validate({ query: schema })(req)
      expect(result.status).toBe(400)
      const body = await result.json()
      expect(body.errors[0].path).toMatch(/query\.page/)
    })

    it('includes field path in error response', async () => {
      const schema = s.object({ email: s.string() })
      const req = makeRequest({ email: 42 })
      const result = await validate({ body: schema })(req)
      expect(result.status).toBe(400)
      const body = await result.json()
      expect(body.errors[0].path).toBe('body.email')
      expect(body.errors[0].message).toContain('string')
    })

    it('returns errors from multiple validated segments', async () => {
      const bodySchema = s.object({ name: s.string() })
      const querySchema = s.object({ page: s.number() })
      const url = new URL('http://localhost/api/test?page=not-a-number')
      const req = new NextRequest(url)
      const result = await validate({ body: bodySchema, query: querySchema })(req)
      expect(result.status).toBe(400)
      const body = await result.json()
      expect(body.errors.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('sanitization before validation', () => {
    it('strips HTML/XSS from string body fields before validation', async () => {
      const schema = s.object({ name: s.string() })
      const req = makeRequest({ name: '<script>alert(1)</script>' })
      const result = await validate({ body: schema })(req)
      expect(result.status).toBe(200)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const validated = (req as any).__validated__?.body
      expect(validated.name).toBe('alert(1)')
    })

    it('strips HTML tags from query params before validation', async () => {
      const schema = s.object({ search: s.string() })
      const url = new URL('http://localhost/api/test?search=<b>hello</b>')
      const req = new NextRequest(url)
      const result = await validate({ query: schema })(req)
      expect(result.status).toBe(200)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const validated = (req as any).__validated__?.query
      expect(validated.search).toBe('hello')
    })
  })

  describe('no-op behavior', () => {
    it('returns 200 when no schema is provided (empty config)', async () => {
      const req = makeRequest({ anything: 'goes' })
      const result = await validate({})(req)
      expect(result.status).toBe(200)
    })
  })
})
