import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { CourseSearchService } from './course-search'
import type { Payload } from 'payload'

function makeMockPayload(findResult?: unknown) {
  return {
    find: vi.fn().mockResolvedValue(findResult ?? { docs: [], totalDocs: 0, totalPages: 0, page: 1 }),
  } as unknown as Payload
}

const publishedCourse = {
  id: '1',
  title: 'Intro to TypeScript',
  shortDescription: 'Learn TS from scratch',
  status: 'published',
  difficulty: 'beginner',
  instructor: { id: 'u1', name: 'Alice Smith' },
}

describe('CourseSearchService', () => {
  let mockPayload: ReturnType<typeof makeMockPayload>
  let service: CourseSearchService

  beforeEach(() => {
    mockPayload = makeMockPayload() as Payload
    service = new CourseSearchService(mockPayload)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ─── Input validation ────────────────────────────────────────────────────────

  describe('pageSize clamping', () => {
    it('defaults pageSize to 10 when not provided', async () => {
      await service.search({})
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.limit).toBe(10)
    })

    it('clamps pageSize to 50 when caller passes 100', async () => {
      await service.search({ pageSize: 100 })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.limit).toBe(50)
    })

    it('clamps pageSize to 10 when caller passes 0', async () => {
      await service.search({ pageSize: 0 })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.limit).toBe(10)
    })

    it('clamps pageSize to 10 when caller passes negative', async () => {
      await service.search({ pageSize: -5 })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.limit).toBe(10)
    })

    it('accepts a valid pageSize of 25', async () => {
      await service.search({ pageSize: 25 })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.limit).toBe(25)
    })
  })

  describe('page defaults', () => {
    it('defaults page to 1 when not provided', async () => {
      await service.search({})
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.page).toBe(1)
    })

    it('defaults page to 1 when NaN', async () => {
      await service.search({ page: NaN })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.page).toBe(1)
    })

    it('defaults page to 1 when negative', async () => {
      await service.search({ page: -3 })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.page).toBe(1)
    })
  })

  // ─── Filter logic ───────────────────────────────────────────────────────────

  describe('q filter — case-insensitive match on title and shortDescription', () => {
    it('adds title and shortDescription conditions when q is provided', async () => {
      await service.search({ q: 'typescript' })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const whereStr = JSON.stringify(call.where)
      expect(whereStr).toContain('title')
      expect(whereStr).toContain('shortDescription')
    })

    it('trims whitespace from q', async () => {
      await service.search({ q: '  typescript  ' })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const whereStr = JSON.stringify(call.where)
      expect(whereStr).toContain('typescript')
    })

    it('does not add search conditions when q is empty', async () => {
      await service.search({ q: '' })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const whereStr = JSON.stringify(call.where ?? '')
      expect(whereStr).not.toContain('title')
      expect(whereStr).not.toContain('shortDescription')
    })

    it('does not add search conditions when q is only whitespace', async () => {
      await service.search({ q: '   ' })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const whereStr = JSON.stringify(call.where ?? '')
      expect(whereStr).not.toContain('title')
    })
  })

  describe('difficulty filter — exact match', () => {
    it('adds exact difficulty condition', async () => {
      await service.search({ difficulty: 'beginner' })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const whereStr = JSON.stringify(call.where)
      expect(whereStr).toContain('difficulty')
      expect(whereStr).toContain('beginner')
    })

    it('does not add difficulty condition when not provided', async () => {
      await service.search({})
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const whereStr = JSON.stringify(call.where ?? '')
      expect(whereStr).not.toContain('difficulty')
    })
  })

  describe('instructor filter — substring match', () => {
    it('adds instructor.name substring condition', async () => {
      await service.search({ instructor: 'Alice' })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const whereStr = JSON.stringify(call.where)
      expect(whereStr).toContain('instructor.name')
      expect(whereStr).toContain('Alice')
    })

    it('trims whitespace from instructor filter', async () => {
      await service.search({ instructor: '  Smith  ' })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const whereStr = JSON.stringify(call.where)
      expect(whereStr).toContain('Smith')
    })

    it('does not add instructor condition when not provided', async () => {
      await service.search({})
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const whereStr = JSON.stringify(call.where ?? '')
      expect(whereStr).not.toContain('instructor.name')
    })
  })

  describe('unpublished courses excluded', () => {
    it('always adds status=published filter', async () => {
      await service.search({})
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const whereStr = JSON.stringify(call.where)
      expect(whereStr).toContain('status')
      expect(whereStr).toContain('published')
    })

    it('keeps status filter even when other filters are present', async () => {
      await service.search({ q: 'react', difficulty: 'advanced' })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const whereStr = JSON.stringify(call.where)
      expect(whereStr).toContain('published')
    })
  })

  // ─── Pagination math ────────────────────────────────────────────────────────

  describe('pagination math', () => {
    it('returns totalPages = ceil(total / pageSize) — exact division', async () => {
      mockPayload = makeMockPayload({ docs: [], totalDocs: 30, totalPages: 3, page: 1 })
      service = new CourseSearchService(mockPayload)
      const result = await service.search({ pageSize: 10 })
      expect(result.totalPages).toBe(3)
    })

    it('returns totalPages = ceil(total / pageSize) — remainder rounds up', async () => {
      mockPayload = makeMockPayload({ docs: [], totalDocs: 25, totalPages: 3, page: 1 })
      service = new CourseSearchService(mockPayload)
      const result = await service.search({ pageSize: 10 })
      expect(result.totalPages).toBe(3)
    })

    it('returns totalPages = 0 when total is 0', async () => {
      mockPayload = makeMockPayload({ docs: [], totalDocs: 0, totalPages: 0, page: 1 })
      service = new CourseSearchService(mockPayload)
      const result = await service.search({})
      expect(result.totalPages).toBe(0)
    })

    it('returns correct page and pageSize in result', async () => {
      mockPayload = makeMockPayload({ docs: [publishedCourse], totalDocs: 7, totalPages: 1, page: 2 })
      service = new CourseSearchService(mockPayload)
      const result = await service.search({ page: 2, pageSize: 5 })
      expect(result.page).toBe(2)
      expect(result.pageSize).toBe(5)
      expect(result.total).toBe(7)
      expect(result.items).toHaveLength(1)
    })
  })

  // ─── Cache ───────────────────────────────────────────────────────────────────

  describe('cache — 5 minute TTL', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    it('returns cached result for identical query within TTL', async () => {
      mockPayload = makeMockPayload({ docs: [publishedCourse], totalDocs: 1, totalPages: 1, page: 1 })
      service = new CourseSearchService(mockPayload)

      // First call
      await service.search({ q: 'typescript', page: 1, pageSize: 10 })
      // Second call — should be cached
      const result = await service.search({ q: 'typescript', page: 1, pageSize: 10 })

      expect(mockPayload.find).toHaveBeenCalledTimes(1)
      expect(result.items).toHaveLength(1)
    })

    it('cache miss after TTL expiry', async () => {
      mockPayload = makeMockPayload({ docs: [publishedCourse], totalDocs: 1, totalPages: 1, page: 1 })
      service = new CourseSearchService(mockPayload)

      await service.search({ q: 'typescript' })

      // Advance clock past 5 minutes
      vi.advanceTimersByTime(5 * 60 * 1000 + 1)

      await service.search({ q: 'typescript' })

      expect(mockPayload.find).toHaveBeenCalledTimes(2)
    })

    it('different query does not hit cache', async () => {
      mockPayload = makeMockPayload({ docs: [], totalDocs: 0, totalPages: 0, page: 1 })
      service = new CourseSearchService(mockPayload)

      await service.search({ q: 'typescript' })
      await service.search({ q: 'react' })

      expect(mockPayload.find).toHaveBeenCalledTimes(2)
    })

    it('cache key is normalized (case-insensitive)', async () => {
      mockPayload = makeMockPayload({ docs: [publishedCourse], totalDocs: 1, totalPages: 1, page: 1 })
      service = new CourseSearchService(mockPayload)

      await service.search({ q: 'TYPESCRIPT' })
      await service.search({ q: 'typescript' })

      // Should only call payload once because cache key normalizes case
      expect(mockPayload.find).toHaveBeenCalledTimes(1)
    })
  })
})
