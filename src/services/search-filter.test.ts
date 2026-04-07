import { describe, it, expect } from 'vitest'
import { buildSearchFilter } from './search-filter'

describe('buildSearchFilter', () => {
  it('returns an object with or condition containing like clauses for each field', () => {
    const result = buildSearchFilter('typescript', ['title', 'description'])

    expect(result).toHaveProperty('or')
    const orCondition = (result as { or: unknown[] }).or
    expect(orCondition).toHaveLength(2)
  })

  it('creates like condition for each field in the fields array', () => {
    const result = buildSearchFilter('react', ['title', 'description', 'summary'])
    const orCondition = (result as { or: { [key: string]: { like: string } }[] }).or

    expect(orCondition[0]).toEqual({ title: { like: 'react' } })
    expect(orCondition[1]).toEqual({ description: { like: 'react' } })
    expect(orCondition[2]).toEqual({ summary: { like: 'react' } })
  })

  it('returns single field filter when only one field is provided', () => {
    const result = buildSearchFilter('intro', ['title'])
    const orCondition = (result as { or: unknown[] }).or

    expect(orCondition).toHaveLength(1)
    expect(orCondition[0]).toEqual({ title: { like: 'intro' } })
  })

  it('handles empty fields array by returning or with empty array', () => {
    const result = buildSearchFilter('test', [] as string[])
    const orCondition = (result as { or: unknown[] }).or

    expect(orCondition).toHaveLength(0)
  })

  it('uses the query value in all like conditions', () => {
    const query = 'fullstack'
    const fields = ['title', 'description', 'instructor']
    const result = buildSearchFilter(query, fields)
    const orCondition = (result as { or: { [key: string]: { like: string } }[] }).or

    orCondition.forEach((condition) => {
      const fieldValue = Object.values(condition)[0] as { like: string }
      expect(fieldValue.like).toBe(query)
    })
  })

  it('produces Payload-compatible Where structure', () => {
    const result = buildSearchFilter('typescript', ['title', 'description'])

    // Verify the structure matches what Payload expects
    expect(result).toHaveProperty('or')
    expect(Array.isArray((result as { or: unknown }).or)).toBe(true)
  })
})