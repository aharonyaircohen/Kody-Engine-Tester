import { describe, it, expect } from 'vitest'
import { buildSearchFilter } from './search-filter'

describe('buildSearchFilter', () => {
  it('returns empty object when query is empty', () => {
    const result = buildSearchFilter('', ['title', 'description'])
    expect(result).toEqual({})
  })

  it('returns empty object when fields is empty', () => {
    const result = buildSearchFilter('test', [])
    expect(result).toEqual({})
  })

  it('returns empty object when both query and fields are empty', () => {
    const result = buildSearchFilter('', [])
    expect(result).toEqual({})
  })

  it('builds correct filter for single field', () => {
    const result = buildSearchFilter('test', ['title'])
    expect(result).toEqual({
      or: [{ title: { like: 'test' } }],
    })
  })

  it('builds correct filter for multiple fields', () => {
    const result = buildSearchFilter('intro', ['title', 'description'])
    expect(result).toEqual({
      or: [
        { title: { like: 'intro' } },
        { description: { like: 'intro' } },
      ],
    })
  })

  it('handles query with whitespace', () => {
    const result = buildSearchFilter('  test query  ', ['title'])
    expect(result).toEqual({
      or: [{ title: { like: '  test query  ' } }],
    })
  })

  it('handles multiple fields correctly', () => {
    const result = buildSearchFilter('advanced', ['title', 'description', 'content'])
    expect(result).toEqual({
      or: [
        { title: { like: 'advanced' } },
        { description: { like: 'advanced' } },
        { content: { like: 'advanced' } },
      ],
    })
  })
})