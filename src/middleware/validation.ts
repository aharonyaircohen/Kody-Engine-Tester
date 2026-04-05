import { NextRequest, NextResponse } from 'next/server'

export type FieldType = 'string' | 'number' | 'boolean'

export interface FieldDefinition {
  type: FieldType
  optional?: boolean
  default?: unknown
}

export interface ValidationSchema {
  body?: Record<string, FieldDefinition>
  query?: Record<string, FieldDefinition>
  params?: Record<string, FieldDefinition>
}

export interface ValidationError {
  field: string
  message: string
}

export interface ValidatedData {
  body: Record<string, unknown>
  query: Record<string, unknown>
  params: Record<string, unknown>
}

interface ValidationResult {
  ok: true
  value: Record<string, unknown>
}

interface ValidationFailure {
  ok: false
  errors: ValidationError[]
}

type ValidateResult = ValidationResult | ValidationFailure

function isValidNumber(value: unknown): boolean {
  if (typeof value === 'number') return !isNaN(value)
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') return false
    const num = Number(trimmed)
    return !isNaN(num) && isFinite(num)
  }
  return false
}

function convertValue(value: unknown, type: FieldType): unknown {
  if (type === 'number') {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const num = Number(value)
      return isNaN(num) ? value : num
    }
    return value
  }

  if (type === 'boolean') {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
      const lower = value.toLowerCase()
      if (lower === 'true') return true
      if (lower === 'false') return false
    }
    return value
  }

  return value
}

function validateValue(
  value: unknown,
  field: FieldDefinition,
  fieldPath: string,
): ValidationError[] {
  const errors: ValidationError[] = []

  if (value === undefined || value === null || value === '') {
    if (!field.optional) {
      const fieldName = fieldPath.split('.').pop() ?? fieldPath
      errors.push({ field: fieldPath, message: `${fieldName} is required` })
    }
    return errors
  }

  const fieldName = fieldPath.split('.').pop() ?? fieldPath

  if (field.type === 'string' && typeof value !== 'string') {
    errors.push({ field: fieldPath, message: `${fieldName} must be a string` })
  }

  if (field.type === 'number' && !isValidNumber(value)) {
    errors.push({ field: fieldPath, message: `${fieldName} must be a number` })
  }

  if (field.type === 'boolean') {
    const isBool =
      typeof value === 'boolean' ||
      (typeof value === 'string' && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false'))
    if (!isBool) {
      errors.push({ field: fieldPath, message: `${fieldName} must be a boolean` })
    }
  }

  return errors
}

export function validate(
  schema: ValidationSchema,
  data: Record<string, unknown>,
  target: 'body' | 'query' | 'params',
): ValidateResult {
  const fields = schema[target]
  if (!fields) {
    return { ok: true, value: {} }
  }

  const errors: ValidationError[] = []
  const result: Record<string, unknown> = {}

  for (const [key, field] of Object.entries(fields)) {
    const fieldPath = `${target}.${key}`
    const rawValue = data[key]
    let value = rawValue

    if (rawValue === undefined || rawValue === null || rawValue === '') {
      if (field.optional) {
        if (field.default !== undefined) {
          result[key] = field.default
        }
        continue
      }

      const fieldName = key
      errors.push({ field: fieldPath, message: `${fieldName} is required` })
      continue
    }

    const fieldErrors = validateValue(rawValue, field, fieldPath)
    if (fieldErrors.length > 0) {
      errors.push(...fieldErrors)
      continue
    }

    value = convertValue(rawValue, field.type)
    result[key] = value
  }

  if (errors.length > 0) {
    return { ok: false, errors }
  }

  return { ok: true, value: result }
}

async function parseRequestBody(request: NextRequest): Promise<Record<string, unknown>> {
  const contentType = request.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    try {
      const text = await request.text()
      if (!text) return {}
      return JSON.parse(text)
    } catch {
      return {}
    }
  }

  return {}
}

function parseQueryParams(request: NextRequest): Record<string, string> {
  const params: Record<string, string> = {}
  request.nextUrl.searchParams.forEach((value, key) => {
    params[key] = value
  })
  return params
}

function parseParams(request: NextRequest): Record<string, string> {
  const pathParts = request.nextUrl.pathname.split('/').filter(Boolean)
  const params: Record<string, string> = {}

  for (const part of pathParts) {
    if (/^\d+$/.test(part)) {
      params.id = part
      break
    }
    if (/^[a-f0-9-]{36}$/i.test(part)) {
      params.id = part
      break
    }
  }

  return params
}

export function createValidationMiddleware(schema: ValidationSchema) {
  return async function validationMiddleware(
    request: NextRequest,
  ): Promise<NextResponse> {
    let bodyData: Record<string, unknown> = {}
    let queryData: Record<string, unknown> = {}
    let paramsData: Record<string, unknown> = {}

    try {
      bodyData = await parseRequestBody(request)
    } catch {
      bodyData = {}
    }

    queryData = parseQueryParams(request)
    paramsData = parseParams(request)

    const allErrors: ValidationError[] = []

    if (schema.body) {
      const bodyResult = validate(schema, bodyData, 'body')
      if (!bodyResult.ok) {
        allErrors.push(...bodyResult.errors)
      }
    }

    if (schema.query) {
      const queryResult = validate(schema, queryData, 'query')
      if (!queryResult.ok) {
        allErrors.push(...queryResult.errors)
      }
    }

    if (schema.params) {
      const paramsResult = validate(schema, paramsData, 'params')
      if (!paramsResult.ok) {
        allErrors.push(...paramsResult.errors)
      }
    }

    if (allErrors.length > 0) {
      console.error('Validation failed:', JSON.stringify({ errors: allErrors }, null, 2))
      return NextResponse.json({ errors: allErrors }, { status: 400 })
    }

    const validatedBody = schema.body
      ? validate(schema, bodyData, 'body').ok
        ? (validate(schema, bodyData, 'body') as ValidationResult).value
        : {}
      : {}

    const validatedQuery = schema.query
      ? validate(schema, queryData, 'query').ok
        ? (validate(schema, queryData, 'query') as ValidationResult).value
        : {}
      : {}

    const validatedParams = schema.params
      ? validate(schema, paramsData, 'params').ok
        ? (validate(schema, paramsData, 'params') as ValidationResult).value
        : {}
      : {}

    const validated: ValidatedData = {
      body: validatedBody,
      query: validatedQuery,
      params: validatedParams,
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-validated-data', JSON.stringify(validated))

    return new NextResponse(null, {
      status: 200,
      headers: requestHeaders,
    })
  }
}

declare module 'next/server' {
  interface NextRequest {
    validated?: ValidatedData
  }
}