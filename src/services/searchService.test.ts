import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SearchService } from './searchService'
import type { Payload } from 'payload'

function createMockPayload(findResults: Record<string, unknown> = {}) {
  return {
    find: vi.fn().mockImplementation(async (config: { collection: string }) => {
      const result = findResults[config.collection] ?? { docs: [], totalDocs: 0, totalPages: 0, page: 1 }
      return result
    }),
  } as unknown as Payload
}

const sampleCourse = {
  id: 'course-1',
  title: 'Intro to TypeScript',
  description: 'Learn TS from scratch',
  status: 'published',
}
const sampleLesson = {
  id: 'lesson-1',
  title: 'Variables and Types',
  description: 'Understanding TS variables',
  status: 'published',
}
const sampleNote = {
  id: 'note-1',
  title: 'TypeScript Notes',
  content: 'Notes about types',
  status: 'published',
}

describe('SearchService', () => {
  let service: SearchService
  let mockPayload: ReturnType<typeof createMockPayload>

  beforeEach(() => {
    mockPayload = createMockPayload({
      courses: { docs: [sampleCourse], totalDocs: 1, totalPages: 1, page: 1 },
      lessons: { docs: [sampleLesson], totalDocs: 1, totalPages: 1, page: 1 },
      notes: { docs: [sampleNote], totalDocs: 1, totalPages: 1, page: 1 },
    })
    service = new SearchService(mockPayload as unknown as Payload)
  })

  describe('search — empty results', () => {
    it('returns empty data and zero meta when no results exist', async () => {
      const emptyPayload = createMockPayload()
      const emptyService = new SearchService(emptyPayload as unknown as Payload)

      const result = await emptyService.search('')
      expect(result.data).toEqual([])
      expect(result.meta.total).toBe(0)
      expect(result.meta.page).toBe(1)
      expect(result.meta.totalPages).toBe(0)
    })

    it('calls payload.find for each requested collection', async () => {
      await service.search('', { collections: ['courses', 'lessons'] })
      expect(mockPayload.find).toHaveBeenCalledTimes(2)
    })
  })

  describe('search — search matching', () => {
    it('applies text query to title and description fields', async () => {
      await service.search('typescript')
      const calls = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls

      for (const call of calls) {
        const whereStr = JSON.stringify(call[0].where)
        expect(whereStr).toContain('typescript')
      }
    })

    it('does not add search condition when query is empty', async () => {
      await service.search('')
      const calls = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls

      for (const call of calls) {
        const whereStr = JSON.stringify(call[0].where ?? {})
        expect(whereStr).not.toContain('title')
        expect(whereStr).not.toContain('description')
      }
    })
  })

  describe('search — filter combinations', () => {
    it('filters by status when provided', async () => {
      await service.search('', { status: 'published' })
      const calls = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls

      for (const call of calls) {
        expect(JSON.stringify(call[0].where)).toContain('published')
      }
    })

    it('does not add status condition when status is not provided', async () => {
      await service.search('')
      const calls = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls

      for (const call of calls) {
        const whereStr = JSON.stringify(call[0].where ?? {})
        expect(whereStr).not.toContain('status')
      }
    })

    it('searches only specified collections', async () => {
      await service.search('', { collections: ['notes'] })
      expect(mockPayload.find).toHaveBeenCalledTimes(1)
      expect((mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0].collection).toBe('notes')
    })
  })

  describe('search — pagination', () => {
    it('passes page and limit to payload.find', async () => {
      await service.search('', {}, { page: 2, limit: 5 })
      const calls = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls

      for (const call of calls) {
        expect(call[0].page).toBe(2)
        expect(call[0].limit).toBe(5)
      }
    })

    it('defaults to page 1 and limit 10', async () => {
      await service.search('')
      const calls = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls

      for (const call of calls) {
        expect(call[0].page).toBe(1)
        expect(call[0].limit).toBe(10)
      }
    })
  })

  describe('search — result merging', () => {
    it('merges results from multiple collections', async () => {
      const result = await service.search('', { collections: ['courses', 'lessons'] })

      expect(result.data).toHaveLength(2)
      expect(result.meta.total).toBe(2)
    })

    it('returns correct meta for multi-collection search', async () => {
      const result = await service.search('', { collections: ['courses', 'lessons', 'notes'] })

      expect(result.meta.total).toBe(3)
      expect(result.meta.page).toBe(1)
    })
  })
})
