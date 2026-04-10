import { describe, it, expect } from 'vitest'
import { buildSearchFilter } from './search-filter'

describe('buildSearchFilter', () => {
  describe('basic functionality', () => {
    it('returns an or clause with like conditions for each field', () => {
      const result = buildSearchFilter('typescript', ['title', 'description'])
      expect(result).toEqual({
        or: [{ title: { like: 'typescript' } }, { description: { like: 'typescript' } }],
      })
    })

    it('returns a single-field or clause when only one field is provided', () => {
      const result = buildSearchFilter('react', ['title'])
      expect(result).toEqual({
        or: [{ title: { like: 'react' } }],
      })
    })

    it('handles multiple fields correctly', () => {
      const result = buildSearchFilter('query', ['field1', 'field2', 'field3'])
      expect(result).toHaveProperty('or')
      expect((result as { or: unknown[] }).or).toHaveLength(3)
    })
  })

  describe('edge cases', () => {
    it('returns undefined when query is empty string', () => {
      const result = buildSearchFilter('', ['title', 'description'])
      expect(result).toBeUndefined()
    })

    it('returns undefined when fields array is empty', () => {
      const result = buildSearchFilter('query', [])
      expect(result).toBeUndefined()
    })

    it('returns undefined when query is whitespace only', () => {
      const result = buildSearchFilter('   ', ['title'])
      expect(result).toBeUndefined()
    })

    it('filters out empty field names and returns valid result', () => {
      const result = buildSearchFilter('query', ['title', '', 'description'])
      expect(result).toEqual({
        or: [
          { title: { like: 'query' } },
          { description: { like: 'query' } },
        ],
      })
    })
  })

  describe('special characters', () => {
    it('handles query with spaces', () => {
      const result = buildSearchFilter('hello world', ['title'])
      expect(result).toEqual({
        or: [{ title: { like: 'hello world' } }],
      })
    })

    it('handles query with special regex characters', () => {
      const result = buildSearchFilter('test (query)', ['title'])
      expect(result).toEqual({
        or: [{ title: { like: 'test (query)' } }],
      })
    })

    it('handles field names with dots (nested fields)', () => {
      const result = buildSearchFilter('query', ['tags.label', 'author.name'])
      expect(result).toEqual({
        or: [
          { 'tags.label': { like: 'query' } },
          { 'author.name': { like: 'query' } },
        ],
      })
    })
  })

  describe('structure validation', () => {
    it('result has or property at top level', () => {
      const result = buildSearchFilter('test', ['field1', 'field2'])
      expect(result).toHaveProperty('or')
    })

    it('each or condition has correct shape', () => {
      const result = buildSearchFilter('test', ['title', 'description']) as { or: unknown[] }
      const conditions = result.or
      conditions.forEach((condition) => {
        const keys = Object.keys(condition as object)
        expect(keys).toHaveLength(1)
      })
    })

    it('each like condition contains correct field and query', () => {
      const result = buildSearchFilter('findme', ['title', 'body']) as { or: { [key: string]: { like: string } }[] }
      result.or.forEach((condition) => {
        const fieldValue = Object.values(condition)[0] as { like: string }
        expect(fieldValue.like).toBe('findme')
      })
    })
  })
})