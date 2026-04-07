import type { Payload, CollectionSlug, Where } from 'payload'
import { buildSearchWhere, type SearchFilters, type SearchPagination, DEFAULT_SEARCHABLE_FIELDS } from '@/utils/searchHelpers'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SearchResult extends Record<string, any> {
  collection: string
}

export interface SearchResponse {
  data: SearchResult[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

const ALLOWED_COLLECTIONS = ['courses', 'lessons', 'notes'] as const

export class SearchService {
  constructor(private payload: Payload) {}

  async search(
    query: string,
    filters: SearchFilters = {},
    pagination: SearchPagination = { page: 1, limit: 10 },
  ): Promise<SearchResponse> {
    const { page, limit } = pagination

    // Determine which collections to search
    const collections = filters.collections?.length
      ? filters.collections.filter((c) => ALLOWED_COLLECTIONS.includes(c as typeof ALLOWED_COLLECTIONS[number]))
      : [...ALLOWED_COLLECTIONS]

    if (collections.length === 0) {
      return {
        data: [],
        meta: { total: 0, page, limit, totalPages: 0 },
      }
    }

    // Build conditions using helper
    const conditions = buildSearchWhere(query, filters, DEFAULT_SEARCHABLE_FIELDS)

    // Search each collection in parallel
    const results = await Promise.all(
      collections.map((collection) =>
        this.payload.find({
          collection: collection as CollectionSlug,
          where: conditions.length > 0 ? ({ and: conditions } as Where) : undefined,
          page,
          limit,
        }),
      ),
    )

    // Merge results from all collections
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allDocs: SearchResult[] = []
    let totalDocs = 0

    for (let i = 0; i < collections.length; i++) {
      const result = results[i]
      const collection = collections[i]

      for (const doc of result.docs) {
        allDocs.push({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(doc as any as Record<string, unknown>),
          collection,
        } as SearchResult)
      }

      totalDocs += result.totalDocs
    }

    // Calculate total pages across all collections
    const totalPages = Math.ceil(totalDocs / limit)

    return {
      data: allDocs,
      meta: {
        total: totalDocs,
        page,
        limit,
        totalPages,
      },
    }
  }
}
