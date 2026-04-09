import { describe, it, expect } from 'vitest'
import { buildSearchFilter } from './search-filter'

describe('buildSearchFilter', () => {
  it('returns empty object when query is empty', () => {
    const result = buildSearchFilter('', ['title', 'description'])
    expect(result).toEqual({})
  })

  it('returns empty object when fields array is empty', () => {
    const result = buildSearchFilter('typescript', [])
    expect(result).toEqual({})
  })

  it('returns empty object when query is whitespace-only', () => {
    const result = buildSearchFilter('   ', ['title'])
    expect(result).toEqual({})
  })

  it('builds or condition with single field', () => {
    const result = buildSearchFilter('typescript', ['title'])
    expect(result).toEqual({
      or: [{ title: { like: 'typescript' } }],
    })
  })

  it('builds or condition with multiple fields', () => {
    const result = buildSearchFilter('intro', ['title', 'description'])
    expect(result).toEqual({
      or: [
        { title: { like: 'intro' } },
        { description: { like: 'intro' } },
      ],
    })
  })

  it('builds or condition with many fields', () => {
    const fields = ['title', 'description', 'instructor', 'tags']
    const result = buildSearchFilter('react', fields)
    expect(result).toEqual({
      or: [
        { title: { like: 'react' } },
        { description: { like: 'react' } },
        { instructor: { like: 'react' } },
        { tags: { like: 'react' } },
      ],
    })
  })

  it('preserves query casing in like operator', () => {
    const result = buildSearchFilter('TypeScript', ['title'])
    expect(result).toEqual({
      or: [{ title: { like: 'TypeScript' } }],
    })
  })

  it('returns empty object for null query', () => {
    const result = buildSearchFilter(null as unknown as string, ['title'])
    expect(result).toEqual({})
  })

  it('returns empty object for undefined query', () => {
    const result = buildSearchFilter(undefined as unknown as string, ['title'])
    expect(result).toEqual({})
  })
})
