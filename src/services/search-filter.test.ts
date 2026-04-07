import { describe, it, expect } from 'vitest'
import { buildSearchFilter } from './search-filter'

describe('buildSearchFilter', () => {
  describe('basic search behavior', () => {
    it('creates an OR condition across all specified fields', () => {
      const result = buildSearchFilter('typescript', ['title', 'description'])
      expect(result).toEqual({
        or: [{ title: { like: 'typescript' } }, { description: { like: 'typescript' } }],
      })
    })

    it('handles single field search', () => {
      const result = buildSearchFilter('react', ['title'])
      expect(result).toEqual({
        or: [{ title: { like: 'react' } }],
      })
    })

    it('handles many fields', () => {
      const result = buildSearchFilter('query', ['title', 'description', 'summary', 'content'])
      expect(result!.or).toHaveLength(4)
      expect(JSON.stringify(result)).toContain('title')
      expect(JSON.stringify(result)).toContain('description')
      expect(JSON.stringify(result)).toContain('summary')
      expect(JSON.stringify(result)).toContain('content')
    })
  })

  describe('empty and whitespace handling', () => {
    it('returns undefined for empty query string', () => {
      expect(buildSearchFilter('', ['title', 'description'])).toBeUndefined()
    })

    it('returns undefined for whitespace-only query', () => {
      expect(buildSearchFilter('   ', ['title'])).toBeUndefined()
    })

    it('trims whitespace from query', () => {
      const result = buildSearchFilter('  typescript  ', ['title'])
      expect(result).toEqual({
        or: [{ title: { like: 'typescript' } }],
      })
    })
  })

  describe('edge cases', () => {
    it('returns undefined for empty fields array', () => {
      expect(buildSearchFilter('query', [])).toBeUndefined()
    })

    it('returns undefined when both query and fields are empty', () => {
      expect(buildSearchFilter('', [])).toBeUndefined()
    })

    it('handles special characters in query', () => {
      const result = buildSearchFilter('type*script?', ['title'])
      expect(result).toEqual({
        or: [{ title: { like: 'type*script?' } }],
      })
    })

    it('handles unicode characters', () => {
      const result = buildSearchFilter('日本語', ['title', 'description'])
      expect(result!.or).toHaveLength(2)
    })

    it('handles numeric string query', () => {
      const result = buildSearchFilter('12345', ['id', 'code'])
      expect(result).toEqual({
        or: [{ id: { like: '12345' } }, { code: { like: '12345' } }],
      })
    })
  })

  describe('output format compatibility', () => {
    it('produces a valid Payload Where clause structure', () => {
      const result = buildSearchFilter('test', ['title'])
      expect(result).toHaveProperty('or')
      expect(Array.isArray(result!.or)).toBe(true)
    })

    it('can be combined with other Payload conditions', () => {
      const searchFilter = buildSearchFilter('react', ['title', 'description'])
      const combined = {
        and: [searchFilter, { status: { equals: 'published' } }],
      }
      expect(JSON.stringify(combined)).toContain('react')
      expect(JSON.stringify(combined)).toContain('status')
      expect(JSON.stringify(combined)).toContain('published')
    })
  })
})
