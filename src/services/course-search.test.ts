import { describe, it, expect } from 'vitest'
import { CourseSearchService, SearchFilters, SortOption, SearchPagination } from './course-search'

// ─── Test helpers ──────────────────────────────────────────────────────────────

interface MockPayload {
  find: (opts: {
    collection: string
    where?: unknown
    sort?: string
    page: number
    limit: number
  }) => Promise<{
    docs: unknown[]
    totalDocs: number
    page: number | null
    totalPages: number
  }>
}

function makeService(payload: MockPayload) {
  return new CourseSearchService(payload as unknown as import('payload').Payload)
}

function createPayloadMock({
  docs = [],
  totalDocs = 0,
  page = 1,
  totalPages = 0,
}: {
  docs?: unknown[]
  totalDocs?: number
  page?: number
  totalPages?: number
} = {}): MockPayload {
  return {
    find: async ({ page: p, limit }: { collection: string; page: number; limit: number }) => ({
      docs,
      totalDocs,
      page: p,
      totalPages,
    }),
  }
}

// ─── Pagination defaults ────────────────────────────────────────────────────────

describe('Pagination defaults', () => {
  it('uses page 1 as default when not provided', async () => {
    const mock = createPayloadMock({ docs: [{ id: '1' }], totalDocs: 1, page: 1, totalPages: 1 })
    const svc = makeService(mock)

    const result = await svc.searchCourses('test')

    expect(result.meta.page).toBe(1)
  })

  it('uses limit 20 as default when not provided', async () => {
    const mock = createPayloadMock({ docs: [], totalDocs: 0, totalPages: 0 })
    const svc = makeService(mock)

    const result = await svc.searchCourses('test')

    expect(result.meta.limit).toBe(20)
  })

  it('accepts custom pagination values', async () => {
    const mock = createPayloadMock({ docs: [], totalDocs: 0, page: 3, totalPages: 0 })
    const svc = makeService(mock)

    const result = await svc.searchCourses('test', {}, 'relevance', { page: 3, limit: 50 })

    expect(result.meta.page).toBe(3)
    expect(result.meta.limit).toBe(50)
  })
})

// ─── Pagination validation ─────────────────────────────────────────────────────

describe('Pagination validation', () => {
  it('throws when page is less than 1', async () => {
    const mock = createPayloadMock()
    const svc = makeService(mock)

    await expect(
      svc.searchCourses('test', {}, 'relevance', { page: 0, limit: 20 }),
    ).rejects.toThrow('page must be greater than or equal to 1')
  })

  it('throws when page is negative', async () => {
    const mock = createPayloadMock()
    const svc = makeService(mock)

    await expect(
      svc.searchCourses('test', {}, 'relevance', { page: -1, limit: 20 }),
    ).rejects.toThrow('page must be greater than or equal to 1')
  })

  it('throws when limit is less than 1', async () => {
    const mock = createPayloadMock()
    const svc = makeService(mock)

    await expect(
      svc.searchCourses('test', {}, 'relevance', { page: 1, limit: 0 }),
    ).rejects.toThrow('limit must be between 1 and 100')
  })

  it('throws when limit exceeds 100', async () => {
    const mock = createPayloadMock()
    const svc = makeService(mock)

    await expect(
      svc.searchCourses('test', {}, 'relevance', { page: 1, limit: 101 }),
    ).rejects.toThrow('limit must be between 1 and 100')
  })

  it('accepts limit at boundary values (1 and 100)', async () => {
    const mock1 = createPayloadMock({ docs: [], totalDocs: 0, page: 1, totalPages: 0 })
    const svc1 = makeService(mock1)

    const result1 = await svc1.searchCourses('test', {}, 'relevance', { page: 1, limit: 1 })
    expect(result1.meta.limit).toBe(1)

    const mock100 = createPayloadMock({ docs: [], totalDocs: 0, page: 1, totalPages: 0 })
    const svc100 = makeService(mock100)

    const result100 = await svc100.searchCourses('test', {}, 'relevance', { page: 1, limit: 100 })
    expect(result100.meta.limit).toBe(100)
  })
})

// ─── Pagination edge cases ─────────────────────────────────────────────────────

describe('Pagination edge cases', () => {
  it('handles page beyond results gracefully', async () => {
    const mock = createPayloadMock({ docs: [], totalDocs: 5, page: 10, totalPages: 1 })
    const svc = makeService(mock)

    const result = await svc.searchCourses('test', {}, 'relevance', { page: 10, limit: 20 })

    expect(result.meta.page).toBe(10)
    expect(result.meta.total).toBe(5)
    expect(result.meta.totalPages).toBe(1)
    expect(result.data).toHaveLength(0)
  })

  it('handles limit=1 correctly', async () => {
    const mock = createPayloadMock({
      docs: [{ id: 'course-1', title: 'Course 1' }],
      totalDocs: 1,
      page: 1,
      totalPages: 1,
    })
    const svc = makeService(mock)

    const result = await svc.searchCourses('test', {}, 'relevance', { page: 1, limit: 1 })

    expect(result.meta.limit).toBe(1)
    expect(result.data).toHaveLength(1)
  })

  it('calculates totalPages correctly for partial last page', async () => {
    const mock = createPayloadMock({ docs: [], totalDocs: 55, page: 1, totalPages: 3 })
    const svc = makeService(mock)

    const result = await svc.searchCourses('test', {}, 'relevance', { page: 1, limit: 20 })

    expect(result.meta.total).toBe(55)
    expect(result.meta.totalPages).toBe(3)
  })

  it('returns correct metadata structure', async () => {
    const mock = createPayloadMock({
      docs: [{ id: '1' }, { id: '2' }],
      totalDocs: 25,
      page: 2,
      totalPages: 3,
    })
    const svc = makeService(mock)

    const result = await svc.searchCourses('test', {}, 'relevance', { page: 2, limit: 10 })

    expect(result).toHaveProperty('data')
    expect(result).toHaveProperty('meta')
    expect(result.meta).toHaveProperty('total')
    expect(result.meta).toHaveProperty('page')
    expect(result.meta).toHaveProperty('limit')
    expect(result.meta).toHaveProperty('totalPages')
    expect(result.meta.total).toBe(25)
    expect(result.meta.page).toBe(2)
    expect(result.meta.limit).toBe(10)
    expect(result.meta.totalPages).toBe(3)
  })
})

// ─── Search with filters and pagination ───────────────────────────────────────

describe('Search with filters and pagination', () => {
  it('combines filters with pagination', async () => {
    const mock = createPayloadMock({
      docs: [{ id: '1', difficulty: 'beginner' }],
      totalDocs: 1,
      page: 1,
      totalPages: 1,
    })
    const svc = makeService(mock)

    const result = await svc.searchCourses(
      'javascript',
      { difficulty: 'beginner', status: 'published' },
      'newest',
      { page: 1, limit: 10 },
    )

    expect(result.meta.page).toBe(1)
    expect(result.meta.limit).toBe(10)
  })

  it('passes sort option with pagination', async () => {
    let capturedSort: string | undefined
    const mock: MockPayload = {
      find: async ({ sort, page, limit }: { sort?: string; page: number; limit: number }) => {
        capturedSort = sort
        return { docs: [], totalDocs: 0, page, totalPages: 0 }
      },
    }
    const svc = makeService(mock)

    await svc.searchCourses('test', {}, 'newest', { page: 2, limit: 25 })

    expect(capturedSort).toBe('-createdAt')
  })
})
