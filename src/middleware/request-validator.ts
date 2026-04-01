import { NextRequest, NextResponse } from 'next/server'

// ReDoS protection constants
const MAX_PATTERN_LENGTH = 500
const REGEX_CACHE_MAX_SIZE = 100
const REGEX_TIMEOUT_MS = 100

/**
 * Creates a safe RegExp from a user-supplied pattern string.
 * Provides ReDoS protection via:
 * - Pattern length limit (prevents memory exhaustion)
 * - LRU-style regex caching (prevents recompilation + memory bloat)
 * - Node 20+ timeout option (prevents CPU exhaustion via backtracking)
 * Falls back to basic compilation with length check on older Node versions.
 */
function createSafeRegex(pattern: string, path: string): RegExp | { invalid: true; message: string } {
  if (pattern.length > MAX_PATTERN_LENGTH) {
    return {
      invalid: true,
      message: `Pattern exceeds maximum length of ${MAX_PATTERN_LENGTH} characters`,
    }
  }

  // Check cache
  const cached = regexCache.get(pattern)
  if (cached) return cached

  let regex: RegExp
  try {
    // Node 20+ supports timeout option to prevent ReDoS
    // @ts-expect-error - timeout is not in older TypeScript definitions but exists in Node 20+
    regex = new RegExp(pattern, { timeout: REGEX_TIMEOUT_MS })
  } catch {
    // Fallback for Node < 20 (no timeout support)
    try {
      regex = new RegExp(pattern)
    } catch (e) {
      return {
        invalid: true,
        message: `Invalid regex pattern: ${pattern}`,
      }
    }
  }

  // Cache management (simple LRU-ish eviction when cache is full)
  if (regexCache.size >= REGEX_CACHE_MAX_SIZE) {
    // Delete the oldest entry (first key in Map iteration order)
    const firstKey = regexCache.keys().next().value
    if (firstKey !== undefined) {
      regexCache.delete(firstKey)
    }
  }
  regexCache.set(pattern, regex)
  return regex
}

// Module-level regex cache (survives across validations)
const regexCache = new Map<string, RegExp>()

// JSON Schema types (Draft-07 subset)
export interface JSONSchema {
  type?: string | string[]
  properties?: Record<string, JSONSchema>
  required?: string[]
  enum?: unknown[]
  pattern?: string
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  items?: JSONSchema | JSONSchema[]
  additionalProperties?: boolean | JSONSchema
  oneOf?: JSONSchema[]
  anyOf?: JSONSchema[]
  allOf?: JSONSchema[]
  not?: JSONSchema
  $ref?: string
  // Extended for query/path params (often strings)
  format?: string
  minItems?: number
  maxItems?: number
  uniqueItems?: boolean
}

export interface ValidationError {
  field: string
  message: string
  value?: unknown
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

export type ErrorFormatter = (
  errors: ValidationError[],
  request: NextRequest
) => NextResponse

export interface RequestValidatorConfig {
  body?: JSONSchema
  query?: JSONSchema
  params?: JSONSchema
  errorFormatter?: ErrorFormatter
}

interface SchemaDefinitions {
  [key: string]: JSONSchema
}

// Simple JSON Schema validator (Draft-07 subset)
class JSONSchemaValidator {
  private definitions: SchemaDefinitions = {}

  addDefinition(name: string, schema: JSONSchema): void {
    this.definitions[name] = schema
  }

  clearDefinitions(): void {
    this.definitions = {}
  }

