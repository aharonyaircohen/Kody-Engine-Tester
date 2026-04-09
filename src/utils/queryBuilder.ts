/**
 * Builds a URL-encoded query string from a key-value object.
 * - Arrays are encoded by repeating the key (e.g., ?key=1&key=2)
 * - Nested objects are JSON-stringified
 * - Values are wrapped in double quotes
 * - Dollar signs ($) are preserved as-is
 * - null and undefined values are skipped
 */
export function queryBuilder(params: Record<string, unknown>): string {
  if (!params || typeof params !== 'object' || Object.keys(params).length === 0) {
    return ''
  }

  const parts: string[] = []

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      continue
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === null || item === undefined) {
          continue
        }
        const encodedKey = encodeURIComponent(key)
        const encodedValue = encodeURIComponent(String(item))
        parts.push(`${encodedKey}="${encodedValue}"`)
      }
    } else if (typeof value === 'object') {
      const encodedKey = encodeURIComponent(key)
      const encodedValue = encodeURIComponent(JSON.stringify(value))
      parts.push(`${encodedKey}="${encodedValue}"`)
    } else {
      const encodedKey = encodeURIComponent(key)
      const encodedValue = encodeURIComponent(String(value))
      parts.push(`${encodedKey}="${encodedValue}"`)
    }
  }

  return parts.join('&')
}
