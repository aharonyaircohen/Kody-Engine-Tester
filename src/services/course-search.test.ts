import { describe, it, expect, beforeEach } from 'vitest'
import { CourseSearchService, type CoursesStore, type CourseDocument } from './course-search'

const makeCourse = (overrides: Partial<CourseDocument> = {}): CourseDocument => ({
  id: 'course-1',
  title: 'Introduction to JavaScript',
  slug: 'intro-to-javascript',
  description: {
    root: {
      children: [{ text: 'Learn JavaScript basics' }],
    },
  },
  instructor: { id: 'instructor-1' },
  status: 'published',
  difficulty: 'beginner',
  estimatedHours: 10,
  tags: [],
  ...overrides,
})

class MockCoursesStore implements CoursesStore {
  private courses: CourseDocument[] = []

  getAll() {
    return this.courses
  }

  add(...courses: CourseDocument[]) {
    this.courses.push(...courses)
  }
}

describe('CourseSearchService', () => {
  let store: MockCoursesStore
  let service: CourseSearchService

  beforeEach(() => {
    store = new MockCoursesStore()
    service = new CourseSearchService(store)
  })

  describe('search', () => {
    it('should return empty results for empty query', async () => {
      store.add(makeCourse())

      const result = await service.search('')

      expect(result).toEqual({ results: [], total: 0 })
    })

    it('should return empty results for whitespace-only query', async () => {
      store.add(makeCourse())

      const result = await service.search('   ')

      expect(result).toEqual({ results: [], total: 0 })
    })

    it('should return matching courses for valid query', async () => {
      store.add(
        makeCourse({ title: 'JavaScript Advanced', id: 'course-1' }),
        makeCourse({ title: 'Python Basics', id: 'course-2' }),
      )

      const result = await service.search('Advanced')

      expect(result.total).toBe(1)
      expect(result.results[0].id).toBe('course-1')
      expect(result.results[0].title).toBe('JavaScript Advanced')
    })

    it('should be case-insensitive', async () => {
      store.add(makeCourse({ title: 'React Fundamentals', id: 'course-1' }))

      const result = await service.search('REACT')

      expect(result.total).toBe(1)
      expect(result.results[0].id).toBe('course-1')
    })

    it('should search in description', async () => {
      store.add(
        makeCourse({
          id: 'course-1',
          title: 'Web Development',
          description: {
            root: {
              children: [{ text: 'Learn about backend development' }],
            },
          },
        }),
      )

      const result = await service.search('backend')

      expect(result.total).toBe(1)
      expect(result.results[0].id).toBe('course-1')
    })
  })
})