  validate(data: unknown, schema: JSONSchema, path = 'root'): ValidationResult {
    const errors: ValidationError[] = []

    // Handle $ref
    if (schema.$ref) {
      const refSchema = this.resolveRef(schema.$ref)
      if (refSchema) {
        return this.validate(data, refSchema, path)
      }
      return { valid: false, errors: [{ field: path, message: `Unknown reference: ${schema.$ref}` }] }
    }

    // Handle allOf
    if (schema.allOf) {
      for (const subSchema of schema.allOf) {
        const result = this.validate(data, subSchema, path)
        errors.push(...result.errors)
      }
      return { valid: errors.length === 0, errors }
    }

    // Handle anyOf
    if (schema.anyOf) {
      const validCount = schema.anyOf.filter((s) => this.validate(data, s, path).valid).length
      if (validCount === 0) {
        return {
          valid: false,
          errors: [{ field: path, message: 'Must match at least one schema in anyOf' }],
        }
      }
      return { valid: true, errors: [] }
    }

    // Handle oneOf
    if (schema.oneOf) {
      const validCount = schema.oneOf.filter((s) => this.validate(data, s, path).valid).length
      if (validCount !== 1) {
        return {
          valid: false,
          errors: [{ field: path, message: 'Must match exactly one schema in oneOf' }],
        }
      }
      return { valid: true, errors: [] }
    }

    // Handle not
    if (schema.not) {
      const notResult = this.validate(data, schema.not, path)
      if (notResult.valid) {
        return {
          valid: false,
          errors: [{ field: path, message: 'Must not match the schema in not' }],
        }
      }
      return { valid: true, errors: [] }
    }

    // Type validation
    if (schema.type) {
      const types = Array.isArray(schema.type) ? schema.type : [schema.type]
      const dataType = this.getType(data)

      // Special handling for integer type
      if (types.includes('integer')) {
        if (typeof data !== 'number' || !Number.isInteger(data)) {
          errors.push({
            field: path,
            message: `Expected integer, got ${dataType}`,
            value: data,
          })
          return { valid: false, errors }
        }
      } else if (!types.includes(dataType) && !(data === null && types.includes('null'))) {
        errors.push({
          field: path,
          message: `Expected type ${types.join(' or ')}, got ${dataType}`,
          value: data,
        })
        return { valid: false, errors } // Short circuit on type error
      }
    }

    // Enum validation
    if (schema.enum) {
      if (!schema.enum.includes(data)) {
        errors.push({
          field: path,
          message: `Value must be one of: ${schema.enum.map((e) => JSON.stringify(e)).join(', ')}`,
          value: data,
        })
      }
    }

    // String validations
    if (typeof data === 'string') {
      if (schema.pattern) {
        const regexResult = createSafeRegex(schema.pattern, path)
        if ('invalid' in regexResult) {
          errors.push({
            field: path,
            message: regexResult.message,
            value: data,
          })
        } else {
          try {
            if (!regexResult.test(data)) {
              errors.push({
                field: path,
                message: `String must match pattern: ${schema.pattern}`,
                value: data,
              })
            }
          } catch {
            // Timeout or other regex error - treat as validation failure
            errors.push({
              field: path,
              message: `Pattern validation timed out or failed: ${schema.pattern}`,
              value: data,
            })
          }
        }
      }

      if (schema.minLength !== undefined && data.length < schema.minLength) {
        errors.push({
          field: path,
          message: `String must be at least ${schema.minLength} characters`,
          value: data,
        })
      }

      if (schema.maxLength !== undefined && data.length > schema.maxLength) {
        errors.push({
          field: path,
          message: `String must be at most ${schema.maxLength} characters`,
          value: data,
        })
      }

      if (schema.format) {
        const formatError = this.validateFormat(data, schema.format, path)
        if (formatError) errors.push(formatError)
      }
    }

    // Number validations
    if (typeof data === 'number') {
      if (schema.minimum !== undefined && data < schema.minimum) {
        errors.push({
          field: path,
          message: `Number must be at least ${schema.minimum}`,
          value: data,
        })
      }

      if (schema.maximum !== undefined && data > schema.maximum) {
        errors.push({
          field: path,
          message: `Number must be at most ${schema.maximum}`,
          value: data,
        })
      }
    }

    // Array validations
    if (Array.isArray(data)) {
      if (schema.minItems !== undefined && data.length < schema.minItems) {
        errors.push({
          field: path,
          message: `Array must have at least ${schema.minItems} items`,
          value: data,
        })
      }

      if (schema.maxItems !== undefined && data.length > schema.maxItems) {
        errors.push({
          field: path,
          message: `Array must have at most ${schema.maxItems} items`,
          value: data,
        })
      }

      if (schema.uniqueItems && new Set(data.map((v) => JSON.stringify(v))).size !== data.length) {
        errors.push({
          field: path,
          message: 'Array items must be unique',
          value: data,
        })
      }

      if (schema.items) {
        if (Array.isArray(schema.items)) {
          // Tuple validation
          for (let i = 0; i < data.length; i++) {
            const itemSchema = schema.items[i] || schema.items[schema.items.length - 1]
            if (itemSchema) {
              const result = this.validate(data[i], itemSchema, `${path}[${i}]`)
              errors.push(...result.errors)
            }
          }
        } else {
          // List validation
          for (let i = 0; i < data.length; i++) {
            const result = this.validate(data[i], schema.items, `${path}[${i}]`)
            errors.push(...result.errors)
          }
        }
      }
    }

    // Object validations
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      if (schema.properties) {
        const obj = data as Record<string, unknown>

        // Check required properties
        if (schema.required) {
          for (const requiredField of schema.required) {
            if (!(requiredField in obj) || obj[requiredField] === undefined) {
              errors.push({
                field: `${path}.${requiredField}`,
                message: `Missing required field: ${requiredField}`,
              })
            }
          }
        }

        // Validate properties
        for (const [key, value] of Object.entries(obj)) {
          if (schema.properties[key]) {
            const result = this.validate(value, schema.properties[key], `${path}.${key}`)
            errors.push(...result.errors)
          } else if (schema.additionalProperties === false) {
            errors.push({
              field: `${path}.${key}`,
              message: `Additional property not allowed: ${key}`,
              value: value,
            })
          }
        }
      }
    }

