import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import {
  createValidationMiddleware,
  validate,
  type ValidationSchema,
  type ValidationError,
  type FieldDefinition,
} from './validation'

function makeRequest(
  path: string,
  options: {
    method?: string
    body?: unknown
    query?: Record<string, string>
  } = {},
): NextRequest {
  const url = new URL(`http://localhost${path}`)
  if (options.query) {
    Object.entries(options.query).forEach(([k, v]) => url.searchParams.set(k, v))
  }

  const req = new NextRequest(url, {
    method: options.method ?? 'GET',
    ...(options.body !== undefined && {
      body: JSON.stringify(options.body),
      headers: { 'content-type': 'application/json' },
    }),
  })

  return req
}

describe('FieldDefinition', () => {
  it('accepts string field type', () => {
    const field: FieldDefinition = { type: 'string' }
    expect(field.type).toBe('string')
  })

  it('accepts number field type', () => {
    const field: FieldDefinition = { type: 'number' }
    expect(field.type).toBe('number')
  })

  it('accepts boolean field type', () => {
    const field: FieldDefinition = { type: 'boolean' }
    expect(field.type).toBe('boolean')
  })

  it('accepts optional flag', () => {
    const field: FieldDefinition = { type: 'string', optional: true }
    expect(field.optional).toBe(true)
  })

  it('accepts default value', () => {
    const field: FieldDefinition = { type: 'string', default: 'defaultValue' }
    expect(field.default).toBe('defaultValue')
  })
})

describe('ValidationSchema', () => {
  it('accepts empty schema', () => {
    const schema: ValidationSchema = {}
    expect(schema).toEqual({})
  })

  it('accepts body fields', () => {
    const schema: ValidationSchema = {
      body: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
    }
    expect(schema.body).toBeDefined()
    expect(schema.body!.name.type).toBe('string')
    expect(schema.body!.age.type).toBe('number')
  })

  it('accepts query fields', () => {
    const schema: ValidationSchema = {
      query: {
        page: { type: 'string' },
        limit: { type: 'number' },
      },
    }
    expect(schema.query).toBeDefined()
  })

  it('accepts params fields', () => {
    const schema: ValidationSchema = {
      params: {
        id: { type: 'string' },
      },
    }
    expect(schema.params).toBeDefined()
  })
})

describe('validate', () => {
  describe('valid requests', () => {
    it('returns validated data for valid body', () => {
      const schema: ValidationSchema = {
        body: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      }
      const data = { name: 'John', age: 30 }
      const result = validate(schema, data, 'body')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toEqual({ name: 'John', age: 30 })
      }
    })

    it('returns validated data for valid query', () => {
      const schema: ValidationSchema = {
        query: {
          page: { type: 'string' },
          limit: { type: 'number' },
        },
      }
      const data = { page: '1', limit: '10' }
      const result = validate(schema, data, 'query')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toEqual({ page: '1', limit: 10 })
      }
    })

    it('returns validated data for valid params', () => {
      const schema: ValidationSchema = {
        params: {
          id: { type: 'string' },
        },
      }
      const data = { id: '123' }
      const result = validate(schema, data, 'params')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toEqual({ id: '123' })
      }
    })

    it('applies default values for optional missing fields', () => {
      const schema: ValidationSchema = {
        body: {
          name: { type: 'string' },
          active: { type: 'boolean', optional: true, default: true },
        },
      }
      const data = { name: 'John' }
      const result = validate(schema, data, 'body')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toEqual({ name: 'John', active: true })
      }
    })

    it('accepts optional fields when missing', () => {
      const schema: ValidationSchema = {
        body: {
          name: { type: 'string' },
          email: { type: 'string', optional: true },
        },
      }
      const data = { name: 'John' }
      const result = validate(schema, data, 'body')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toEqual({ name: 'John' })
      }
    })

    it('returns ok for empty schema', () => {
      const schema: ValidationSchema = {}
      const result = validate(schema, {}, 'body')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toEqual({})
      }
    })

    it('converts string numbers to actual numbers', () => {
      const schema: ValidationSchema = {
        body: {
          count: { type: 'number' },
        },
      }
      const data = { count: '42' }
      const result = validate(schema, data, 'body')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toEqual({ count: 42 })
      }
    })

    it('converts string booleans to actual booleans', () => {
      const schema: ValidationSchema = {
        body: {
          active: { type: 'boolean' },
        },
      }
      const data = { active: 'true' }
      const result = validate(schema, data, 'body')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toEqual({ active: true })
      }
    })
  })

  describe('invalid requests', () => {
    it('returns errors for missing required field', () => {
      const schema: ValidationSchema = {
        body: {
          name: { type: 'string' },
        },
      }
      const data = {}
      const result = validate(schema, data, 'body')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.errors).toContainEqual({
          field: 'body.name',
          message: 'name is required',
        })
      }
    })

    it('returns errors for invalid string type', () => {
      const schema: ValidationSchema = {
        body: {
          age: { type: 'number' },
        },
      }
      const data = { age: 'not-a-number' }
      const result = validate(schema, data, 'body')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.errors).toContainEqual({
          field: 'body.age',
          message: 'age must be a number',
        })
      }
    })

    it('returns errors for invalid number type', () => {
      const schema: ValidationSchema = {
        body: {
          count: { type: 'number' },
        },
      }
      const data = { count: 'abc' }
      const result = validate(schema, data, 'body')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.errors).toContainEqual({
          field: 'body.count',
          message: 'count must be a number',
        })
      }
    })

    it('returns errors for invalid boolean type', () => {
      const schema: ValidationSchema = {
        body: {
          active: { type: 'boolean' },
        },
      }
      const data = { active: 'yes' }
      const result = validate(schema, data, 'body')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.errors).toContainEqual({
          field: 'body.active',
          message: 'active must be a boolean',
        })
      }
    })

    it('returns multiple errors for multiple invalid fields', () => {
      const schema: ValidationSchema = {
        body: {
          name: { type: 'string' },
          age: { type: 'number' },
          active: { type: 'boolean' },
        },
      }
      const data = { name: 123, age: 'not-a-number', active: 'invalid' }
      const result = validate(schema, data, 'body')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.errors.length).toBe(3)
      }
    })

    it('returns errors for missing required query param', () => {
      const schema: ValidationSchema = {
        query: {
          page: { type: 'string' },
        },
      }
      const data = {}
      const result = validate(schema, data, 'query')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.errors).toContainEqual({
          field: 'query.page',
          message: 'page is required',
        })
      }
    })

    it('returns errors for missing required params', () => {
      const schema: ValidationSchema = {
        params: {
          id: { type: 'string' },
        },
      }
      const data = {}
      const result = validate(schema, data, 'params')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.errors).toContainEqual({
          field: 'params.id',
          message: 'id is required',
        })
      }
    })
  })
})

