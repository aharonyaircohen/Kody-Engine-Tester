import { describe, it, expect } from 'vitest'
import { buildSearchFilter } from './search-filter'

describe('buildSearchFilter', () => {
  describe('empty inputs', () => {
    it('returns empty object when query is empty', () => {
      const result = buildSearchFilter('', ['title', 'description'])
      expect(result).toEqual({})
    })

    it('returns empty object when fields is empty', () => {
      const result = buildSearchFilter('test', [])
      expect(result).toEqual({})
    })

    it('returns empty object when query and fields are both empty', () => {
      const result = buildSearchFilter('', [])
      expect(result).toEqual({})
    })
  })

  describe('single field', () => {
    it('builds correct where clause for single field', () => {
      const result = buildSearchFilter('typescript', ['title'])
      expect(result).toEqual({ or: [{ title: { like: 'typescript' } }] })
    })
  })

  describe('multiple fields', () => {
    it('builds correct where clause for two fields', () => {
      const result = buildSearchFilter('react', ['title', 'description'])
      expect(result).toEqual({
        or: [
          { title: { like: 'react' } },
          { description: { like: 'react' } },
        ],
      })
    })

    it('builds correct where clause for three or more fields', () => {
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

  describe('special characters in query', () => {
    it('handles query with spaces', () => {
      const result = buildSearchFilter('hello world', ['title'])
      expect(result).toEqual({ or: [{ title: { like: 'hello world' } }] })
    })

    it('handles query with numbers', () => {
      const result = buildSearchFilter('React 19', ['title', 'description'])
      expect(result).toEqual({
        or: [
          { title: { like: 'React 19' } },
          { description: { like: 'React 19' } },
        ],
      })
    })
  })
})
