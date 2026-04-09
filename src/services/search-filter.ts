import type { Where } from 'payload'

/**
 * Builds a Payload-compatible Where clause for multi-field text search.
 *
 * @param query - The search query string. Empty query returns an empty object.
 * @param fields - The fields to search across. Each field gets a `like` condition.
 * @returns A Payload Where clause with an `or` condition combining all fields,
 *          or an empty object if query is empty.
 */
export function buildSearchFilter(query: string, fields: string[]): Where {
  if (!query || fields.length === 0) {
    return {}
  }

  const orConditions = fields.map((field) => ({ [field]: { like: query } } as Where))

  return { or: orConditions } as Where
}
