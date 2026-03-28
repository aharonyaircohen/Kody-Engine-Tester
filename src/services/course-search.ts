import type { Payload, CollectionSlug, Where } from 'payload'

export interface SearchFilters {
  difficulty?: string
  tags?: string[]
  instructor?: string
  status?: string
  tagMode?: 'and' | 'or'
}

export type SortOption = 'relevance' | 'newest' | 'popularity' | 'rating'

export interface SearchPagination {
  page: number
  limit: number
}

export interface CourseSearchResult {
  data: unknown[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export class CourseSearchService {
  constructor(private payload: Payload) {}

  async searchCourses(
    query: string,
    filters: SearchFilters = {},
    sort: SortOption = 'relevance',
    pagination: SearchPagination = { page: 1, limit: 10 },
  ): Promise<CourseSearchResult> {
    const { page, limit } = pagination
    const conditions: Where[] = []

    // Status filter (only added when explicitly provided)
    if (filters.status) {
      conditions.push({ status: { equals: filters.status } })
    }

    // Full-text search across title and description
    if (query) {
      conditions.push({
        or: [
          { title: { like: query } },
          { description: { like: query } },
        ],
      } as Where)
    }

    // Difficulty filter
    if (filters.difficulty) {
      conditions.push({ difficulty: { equals: filters.difficulty } })
    }

    // Instructor filter
    if (filters.instructor) {
      conditions.push({ instructor: { equals: filters.instructor } })
    }

    // Tags filter — AND mode: one condition per tag; OR mode (default): single or condition
    if (filters.tags && filters.tags.length > 0) {
      if (filters.tagMode === 'and') {
        for (const tag of filters.tags) {
          conditions.push({ 'tags.label': { equals: tag } } as unknown as Where)
        }
      } else {
        conditions.push({
          or: filters.tags.map((tag) => ({ 'tags.label': { equals: tag } } as unknown as Where)),
        } as Where)
      }
    }

    // Sort field: only 'newest' maps to a concrete field; others use Payload default
    let sortField: string | undefined
    if (sort === 'newest') {
      sortField = '-createdAt'
    }

    const result = await this.payload.find({
      collection: 'courses' as CollectionSlug,
      where: conditions.length > 0 ? ({ and: conditions } as Where) : undefined,
      sort: sortField,
      page,
      limit,
    })

    return {
      data: result.docs,
      meta: {
        total: result.totalDocs,
        page: result.page ?? page,
        limit,
        totalPages: result.totalPages,
      },
    }
  }
}
