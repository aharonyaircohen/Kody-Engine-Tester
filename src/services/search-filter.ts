import type { Where } from 'payload'

/**
 * Builds a Payload-compatible where clause for multi-field text search.
 * Returns an empty object when query or fields are empty.
 */
export function buildSearchFilter(query: string, fields: string[]): Where {
  if (!query || fields.length === 0) {
    return {}
  }

  const conditions = fields.map((field) => ({ [field]: { like: query } } as Where))

  return { or: conditions } as Where
}
