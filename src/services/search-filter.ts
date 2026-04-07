import type { Where } from 'payload'

/**
 * Builds a Payload-compatible Where clause for multi-field text search.
 * Uses the `like` operator to perform partial/fuzzy matching on the specified fields.
 *
 * @param query - The search query string
 * @param fields - Array of field names to search across
 * @returns A Payload Where clause with an `or` condition combining all field `like` conditions
 */
export function buildSearchFilter(query: string, fields: string[]): Where {
  return {
    or: fields.map((field) => ({ [field]: { like: query } } as Where)),
  } as Where
}