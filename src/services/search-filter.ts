import type { Where } from 'payload'

/**
 * Builds a Payload-compatible Where clause for multi-field text search.
 * Uses the `like` operator with an `or` condition across the specified fields.
 *
 * @param query - The search text
 * @param fields - Array of field names to search across
 * @returns A Payload Where clause object, or undefined if query or fields are empty/invalid
 */
export function buildSearchFilter(query: string, fields: string[]): Where | undefined {
  const trimmedQuery = query?.trim()
  const validFields = fields?.filter((f) => f?.trim())

  if (!trimmedQuery || validFields.length === 0) {
    return undefined
  }

  return {
    or: validFields.map((field) => ({ [field]: { like: trimmedQuery } } as Where)),
  } as Where
}