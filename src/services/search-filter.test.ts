import { describe, it, expect } from 'vitest'
import { buildSearchFilter } from './search-filter'

describe('buildSearchFilter', () => {
  describe('basic search behavior', () => {
    it('returns an or condition with like operator for each field', () => {
      const result = buildSearchFilter('typescript', ['title', 'description'])
      const str = JSON.stringify(result)
      expect(str).toContain('"or"')
      expect(str).toContain('"title"')
      expect(str).toContain('"description"')
      expect(str).toContain('"like"')
      expect(str).toContain('typescript')
    })

    it('returns correct structure for single field', () => {
      const result = buildSearchFilter('react', ['title'])
      expect(result).toEqual({
        or: [{ title: { like: 'react' } }],
      })
    })

    it('returns correct structure for multiple fields', () => {
      const result = buildSearchFilter('js', ['title', 'description', 'summary'])
      expect(result).toEqual({
        or: [
          { title: { like: 'js' } },
          { description: { like: 'js' } },
          { summary: { like: 'js' } },
        ],
      })
    })
  })

  describe('edge cases', () => {
    it('returns empty object when query is empty', () => {
      const result = buildSearchFilter('', ['title', 'description'])
      expect(result).toEqual({})
    })

    it('returns empty object when query is only whitespace', () => {
      const result = buildSearchFilter('   ', ['title'])
      expect(result).toEqual({})
    })

    it('returns empty object when fields array is empty', () => {
      const result = buildSearchFilter('query', [])
      expect(result).toEqual({})
    })

    it('handles single character query', () => {
      const result = buildSearchFilter('a', ['title'])
      expect(result).toEqual({
        or: [{ title: { like: 'a' } }],
      })
    })

    it('handles special characters in query', () => {
      const result = buildSearchFilter('test@email.com', ['email'])
      expect(result).toEqual({
        or: [{ email: { like: 'test@email.com' } }],
      })
    })
  })
})