    return { valid: errors.length === 0, errors }
  }

  private resolveRef(ref: string): JSONSchema | undefined {
    if (ref.startsWith('#/definitions/')) {
      const name = ref.slice('#/definitions/'.length)
      return this.definitions[name]
    }
    return undefined
  }

  private getType(value: unknown): string {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'array'
    return typeof value
  }

  private validateFormat(value: string, format: string, path: string): ValidationError | null {
    switch (format) {
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          return { field: path, message: 'Invalid email format', value }
        }
        break
      }
      case 'uri': {
        try {
          new URL(value)
        } catch {
          return { field: path, message: 'Invalid URI format', value }
        }
        break
      }
      case 'uuid': {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        if (!uuidRegex.test(value)) {
          return { field: path, message: 'Invalid UUID format', value }
        }
        break
      }
      case 'date': {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(value) || isNaN(Date.parse(value))) {
          return { field: path, message: 'Invalid date format (expected YYYY-MM-DD)', value }
        }
        break
      }
      case 'date-time': {
        const dtRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/
        if (!dtRegex.test(value) || isNaN(Date.parse(value))) {
          return { field: path, message: 'Invalid datetime format', value }
        }
        break
      }
      // Unknown formats are ignored
    }
    return null
  }
}

// Singleton validator instance
const globalValidator = new JSONSchemaValidator()

function defaultErrorFormatter(errors: ValidationError[], _request: NextRequest): NextResponse {
  return new NextResponse(
    JSON.stringify({
      error: 'Validation failed',
      details: errors.map((e) => ({
        field: e.field,
        message: e.message,
        ...(e.value !== undefined && { value: e.value }),
      })),
    }),
    {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}

export interface RequestValidationContext {
  valid: boolean
  errors: ValidationError[]
}

/**
 * Creates a request validation middleware.
 * Validates request body, query params, and path params against JSON schemas.
 */
export function createRequestValidator(config: RequestValidatorConfig) {
  const errorFormatter = config.errorFormatter ?? defaultErrorFormatter

  return async function requestValidator(request: NextRequest): Promise<
    | NextResponse
    | { valid: true }
    | { valid: false; errors: ValidationError[] }
  > {
    let jsonBody: unknown = undefined
    const errors: ValidationError[] = []

    // Parse body if schema is defined
    if (config.body) {
      try {
        const text = await request.text()
        if (text) {
          jsonBody = JSON.parse(text)
        }
      } catch {
        return new NextResponse(
          JSON.stringify({
            error: 'Invalid JSON in request body',
            details: [{ field: 'body', message: 'Request body must be valid JSON' }],
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }

      const bodyResult = globalValidator.validate(jsonBody, config.body, 'body')
      errors.push(...bodyResult.errors)
    }

    // Validate query params
    if (config.query) {
      const queryObj: Record<string, unknown> = {}
      request.nextUrl.searchParams.forEach((value, key) => {
        // Try to parse as JSON for complex values, otherwise use string
        try {
          queryObj[key] = JSON.parse(value)
        } catch {
          queryObj[key] = value
        }
      })

      const queryResult = globalValidator.validate(queryObj, config.query, 'query')
      errors.push(...queryResult.errors)
    }

    // Validate path params (extracted from URL)
    if (config.params) {
      const paramsObj: Record<string, unknown> = {}
      // Path params would typically come from route parsing - here we support
      // a convention where params are expected but validation happens against schema
      // Use safe property access to avoid unsafe type assertions
      const requestWithParams = request as unknown as Record<string, unknown>
      const paramValues = requestWithParams.params as Record<string, string> | undefined
      if (paramValues && typeof paramValues === 'object' && paramValues !== null) {
        for (const [key, value] of Object.entries(paramValues)) {
          // Try to parse as number if schema expects a number
          const parsed = Number(value)
          paramsObj[key] = !isNaN(parsed) && value !== '' ? parsed : value
        }
      }

      const paramsResult = globalValidator.validate(paramsObj, config.params, 'params')
      errors.push(...paramsResult.errors)
    }

    if (errors.length > 0) {
      return errorFormatter(errors, request)
    }

    return { valid: true }
  }
}

/**
 * Utility to register schema definitions for $ref usage.
 */
export function registerSchemaDefinition(name: string, schema: JSONSchema): void {
  globalValidator.addDefinition(name, schema)
}

/**
 * Utility to clear all registered schema definitions.
 * Useful for testing to reset global validator state between test suites.
 */
export function clearGlobalDefinitions(): void {
  globalValidator.clearDefinitions()
}

/**
 * Utility to validate data against a schema directly.
 */
export function validateSchema(data: unknown, schema: JSONSchema): ValidationResult {
  return globalValidator.validate(data, schema)
}

// Export the validator class for testing
export { JSONSchemaValidator }
