/**
 * Builds a URL-encoded query string from an object of key-value pairs.
 *
 * @param params - An object where values are primitives, arrays, or nested objects
 * @returns A URL-encoded query string (without leading `?`)
 *
 * @example
 * queryBuilder({ name: 'John', age: 30 })
 * // => 'name=John&age=30'
 *
 * @example
 * queryBuilder({ tags: ['a', 'b'] })
 * // => 'tags=a&tags=b'
 *
 * @example
 * queryBuilder({ filter: { status: 'active' } })
 * // => 'filter=%7B%22status%22%3A%22active%22%7D'
 */
export function queryBuilder(params: Record<string, unknown>): string {
  const pairs: string[] = []

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== null && item !== undefined) {
          pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`)
        }
      }
    } else if (typeof value === 'object') {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`)
    } else {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    }
  }

  return pairs.join('&')
}
