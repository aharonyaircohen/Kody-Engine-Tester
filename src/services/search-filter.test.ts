import { describe, it, expect } from 'vitest'
import { buildSearchFilter } from './search-filter'

describe('buildSearchFilter', () => {
  describe('empty query', () => {
    it('returns empty object when query is empty string', () => {
      const result = buildSearchFilter('', ['title', 'description'])
      expect(result).toEqual({})
    })

    it('returns empty object when query is only whitespace', () => {
      const result = buildSearchFilter('   ', ['title'])
      expect(result).toEqual({})
    })
  })

  describe('empty fields', () => {
    it('returns empty object when fields array is empty', () => {
      const result = buildSearchFilter('typescript', [])
      expect(result).toEqual({})
    })
  })

  describe('single field', () => {
    it('builds where clause for single field', () => {
      const result = buildSearchFilter('typescript', ['title'])
      expect(result).toEqual({
        or: [{ title: { like: 'typescript' } }],
      })
    })
  })

  describe('multiple fields', () => {
    it('builds where clause for two fields', () => {
      const result = buildSearchFilter('typescript', ['title', 'description'])
      expect(result).toEqual({
        or: [
          { title: { like: 'typescript' } },
          { description: { like: 'typescript' } },
        ],
      })
    })

    it('builds where clause for three or more fields', () => {
      const result = buildSearchFilter('react', ['title', 'description', 'content'])
      expect(result).toEqual({
        or: [
          { title: { like: 'react' } },
          { description: { like: 'react' } },
          { content: { like: 'react' } },
        ],
      })
    })
  })

  describe('payload compatibility', () => {
    it('produces JSON-serializable output', () => {
      const result = buildSearchFilter('query', ['field1', 'field2'])
      const serialized = JSON.stringify(result)
      expect(() => JSON.parse(serialized)).not.toThrow()
    })

    it('each or condition uses like operator', () => {
      const result = buildSearchFilter('test', ['a', 'b', 'c']) as { or: Array<Record<string, { like: string }>> }
      const orConditions = result.or ?? []
      for (const condition of orConditions) {
        const key = Object.keys(condition)[0]
        expect(condition[key]).toHaveProperty('like')
      }
    })
  })
})
