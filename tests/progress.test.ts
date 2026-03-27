import { describe, it, expect, vi, beforeEach } from 'vitest'

// Define mocks outside vi.mock so they can be referenced in tests after the mock is applied
const mockFindById = vi.fn()
const mockFind = vi.fn()
const mockUpdate = vi.fn()

vi.mock('payload', () => {
  return {
    getPayload: () => ({
      findById: mockFindById,
      find: mockFind,
      update: mockUpdate,
    }),
  }
})

// Import after mocking
import { ProgressService } from '../src/services/progress'

// Build a mock Payload instance from the mock functions
const mockPayload = {
  findByID: mockFindById,
  find: mockFind,
  update: mockUpdate,
} as unknown as import('payload').Payload

describe('ProgressService', () => {
  let service: ProgressService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ProgressService(mockPayload)
  })

  describe('getProgress', () => {
    it('returns zero progress when no lessons are complete', async () => {
      mockFindById.mockResolvedValue({
        id: 'enroll-1',
        student: 'user-1',
        course: 'course-1',
        completedLessons: [],
      })
      mockFind.mockResolvedValue({ totalDocs: 5 })

      const result = await service.getProgress('enroll-1')

      expect(result.completedLessons).toBe(0)
      expect(result.totalLessons).toBe(5)
      expect(result.percentage).toBe(0)
    })

    it('returns 50% when half the lessons are complete', async () => {
      mockFindById.mockResolvedValue({
        id: 'enroll-1',
        student: 'user-1',
        course: 'course-1',
        completedLessons: ['lesson-1', 'lesson-2', 'lesson-3'],
      })
      mockFind.mockResolvedValue({ totalDocs: 6 })

      const result = await service.getProgress('enroll-1')

      expect(result.completedLessons).toBe(3)
      expect(result.totalLessons).toBe(6)
      expect(result.percentage).toBe(50)
    })

    it('returns 100% when all lessons are complete', async () => {
      mockFindById.mockResolvedValue({
        id: 'enroll-1',
        student: 'user-1',
        course: 'course-1',
        completedLessons: ['lesson-1', 'lesson-2'],
      })
      mockFind.mockResolvedValue({ totalDocs: 2 })

      const result = await service.getProgress('enroll-1')

      expect(result.completedLessons).toBe(2)
      expect(result.totalLessons).toBe(2)
      expect(result.percentage).toBe(100)
    })

    it('returns 0% when course has no lessons', async () => {
      mockFindById.mockResolvedValue({
        id: 'enroll-1',
        student: 'user-1',
        course: 'course-1',
        completedLessons: [],
      })
      mockFind.mockResolvedValue({ totalDocs: 0 })

      const result = await service.getProgress('enroll-1')

      expect(result.completedLessons).toBe(0)
      expect(result.totalLessons).toBe(0)
      expect(result.percentage).toBe(0)
    })

    it('rounds percentage to nearest integer', async () => {
      mockFindById.mockResolvedValue({
        id: 'enroll-1',
        student: 'user-1',
        course: 'course-1',
        completedLessons: ['lesson-1'],
      })
      mockFind.mockResolvedValue({ totalDocs: 3 })

      const result = await service.getProgress('enroll-1')

      expect(result.percentage).toBe(33) // 1/3 = 33.33...%
    })
  })

  describe('isComplete', () => {
    it('returns false when not all lessons are complete', async () => {
      mockFindById.mockResolvedValue({
        id: 'enroll-1',
        student: 'user-1',
        course: 'course-1',
        status: 'active',
        completedLessons: ['lesson-1'],
      })
      mockFind.mockResolvedValue({ totalDocs: 3 })

      const result = await service.isComplete('enroll-1')

      expect(result).toBe(false)
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('returns true and transitions status to completed when all lessons are done', async () => {
      mockFindById.mockResolvedValue({
        id: 'enroll-1',
        student: 'user-1',
        course: 'course-1',
        status: 'active',
        completedLessons: ['lesson-1', 'lesson-2'],
      })
      mockFind.mockResolvedValue({ totalDocs: 2 })
      mockUpdate.mockResolvedValue({ id: 'enroll-1', status: 'completed' })

      const result = await service.isComplete('enroll-1')

      expect(result).toBe(true)
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'enrollments',
          id: 'enroll-1',
          data: expect.objectContaining({ status: 'completed', completedAt: expect.any(String) }),
        })
      )
    })

    it('does not re-update if already completed', async () => {
      mockFindById.mockResolvedValue({
        id: 'enroll-1',
        student: 'user-1',
        course: 'course-1',
        status: 'completed',
        completedLessons: ['lesson-1', 'lesson-2'],
      })
      mockFind.mockResolvedValue({ totalDocs: 2 })

      await service.isComplete('enroll-1')

      expect(mockUpdate).not.toHaveBeenCalled()
    })
  })

  describe('markLessonComplete', () => {
    it('adds a new lesson to completedLessons', async () => {
      mockFindById.mockResolvedValue({
        id: 'enroll-1',
        student: 'user-1',
        course: 'course-1',
        status: 'active',
        completedLessons: [],
      })
      mockFind.mockResolvedValue({ totalDocs: 3 })
      mockUpdate.mockResolvedValue({ id: 'enroll-1', status: 'active' })

      await service.markLessonComplete('enroll-1', 'lesson-1')

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'enrollments',
          id: 'enroll-1',
          data: { completedLessons: ['lesson-1'] },
        })
      )
    })

    it('is idempotent — does not duplicate a lesson already recorded', async () => {
      mockFindById.mockResolvedValue({
        id: 'enroll-1',
        student: 'user-1',
        course: 'course-1',
        status: 'active',
        completedLessons: ['lesson-1'],
      })
      mockFind.mockResolvedValue({ totalDocs: 3 })
      // update should not be called because lesson-1 is already completed

      await service.markLessonComplete('enroll-1', 'lesson-1')

      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('appends to existing completed lessons', async () => {
      mockFindById.mockResolvedValue({
        id: 'enroll-1',
        student: 'user-1',
        course: 'course-1',
        status: 'active',
        completedLessons: ['lesson-1'],
      })
      mockFind.mockResolvedValue({ totalDocs: 3 })
      mockUpdate.mockResolvedValue({ id: 'enroll-1', status: 'active' })

      await service.markLessonComplete('enroll-1', 'lesson-2')

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { completedLessons: ['lesson-1', 'lesson-2'] },
        })
      )
    })

    it('calls isComplete after marking a lesson', async () => {
      mockFindById.mockResolvedValue({
        id: 'enroll-1',
        student: 'user-1',
        course: 'course-1',
        status: 'active',
        completedLessons: [],
      })
      mockFind.mockResolvedValue({ totalDocs: 1 })
      mockUpdate.mockResolvedValue({ id: 'enroll-1', status: 'completed' })

      await service.markLessonComplete('enroll-1', 'lesson-1')

      // isComplete calls findById again to check if all lessons are done
      expect(mockFindById).toHaveBeenCalledTimes(2)
      expect(mockUpdate).toHaveBeenCalled()
    })
  })
})
