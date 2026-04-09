import type { Where } from 'payload'

/**
 * Builds a Payload-compatible Where clause for multi-field text search.
 * Returns an `or` condition with `like` operator for each field.
 *
 * @example
 * buildSearchFilter('typescript', ['title', 'description'])
 * // => { or: [{ title: { like: 'typescript' } }, { description: { like: 'typescript' } }] }
 */
export function buildSearchFilter(query: string, fields: string[]): Where {
  const trimmedQuery = query.trim()
  if (!trimmedQuery || fields.length === 0) {
    return {}
  }

  return {
    or: fields.map((field) => ({ [field]: { like: trimmedQuery } } as Where)),
  } as Where
}