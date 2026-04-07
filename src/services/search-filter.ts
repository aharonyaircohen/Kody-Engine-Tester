import type { Where } from 'payload'

/**
 * Builds a Payload-compatible where clause for multi-field text search.
 *
 * @param query - The search query string
 * @param fields - List of field names to search across
 * @returns A Payload Where clause, or undefined if query is empty
 */
export function buildSearchFilter(query: string, fields: string[]): Where | undefined {
  const trimmed = query.trim()
  if (!trimmed || fields.length === 0) {
    return undefined
  }

  const fieldConditions = fields.map((field) => ({ [field]: { like: trimmed } } as Where))

  return {
    or: fieldConditions,
  } as Where
}
