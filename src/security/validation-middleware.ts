import { NextRequest, NextResponse } from 'next/server'
import { SchemaError } from '../utils/schema'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Schema {
  parse(input: unknown): any
  _validate(input: unknown): Record<string, any>
}
import { sanitizeObject } from './sanitizers'

export interface ValidateConfig {
  body?: Schema
  query?: Schema
  params?: Schema
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ValidatedRequest extends NextRequest {
  __validated__?: {
    body?: Record<string, any>
    query?: Record<string, any>
    params?: Record<string, any>
  }
}

function extractSchemaErrors(e: unknown, pathPrefix: string): Array<{ path: string; message: string }> {
  if (!(e instanceof SchemaError)) {
    return [{ path: pathPrefix, message: e instanceof Error ? e.message : String(e) }]
  }

  const msg = e.message
  // Pattern: "At key \"fieldname\": ..."
  const atKeyMatch = msg.match(/^At key "([^"]+)":/)
  if (atKeyMatch) {
    const field = atKeyMatch[1]
    const remaining = msg.slice(atKeyMatch[0].length)
    return [{ path: pathPrefix ? `${pathPrefix}.${field}` : field, message: remaining || msg }]
  }

  // Pattern: "At index N: ..."
  const atIndexMatch = msg.match(/^At index (\d+):/)
  if (atIndexMatch) {
    const idx = atIndexMatch[1]
    const remaining = msg.slice(atIndexMatch[0].length)
    return [{ path: pathPrefix ? `${pathPrefix}[${idx}]` : `[${idx}]`, message: remaining || msg }]
  }

  return [{ path: pathPrefix, message: msg }]
}

/**
 * Validate and optionally sanitize incoming request data.
 * - Sanitizes all string fields with sanitizeHtml before validation
 * - On validation failure: returns 400 with { errors: [{ path, message }] }
 * - On success: sets __validated__ on the request and returns NextResponse.next()
 */
export function validate(config: ValidateConfig) {
  return async function (req: ValidatedRequest): Promise<NextResponse> {
    const errors: Array<{ path: string; message: string }> = []

    if (config.body) {
      try {
        const body = await req.json()
        const sanitized = sanitizeObject(body, config.body)
        const validated = config.body.parse(sanitized)
        req.__validated__ = { ...req.__validated__, body: validated }
      } catch (e) {
        if (e instanceof SyntaxError) {
          return NextResponse.json(
            { errors: [{ path: 'body', message: 'Invalid JSON body' }] },
            { status: 400 },
          )
        }
        errors.push(...extractSchemaErrors(e, 'body'))
      }
    }

    if (config.query) {
      try {
        const query: Record<string, unknown> = {}
        req.nextUrl.searchParams.forEach((value, key) => {
          query[key] = value
        })
        const sanitized = sanitizeObject(query, config.query)
        const validated = config.query.parse(sanitized)
        req.__validated__ = { ...req.__validated__, query: validated }
      } catch (e) {
        errors.push(...extractSchemaErrors(e, 'query'))
      }
    }

    if (config.params) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const params = (req as any).params ?? {}
        const sanitized = sanitizeObject(params, config.params)
        const validated = config.params.parse(sanitized)
        req.__validated__ = { ...req.__validated__, params: validated }
      } catch (e) {
        errors.push(...extractSchemaErrors(e, 'params'))
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 })
    }

    return NextResponse.next()
  }
}
