export interface CourseDocument {
  id: string
  title: string
  slug: string
  description: unknown
  instructor: { id: string } | string
  status: string
  difficulty: string | null
  estimatedHours: number | null
  tags: Array<{ label: string }>
}

export interface CourseSearchResult {
  id: string
  title: string
  slug: string
  description: unknown
  instructor: { id: string } | string
  status: string
  difficulty: string | null
  estimatedHours: number | null
}

export interface SearchResults {
  results: CourseSearchResult[]
  total: number
}

export interface CoursesStore {
  getAll(): CourseDocument[]
}

export class CourseSearchService {
  constructor(private store: CoursesStore) {}

  async search(query: string): Promise<SearchResults> {
    const trimmed = query.trim()

    if (trimmed === '') {
      return { results: [], total: 0 }
    }

    const all = this.store.getAll()
    const lowerQuery = trimmed.toLowerCase()

    const results = all.filter((course) => {
      const titleMatch = course.title?.toLowerCase().includes(lowerQuery)
      const descMatch =
        typeof course.description === 'object' &&
        course.description !== null &&
        'root' in course.description &&
        JSON.stringify(course.description)
          .toLowerCase()
          .includes(lowerQuery)
      return titleMatch || descMatch
    })

    return {
      results: results.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        description: c.description,
        instructor: c.instructor,
        status: c.status,
        difficulty: c.difficulty,
        estimatedHours: c.estimatedHours,
      })),
      total: results.length,
    }
  }
}
