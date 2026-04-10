import type { Where } from 'payload'

/**
 * Builds a Payload-compatible where clause for multi-field text search.
 * Returns an empty object when query or fields are empty.
 */
export function buildSearchFilter(query: string, fields: string[]): Where {
  const trimmedQuery = query.trim()
  if (!trimmedQuery || fields.length === 0) {
    return {}
  }

  const orConditions = fields.map((field) => ({ [field]: { like: trimmedQuery } } as Where))

  return { or: orConditions } as Where
}
