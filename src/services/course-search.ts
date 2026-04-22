import type { Payload, CollectionSlug, Where } from 'payload'

export interface SearchQuery {
  q?: string
  instructor?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  page?: number
  pageSize?: number
}

export interface SearchResult {
  items: Record<string, unknown>[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface CacheEntry {
  result: SearchResult
  expiresAt: number
}

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

function normalizeCacheKey(q: string, instructor: string, difficulty: string, page: number, pageSize: number): string {
  return JSON.stringify({ q: q.trim().toLowerCase(), instructor: instructor.trim().toLowerCase(), difficulty, page, pageSize })
}

export class CourseSearchService {
  private cache = new Map<string, CacheEntry>()

  constructor(private payload: Payload) {}

  async search(query: SearchQuery): Promise<SearchResult> {
    const page = this.clampPage(query.page)
    const pageSize = this.clampPageSize(query.pageSize)

    const cacheKey = normalizeCacheKey(
      query.q ?? '',
      query.instructor ?? '',
      query.difficulty ?? '',
      page,
      pageSize,
    )

    const cached = this.cache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.result
    }

    const conditions: Where[] = []

    // Always filter to published only
    conditions.push({ status: { equals: 'published' } })

    // Free-text search on title and shortDescription (case-insensitive via SQL like)
    if (query.q && query.q.trim() !== '') {
      const q = query.q.trim()
      conditions.push({
        or: [
          { title: { like: q } },
          { shortDescription: { like: q } },
        ],
      })
    }

    // Substring match on instructor name
    if (query.instructor && query.instructor.trim() !== '') {
      conditions.push({ 'instructor.name': { like: query.instructor.trim() } })
    }

    // Exact match on difficulty
    if (query.difficulty) {
      conditions.push({ difficulty: { equals: query.difficulty } })
    }

    const where = conditions.length > 0 ? ({ and: conditions }) : undefined

    const result = await this.payload.find({
      collection: 'courses' as CollectionSlug,
      where,
      page,
      limit: pageSize,
    })

    const totalPages = result.totalDocs > 0 ? Math.ceil(result.totalDocs / pageSize) : 0

    const searchResult: SearchResult = {
      items: result.docs as unknown as Record<string, unknown>[],
      total: result.totalDocs,
      page,
      pageSize,
      totalPages,
    }

    this.cache.set(cacheKey, { result: searchResult, expiresAt: Date.now() + CACHE_TTL_MS })

    return searchResult
  }

  private clampPage(page: unknown): number {
    const p = typeof page === 'number' ? page : parseInt(String(page), 10)
    if (isNaN(p) || p < 1) return 1
    return p
  }

  private clampPageSize(pageSize: unknown): number {
    const ps = typeof pageSize === 'number' ? pageSize : parseInt(String(pageSize), 10)
    if (isNaN(ps) || ps < 1) return 10
    if (ps > 50) return 50
    return ps
  }
}
