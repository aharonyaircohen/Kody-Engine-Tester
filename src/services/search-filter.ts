import type { Where } from 'payload'

/**
 * Builds a Payload-compatible Where clause for multi-field text search.
 * Each field gets a `like` condition combined with `or`.
 *
 * @param query - The search query string
 * @param fields - Array of field names to search across
 * @returns A Payload Where clause object, or empty object if query/fields is empty
 */
export function buildSearchFilter(query: string, fields: string[]): object {
  if (!query || fields.length === 0) {
    return {}
  }

  return {
    or: fields.map((field) => ({ [field]: { like: query } })),
  } as Where
}