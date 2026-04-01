import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import {
  createRequestValidator,
  validateSchema,
  registerSchemaDefinition,
  JSONSchemaValidator,
  type JSONSchema,
  type ValidationError,
} from './request-validator'

describe('JSONSchemaValidator', () => {
  let validator: JSONSchemaValidator

  beforeEach(() => {
    validator = new JSONSchemaValidator()
  })

  describe('type validation', () => {
    it('validates string type', () => {
      const schema: JSONSchema = { type: 'string' }
      expect(validator.validate('hello', schema).valid).toBe(true)
      expect(validator.validate(123, schema).valid).toBe(false)
      expect(validator.validate(null, schema).valid).toBe(false)
    })

    it('validates number type', () => {
      const schema: JSONSchema = { type: 'number' }
      expect(validator.validate(42, schema).valid).toBe(true)
      expect(validator.validate('hello', schema).valid).toBe(false)
    })

    it('validates integer type', () => {
      const schema: JSONSchema = { type: 'integer' }
      expect(validator.validate(42, schema).valid).toBe(true)
      expect(validator.validate(3.14, schema).valid).toBe(false)
    })

    it('validates boolean type', () => {
      const schema: JSONSchema = { type: 'boolean' }
      expect(validator.validate(true, schema).valid).toBe(true)
      expect(validator.validate(false, schema).valid).toBe(true)
      expect(validator.validate(1, schema).valid).toBe(false)
    })

    it('validates array type', () => {
      const schema: JSONSchema = { type: 'array' }
      expect(validator.validate([1, 2, 3], schema).valid).toBe(true)
      expect(validator.validate('not array', schema).valid).toBe(false)
    })

    it('validates object type', () => {
      const schema: JSONSchema = { type: 'object' }
      expect(validator.validate({ key: 'value' }, schema).valid).toBe(true)
      expect(validator.validate('not object', schema).valid).toBe(false)
    })

    it('validates null type', () => {
      const schema: JSONSchema = { type: 'null' }
      expect(validator.validate(null, schema).valid).toBe(true)
      expect(validator.validate(undefined, schema).valid).toBe(false)
    })

    it('accepts multiple types with array syntax', () => {
      const schema: JSONSchema = { type: ['string', 'number'] }
      expect(validator.validate('hello', schema).valid).toBe(true)
      expect(validator.validate(123, schema).valid).toBe(true)
      expect(validator.validate(true, schema).valid).toBe(false)
    })
  })

  describe('enum validation', () => {
    it('validates enum values', () => {
      const schema: JSONSchema = { enum: ['red', 'green', 'blue'] }
      expect(validator.validate('red', schema).valid).toBe(true)
      expect(validator.validate('yellow', schema).valid).toBe(false)
    })

    it('returns error message with enum values', () => {
      const schema: JSONSchema = { enum: ['active', 'inactive'] }
      const result = validator.validate('unknown', schema)
      expect(result.errors[0].message).toContain('active')
      expect(result.errors[0].message).toContain('inactive')
    })

    it('handles numeric enums', () => {
      const schema: JSONSchema = { enum: [1, 2, 3] }
      expect(validator.validate(1, schema).valid).toBe(true)
      expect(validator.validate(4, schema).valid).toBe(false)
    })
  })

  describe('string validations', () => {
    it('validates pattern (regex)', () => {
      const schema: JSONSchema = { pattern: '^\\d{3}-\\d{4}$' }
      expect(validator.validate('123-4567', schema).valid).toBe(true)
      expect(validator.validate('12-34567', schema).valid).toBe(false)
    })

    it('validates minLength', () => {
      const schema: JSONSchema = { minLength: 5 }
      expect(validator.validate('hello', schema).valid).toBe(true)
      expect(validator.validate('hi', schema).valid).toBe(false)
    })

    it('validates maxLength', () => {
      const schema: JSONSchema = { maxLength: 3 }
      expect(validator.validate('abc', schema).valid).toBe(true)
      expect(validator.validate('abcd', schema).valid).toBe(false)
    })

    describe('format validation', () => {
      it('validates email format', () => {
        const schema: JSONSchema = { format: 'email' }
        expect(validator.validate('test@example.com', schema).valid).toBe(true)
        expect(validator.validate('not-an-email', schema).valid).toBe(false)
        expect(validator.validate('missing@domain', schema).valid).toBe(false)
      })

      it('validates uri format', () => {
        const schema: JSONSchema = { format: 'uri' }
        expect(validator.validate('https://example.com', schema).valid).toBe(true)
        expect(validator.validate('ftp://files.server.com', schema).valid).toBe(true)
        expect(validator.validate('not a uri', schema).valid).toBe(false)
      })

      it('validates uuid format', () => {
        const schema: JSONSchema = { format: 'uuid' }
        expect(validator.validate('550e8400-e29b-41d4-a716-446655440000', schema).valid).toBe(true)
        expect(validator.validate('not-a-uuid', schema).valid).toBe(false)
        expect(validator.validate('550e8400-e29b-41d4-a716', schema).valid).toBe(false)
      })

      it('validates date format (YYYY-MM-DD)', () => {
        const schema: JSONSchema = { format: 'date' }
        expect(validator.validate('2024-01-15', schema).valid).toBe(true)
        expect(validator.validate('2024-13-45', schema).valid).toBe(false)
        expect(validator.validate('01-15-2024', schema).valid).toBe(false)
      })

      it('validates date-time format', () => {
        const schema: JSONSchema = { format: 'date-time' }
        expect(validator.validate('2024-01-15T10:30:00Z', schema).valid).toBe(true)
        expect(validator.validate('2024-01-15T10:30:00+05:30', schema).valid).toBe(true)
        expect(validator.validate('2024-01-15T10:30:00.123Z', schema).valid).toBe(true)
        expect(validator.validate('2024-01-15', schema).valid).toBe(false)
      })

      it('ignores unknown formats', () => {
        const schema: JSONSchema = { format: 'unknown-format' }
        expect(validator.validate('any-value', schema).valid).toBe(true)
      })
    })
  })

  describe('number validations', () => {
    it('validates minimum', () => {
      const schema: JSONSchema = { minimum: 10 }
      expect(validator.validate(10, schema).valid).toBe(true)
      expect(validator.validate(9, schema).valid).toBe(false)
    })

    it('validates maximum', () => {
      const schema: JSONSchema = { maximum: 100 }
      expect(validator.validate(100, schema).valid).toBe(true)
      expect(validator.validate(101, schema).valid).toBe(false)
    })
  })

  describe('array validations', () => {
    it('validates minItems', () => {
      const schema: JSONSchema = { minItems: 2, items: { type: 'string' } }
      expect(validator.validate(['a', 'b'], schema).valid).toBe(true)
      expect(validator.validate(['a'], schema).valid).toBe(false)
    })

    it('validates maxItems', () => {
      const schema: JSONSchema = { maxItems: 2, items: { type: 'string' } }
      expect(validator.validate(['a', 'b'], schema).valid).toBe(true)
      expect(validator.validate(['a', 'b', 'c'], schema).valid).toBe(false)
    })

    it('validates uniqueItems', () => {
      const schema: JSONSchema = { uniqueItems: true, items: { type: 'number' } }
      expect(validator.validate([1, 2, 3], schema).valid).toBe(true)
      expect(validator.validate([1, 2, 2], schema).valid).toBe(false)
    })

    it('validates items schema', () => {
      const schema: JSONSchema = { items: { type: 'number' } }
      expect(validator.validate([1, 2, 3], schema).valid).toBe(true)
      expect(validator.validate([1, '2', 3], schema).valid).toBe(false)
    })
  })

  describe('object validations', () => {
    it('validates required properties', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
        },
        required: ['name'],
      }

      expect(validator.validate({ name: 'John' }, schema).valid).toBe(true)
      expect(validator.validate({ email: 'john@example.com' }, schema).valid).toBe(false)
    })

    it('validates property types', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      }

      expect(validator.validate({ name: 'John', age: 30 }, schema).valid).toBe(true)
      expect(validator.validate({ name: 123, age: '30' }, schema).valid).toBe(false)
    })

    it('validates nested objects', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              address: {
                type: 'object',
                properties: {
                  city: { type: 'string' },
                },
              },
            },
          },
        },
      }

      expect(
        validator.validate(
          { user: { name: 'John', address: { city: 'NYC' } } },
          schema
        ).valid
      ).toBe(true)
      expect(
        validator.validate(
          { user: { name: 'John', address: { city: 123 } } },
          schema
        ).valid
      ).toBe(false)
    })

    it('blocks additionalProperties when set to false', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        additionalProperties: false,
      }

      expect(validator.validate({ name: 'John' }, schema).valid).toBe(true)
      expect(validator.validate({ name: 'John', extra: 'value' }, schema).valid).toBe(false)
    })

    it('allows additionalProperties when not set', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      }

      expect(validator.validate({ name: 'John', extra: 'value' }, schema).valid).toBe(true)
    })
  })

  describe('combinators', () => {
    it('validates allOf', () => {
      const schema: JSONSchema = {
        allOf: [{ type: 'string' }, { minLength: 5 }],
      }

      expect(validator.validate('hello world', schema).valid).toBe(true)
      expect(validator.validate('hi', schema).valid).toBe(false)
    })

    it('validates anyOf', () => {
      const schema: JSONSchema = {
        anyOf: [{ type: 'string', minLength: 10 }, { type: 'number', minimum: 100 }],
      }

      expect(validator.validate('hello world', schema).valid).toBe(true)
      expect(validator.validate(150, schema).valid).toBe(true)
      expect(validator.validate('hi', schema).valid).toBe(false)
      expect(validator.validate(50, schema).valid).toBe(false)
    })

    it('validates oneOf (exactly one match)', () => {
      const schema: JSONSchema = {
        oneOf: [{ type: 'string' }, { type: 'number' }],
      }

      expect(validator.validate('hello', schema).valid).toBe(true)
      expect(validator.validate(42, schema).valid).toBe(true)
      expect(validator.validate(true, schema).valid).toBe(false)
    })

    it('fails oneOf when multiple schemas match', () => {
      const schema: JSONSchema = {
        oneOf: [{ type: 'string', minLength: 3 }, { type: 'string', maxLength: 5 }],
      }

      expect(validator.validate('hello', schema).valid).toBe(false)
    })

    it('validates not', () => {
      const schema: JSONSchema = {
        not: { type: 'null' },
      }

      expect(validator.validate('hello', schema).valid).toBe(true)
      expect(validator.validate(null, schema).valid).toBe(false)
    })
  })

  describe('$ref resolution', () => {
    it('resolves definitions from #/definitions/', () => {
      // Register on the validator instance used in tests
      validator.addDefinition('Email', { type: 'string', format: 'email' })

      const schema: JSONSchema = {
        type: 'object',
        properties: {
          email: { $ref: '#/definitions/Email' },
        },
      }

      expect(validator.validate({ email: 'test@example.com' }, schema).valid).toBe(true)
      expect(validator.validate({ email: 'not-email' }, schema).valid).toBe(false)
    })

    it('returns error for unknown reference', () => {
      const schema: JSONSchema = { $ref: '#/definitions/Unknown' }
      const result = validator.validate('anything', schema)
      expect(result.valid).toBe(false)
      expect(result.errors[0].message).toContain('Unknown reference')
    })
  })

  describe('error reporting', () => {
    it('reports field path correctly', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'number' },
            },
          },
        },
        required: ['user'],
      }

      const result = validator.validate({ user: { name: 'John' } }, schema)
      expect(result.errors[0].field).toBe('root.user.name')
    })

    it('reports array item indices', () => {
      const schema: JSONSchema = {
        type: 'array',
        items: { type: 'number' },
      }

      const result = validator.validate([1, '2', 3], schema)
      expect(result.errors[0].field).toBe('root[1]')
    })

    it('includes value in error when available', () => {
      const schema: JSONSchema = { type: 'string', pattern: '^\\d+$' }
      const result = validator.validate('abc123', schema)
      expect(result.errors[0].value).toBe('abc123')
    })
  })
})