describe('createValidationMiddleware', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  describe('valid requests pass through', () => {
    it('returns NextResponse.next() for valid body', async () => {
      const middleware = createValidationMiddleware({
        body: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      })

      const req = makeRequest('/api/test', {
        method: 'POST',
        body: { name: 'John', age: 30 },
      })

      const response = await middleware(req)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200)
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })

    it('returns NextResponse.next() for valid query params', async () => {
      const middleware = createValidationMiddleware({
        query: {
          page: { type: 'string' },
          limit: { type: 'number' },
        },
      })

      const req = makeRequest('/api/test?page=1&limit=10')

      const response = await middleware(req)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200)
    })

    it('returns NextResponse.next() for valid params', async () => {
      const middleware = createValidationMiddleware({
        params: {
          id: { type: 'string' },
        },
      })

      const req = makeRequest('/api/test/123')

      const response = await middleware(req)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200)
    })

    it('returns NextResponse.next() for empty schema', async () => {
      const middleware = createValidationMiddleware({})

      const req = makeRequest('/api/test')

      const response = await middleware(req)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200)
    })

    it('applies default values to validated data', async () => {
      const middleware = createValidationMiddleware({
        body: {
          name: { type: 'string' },
          active: { type: 'boolean', optional: true, default: true },
        },
      })

      const req = makeRequest('/api/test', {
        method: 'POST',
        body: { name: 'John' },
      })

      const response = await middleware(req)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200)
    })
  })

  describe('invalid requests return 400', () => {
    it('returns 400 for invalid body', async () => {
      const middleware = createValidationMiddleware({
        body: {
          age: { type: 'number' },
        },
      })

      const req = makeRequest('/api/test', {
        method: 'POST',
        body: { age: 'not-a-number' },
      })

      const response = await middleware(req)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(400)

      const body = await response.json()
      expect(body.errors).toBeDefined()
      expect(body.errors.length).toBeGreaterThan(0)
      expect(body.errors[0].field).toBe('body.age')
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('returns 400 for missing required body field', async () => {
      const middleware = createValidationMiddleware({
        body: {
          name: { type: 'string' },
        },
      })

      const req = makeRequest('/api/test', {
        method: 'POST',
        body: {},
      })

      const response = await middleware(req)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(400)

      const body = await response.json()
      expect(body.errors).toContainEqual({
        field: 'body.name',
        message: 'name is required',
      })
    })

    it('returns 400 for invalid query param', async () => {
      const middleware = createValidationMiddleware({
        query: {
          limit: { type: 'number' },
        },
      })

      const req = makeRequest('/api/test?limit=abc')

      const response = await middleware(req)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(400)

      const body = await response.json()
      expect(body.errors).toContainEqual({
        field: 'query.limit',
        message: 'limit must be a number',
      })
    })

    it('returns 400 for missing required query param', async () => {
      const middleware = createValidationMiddleware({
        query: {
          page: { type: 'string' },
        },
      })

      const req = makeRequest('/api/test')

      const response = await middleware(req)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(400)

      const body = await response.json()
      expect(body.errors).toContainEqual({
        field: 'query.page',
        message: 'page is required',
      })
    })

    it('returns 400 with multiple errors', async () => {
      const middleware = createValidationMiddleware({
        body: {
          name: { type: 'string' },
          age: { type: 'number' },
          active: { type: 'boolean' },
        },
      })

      const req = makeRequest('/api/test', {
        method: 'POST',
        body: { name: 123, age: 'not', active: 'bad' },
      })

      const response = await middleware(req)

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.errors.length).toBe(3)
    })

    it('returns structured error objects with field and message', async () => {
      const middleware = createValidationMiddleware({
        body: {
          count: { type: 'number' },
        },
      })

      const req = makeRequest('/api/test', {
        method: 'POST',
        body: { count: 'invalid' },
      })

      const response = await middleware(req)

      const body = await response.json()
      expect(body.errors[0]).toEqual({
        field: 'body.count',
        message: 'count must be a number',
      })
    })
  })
})