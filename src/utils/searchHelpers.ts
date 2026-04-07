import type { Where } from 'payload'

export interface SearchFilters {
  query?: string
  collections?: string[]
  status?: string
  tagMode?: 'and' | 'or'
}

export interface SearchPagination {
  page: number
  limit: number
}

/**
 * Build Payload Where conditions from search query and filters.
 * Handles multi-collection search by applying the same text query
 * across title and description fields for each collection.
 */
export function buildSearchWhere(
  query: string,
  filters: SearchFilters = {},
  collectionFields: Record<string, string[]> = {},
): Where[] {
  const conditions: Where[] = []

  // Status filter
  if (filters.status) {
    conditions.push({ status: { equals: filters.status } })
  }

  // Full-text search across configured fields per collection
  if (query && Object.keys(collectionFields).length > 0) {
    // Build OR condition across all field paths for the query
    const fieldPaths = Object.values(collectionFields).flat()
    if (fieldPaths.length > 0) {
      conditions.push({
        or: fieldPaths.map((field) => ({ [field]: { like: query } } as Where)),
      } as Where)
    }
  }

  return conditions
}

/**
 * Build a cache key from search parameters.
 * Includes query, filters, and pagination to ensure unique keys per search.
 */
export function buildSearchCacheKey(
  query: string,
  filters: SearchFilters,
  pagination: SearchPagination,
): string {
  const parts = [`q=${query}`]

  if (filters.collections) {
    parts.push(`cols=${filters.collections.sort().join(',')}`)
  }
  if (filters.status) {
    parts.push(`status=${filters.status}`)
  }
  if (filters.tagMode) {
    parts.push(`tagMode=${filters.tagMode}`)
  }

  parts.push(`page=${pagination.page}`)
  parts.push(`limit=${pagination.limit}`)

  return parts.join('|')
}

/**
 * Validate that a collection name is in the allowed list.
 */
export function validateCollections(
  requested: string[],
  allowed: string[],
): { valid: string[]; invalid: string[] } {
  const valid: string[] = []
  const invalid: string[] = []

  for (const col of requested) {
    if (allowed.includes(col)) {
      valid.push(col)
    } else {
      invalid.push(col)
    }
  }

  return { valid, invalid }
}

/**
 * Default searchable fields per collection type.
 * Maps collection names to their searchable text fields.
 */
export const DEFAULT_SEARCHABLE_FIELDS: Record<string, string[]> = {
  courses: ['title', 'description'],
  lessons: ['title', 'description'],
  notes: ['title', 'content'],
}
