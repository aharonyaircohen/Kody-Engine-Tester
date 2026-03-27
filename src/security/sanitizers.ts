// HTML entity decoding map
const HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  nbsp: ' ',
  quot: '"',
  apos: "'",
  copy: '©',
  reg: '®',
  trade: '™',
}

/**
 * Strip all HTML tags and decode HTML entities.
 */
export function sanitizeHtml(input: string): string {
  let s = input.replace(/\0/g, '')
  s = s.replace(/<[^>]*>/g, '')
  s = s.replace(/&(#\d+|#[xX][0-9a-fA-F]+|[\w]+);/g, (match) => {
    if (match.startsWith('&#x') || match.startsWith('&#X')) {
      const code = parseInt(match.slice(3, -1), 16)
      return isNaN(code) ? '' : String.fromCodePoint(code)
    }
    if (match.startsWith('&#')) {
      const code = parseInt(match.slice(2, -1), 10)
      return isNaN(code) ? '' : String.fromCodePoint(code)
    }
    const named = match.slice(1, -1)
    return HTML_ENTITIES[named] ?? ''
  })
  return s
}

/**
 * Escape SQL special characters to help prevent SQL injection.
 * Escapes single quotes, double quotes, backslashes, and control characters.
 */
export function sanitizeSql(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/\0/g, '\\0')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
}

/**
 * Validate and normalize a URL. Rejects javascript:, data:, and null bytes.
 * Returns empty string for invalid URLs. Accepts absolute http/https URLs
 * and relative paths starting with /.
 */
export function sanitizeUrl(input: string): string {
  if (!input || input.includes('\0')) return ''

  // Accept relative paths starting with /
  if (input.startsWith('/')) {
    try {
      new URL(input, 'http://localhost')
      return input
    } catch {
      return ''
    }
  }

  try {
    const url = new URL(input)
    if (!['http:', 'https:'].includes(url.protocol)) return ''
    return url.href
  } catch {
    return ''
  }
}

/**
 * Prevent path traversal attacks. Returns empty string for unsafe paths
 * containing null bytes, absolute paths, or path traversal sequences.
 */
export function sanitizeFilePath(input: string): string {
  if (!input) return ''
  // Reject null bytes
  if (input.includes('\0')) return ''
  // Reject absolute paths
  if (input.startsWith('/')) return ''

  let s = input
  // Collapse multiple slashes
  s = s.replace(/\/+/g, '/')
  // Collapse Windows-style backslash runs
  s = s.replace(/\\+/g, '/')
  // Remove trailing slashes
  s = s.replace(/\/+$/g, '')
  // Reject if contains traversal after normalization
  if (s.includes('..')) return ''
  return s
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Schema = { _validate(input: unknown): Record<string, any> }

/**
 * Recursively sanitize an object based on its schema.
 * - String fields: sanitizeHtml applied
 * - Number/boolean: pass through unchanged
 * - Nested objects: recurse with the same logic
 * - Arrays: recurse into each item
 * - Unknown input keys not in schema are dropped
 */
export function sanitizeObject(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: Record<string, any>,
  schema: Schema,
): Record<string, unknown> {
  const shape = schema._validate(obj)
  return _sanitizeWithShape(obj, shape)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _sanitizeWithShape(obj: Record<string, any>, shape: Record<string, any>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const key of Object.keys(shape)) {
    const value = shape[key]
    if (typeof value === 'string') {
      result[key] = sanitizeHtml(obj[key] ?? value)
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Nested object — recurse using the nested shape
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result[key] = _sanitizeWithShape((obj[key] ?? value) as Record<string, any>, value)
    } else if (Array.isArray(value)) {
      result[key] = _sanitizeArray(obj[key] ?? value, value)
    } else {
      result[key] = value
    }
  }
  return result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _sanitizeArray(arr: unknown[], _itemSchema: unknown[]): unknown[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return arr.map((item: any) => {
    if (typeof item === 'string') return sanitizeHtml(item)
    if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return _sanitizeWithShape(item as Record<string, any>, item)
    }
    return item
  })
}
