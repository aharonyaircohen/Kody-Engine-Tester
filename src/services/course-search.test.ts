import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CourseSearchService } from './course-search'
import type { Payload } from 'payload'

function createMockPayload(findResult: unknown = { docs: [], totalDocs: 0, totalPages: 0, page: 1 }) {
  return {
    find: vi.fn().mockResolvedValue(findResult),
  } as unknown as Payload
}

const sampleCourse = {
  id: '1',
  title: 'Intro to TypeScript',
  description: 'Learn TS from scratch',
  status: 'published',
  difficulty: 'beginner',
  tags: [{ label: 'typescript' }, { label: 'programming' }],
  instructor: 'inst-1',
}

describe('CourseSearchService', () => {
  let service: CourseSearchService
  let mockPayload: ReturnType<typeof createMockPayload>

  beforeEach(() => {
    mockPayload = createMockPayload()
    service = new CourseSearchService(mockPayload as unknown as Payload)
  })

  describe('searchCourses — empty results', () => {
    it('returns empty data and zero meta when no courses exist', async () => {
      const result = await service.searchCourses('')
      expect(result.data).toEqual([])
      expect(result.meta.total).toBe(0)
      expect(result.meta.page).toBe(1)
      expect(result.meta.totalPages).toBe(0)
    })

    it('calls payload.find with collection courses', async () => {
      await service.searchCourses('')
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({ collection: 'courses' }),
      )
    })
  })

  describe('searchCourses — search matching', () => {
    it('includes title and description in the search when q is provided', async () => {
      await service.searchCourses('typescript')
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const whereStr = JSON.stringify(call.where)
      expect(whereStr).toContain('typescript')
      expect(whereStr).toContain('title')
      expect(whereStr).toContain('description')
    })

    it('does not add search condition when query is empty', async () => {
      await service.searchCourses('')
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const whereStr = JSON.stringify(call.where) ?? ''
      expect(whereStr).not.toContain('title')
      expect(whereStr).not.toContain('description')
    })

    it('returns matching courses', async () => {
      mockPayload = createMockPayload({ docs: [sampleCourse], totalDocs: 1, totalPages: 1, page: 1 })
      service = new CourseSearchService(mockPayload as unknown as Payload)

      const result = await service.searchCourses('TypeScript')
      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(1)
    })
  })

  describe('searchCourses — filter combinations', () => {
    it('filters by status when provided', async () => {
      await service.searchCourses('', { status: 'published' })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(JSON.stringify(call.where)).toContain('published')
    })

    it('does not add status condition when status is not provided', async () => {
      await service.searchCourses('')
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const whereStr = JSON.stringify(call.where) ?? ''
      expect(whereStr).not.toContain('status')
    })

    it('filters by difficulty level', async () => {
      await service.searchCourses('', { difficulty: 'beginner' })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const whereStr = JSON.stringify(call.where)
      expect(whereStr).toContain('difficulty')
      expect(whereStr).toContain('beginner')
    })

    it('filters by instructor id', async () => {
      await service.searchCourses('', { instructor: 'inst-42' })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const whereStr = JSON.stringify(call.where)
      expect(whereStr).toContain('instructor')
      expect(whereStr).toContain('inst-42')
    })

    it('filters by tags in OR mode (default)', async () => {
      await service.searchCourses('', { tags: ['typescript', 'react'] })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const whereStr = JSON.stringify(call.where)
      expect(whereStr).toContain('typescript')
      expect(whereStr).toContain('react')
    })

    it('filters by tags in AND mode (separate conditions per tag)', async () => {
      await service.searchCourses('', { tags: ['typescript', 'react'], tagMode: 'and' })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const andConditions = call.where?.and ?? []
      // Each tag becomes its own AND condition in AND mode
      const tagConditions = andConditions.filter((c: unknown) =>
        JSON.stringify(c).includes('tags.label'),
      )
      expect(tagConditions.length).toBe(2)
    })

    it('does not add tag condition when tags array is empty', async () => {
      await service.searchCourses('', { tags: [] })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(JSON.stringify(call.where) ?? '').not.toContain('tags')
    })

    it('combines multiple filters', async () => {
      await service.searchCourses('react', { difficulty: 'intermediate', status: 'published' })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const whereStr = JSON.stringify(call.where)
      expect(whereStr).toContain('react')
      expect(whereStr).toContain('intermediate')
      expect(whereStr).toContain('published')
    })
  })

  describe('searchCourses — sort ordering', () => {
    it('sorts by -createdAt when sort is newest', async () => {
      await service.searchCourses('', {}, 'newest')
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.sort).toBe('-createdAt')
    })

    it('does not set sort for relevance', async () => {
      await service.searchCourses('', {}, 'relevance')
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.sort).toBeUndefined()
    })

    it('does not set sort for popularity', async () => {
      await service.searchCourses('', {}, 'popularity')
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.sort).toBeUndefined()
    })

    it('does not set sort for rating', async () => {
      await service.searchCourses('', {}, 'rating')
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.sort).toBeUndefined()
    })

    it('defaults to no sort when sort is not specified', async () => {
      await service.searchCourses('')
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.sort).toBeUndefined()
    })
  })

  describe('searchCourses — pagination', () => {
    it('passes page and limit to payload.find', async () => {
      await service.searchCourses('', {}, 'relevance', { page: 2, limit: 5 })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.page).toBe(2)
      expect(call.limit).toBe(5)
    })

    it('defaults to page 1 and limit 10', async () => {
      await service.searchCourses('')
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.page).toBe(1)
      expect(call.limit).toBe(10)
    })

    it('returns correct meta for multi-page results', async () => {
      mockPayload = createMockPayload({ docs: [sampleCourse], totalDocs: 25, totalPages: 3, page: 2 })
      service = new CourseSearchService(mockPayload as unknown as Payload)

      const result = await service.searchCourses('', {}, 'relevance', { page: 2, limit: 10 })
      expect(result.meta).toEqual({ total: 25, page: 2, limit: 10, totalPages: 3 })
    })

    it('returns meta.page from payload response when available', async () => {
      mockPayload = createMockPayload({ docs: [], totalDocs: 0, totalPages: 0, page: 3 })
      service = new CourseSearchService(mockPayload as unknown as Payload)

      const result = await service.searchCourses('', {}, 'relevance', { page: 3, limit: 10 })
      expect(result.meta.page).toBe(3)
    })

    it('falls back to requested page when payload response has no page', async () => {
      mockPayload = createMockPayload({ docs: [], totalDocs: 0, totalPages: 0 })
      service = new CourseSearchService(mockPayload as unknown as Payload)

      const result = await service.searchCourses('', {}, 'relevance', { page: 4, limit: 10 })
      expect(result.meta.page).toBe(4)
    })

    it('handles first page edge case', async () => {
      await service.searchCourses('', {}, 'relevance', { page: 1, limit: 10 })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.page).toBe(1)
    })

    it('handles large limit values', async () => {
      await service.searchCourses('', {}, 'relevance', { page: 1, limit: 100 })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.limit).toBe(100)
    })
  })
})