describe('createRequestValidator', () => {
  const createMockRequest = (options: {
    method?: string
    url?: string
    body?: string | object
    headers?: Record<string, string>
  }): NextRequest => {
    const url = options.url || 'http://localhost:3000/api/test'
    const headers = new Headers(options.headers || { 'content-type': 'application/json' })

    const request = new NextRequest(url, {
      method: options.method || 'GET',
      headers,
    })

    if (options.body !== undefined) {
      const bodyStr = typeof options.body === 'string' ? options.body : JSON.stringify(options.body)
      // Override text method to return our body
      vi.spyOn(request, 'text').mockResolvedValue(bodyStr)
    } else {
      vi.spyOn(request, 'text').mockResolvedValue('')
    }

    return request
  }

  describe('body validation', () => {
    it('returns { valid: true } for valid body', async () => {
      const validator = createRequestValidator({
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
          },
          required: ['name'],
        },
      })

      const request = createMockRequest({
        body: { name: 'John', age: 30 },
      })

      const result = await validator(request)
      expect(result).toEqual({ valid: true })
    })

    it('returns 400 with errors for invalid body', async () => {
      const validator = createRequestValidator({
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
          required: ['name'],
        },
      })

      const request = createMockRequest({
        body: { age: 30 }, // missing required 'name'
      })

      const result = await validator(request)
      expect(result).toBeInstanceOf(NextResponse)
      const response = result as NextResponse
      expect(response.status).toBe(400)

      const body = await response.json()
      expect(body.error).toBe('Validation failed')
      expect(body.details).toContainEqual(
        expect.objectContaining({
          field: 'body.name',
          message: expect.stringContaining('Missing required field'),
        })
      )
    })

    it('returns 400 for invalid JSON body', async () => {
      const validator = createRequestValidator({
        body: { type: 'object' },
      })

      const request = createMockRequest({
        body: 'not-valid-json{',
      })

      const result = await validator(request)
      expect(result).toBeInstanceOf(NextResponse)
      const response = result as NextResponse
      expect(response.status).toBe(400)

      const body = await response.json()
      expect(body.error).toBe('Invalid JSON in request body')
    })

    it('allows empty body when no schema defined', async () => {
      const validator = createRequestValidator({})

      const request = createMockRequest({
        body: '',
      })

      const result = await validator(request)
      expect(result).toEqual({ valid: true })
    })
  })

  describe('query validation', () => {
    it('validates query params against schema', async () => {
      const validator = createRequestValidator({
        query: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number', minimum: 1, maximum: 100 },
          },
        },
      })

      const request = createMockRequest({
        url: 'http://localhost:3000/api/test?page=1&limit=10',
      })

      const result = await validator(request)
      expect(result).toEqual({ valid: true })
    })

    it('returns errors for invalid query params', async () => {
      const validator = createRequestValidator({
        query: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1 },
          },
        },
      })

      const request = createMockRequest({
        url: 'http://localhost:3000/api/test?page=-1',
      })

      const result = await validator(request)
      expect(result).toBeInstanceOf(NextResponse)
      const response = result as NextResponse
      expect(response.status).toBe(400)
    })

    it('parses numeric query params correctly', async () => {
      const validator = createRequestValidator({
        query: {
          type: 'object',
          properties: {
            count: { type: 'number' },
          },
        },
      })

      const request = createMockRequest({
        url: 'http://localhost:3000/api/test?count=42',
      })

      const result = await validator(request)
      expect(result).toEqual({ valid: true })
    })
  })

  describe('custom error formatter', () => {
    it('uses custom error formatter when provided', async () => {
      const customFormatter = vi.fn((errors: ValidationError[], _request: NextRequest) => {
        return new NextResponse(
          JSON.stringify({
            custom: true,
            errorCount: errors.length,
          }),
          { status: 422, headers: { 'Content-Type': 'application/json' } }
        )
      })

      const validator = createRequestValidator({
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 10 },
          },
        },
        errorFormatter: customFormatter,
      })

      const request = createMockRequest({
        body: { name: 'short' }, // minLength: 10, but name is only 5 chars
      })

      const result = await validator(request)
      expect(customFormatter).toHaveBeenCalled()
      expect((result as NextResponse).status).toBe(422)
    })
  })
})

describe('validateSchema utility', () => {
  it('validates data against a schema directly', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
      },
      required: ['email'],
    }

    expect(validateSchema({ email: 'test@example.com' }, schema).valid).toBe(true)
    expect(validateSchema({ email: 'invalid' }, schema).valid).toBe(false)
    expect(validateSchema({}, schema).valid).toBe(false)
  })
})

describe('registerSchemaDefinition', () => {
  it('makes definition available for $ref', () => {
    registerSchemaDefinition('PhoneNumber', {
      type: 'string',
      pattern: '^\\+?\\d{10,15}$',
    })

    const schema: JSONSchema = {
      oneOf: [{ $ref: '#/definitions/PhoneNumber' }],
    }

    expect(validateSchema('+1234567890', schema).valid).toBe(true)
    expect(validateSchema('123', schema).valid).toBe(false)
  })
})
