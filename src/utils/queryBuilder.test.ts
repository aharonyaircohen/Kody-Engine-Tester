import { describe, it, expect } from 'vitest'
import { queryBuilder } from './queryBuilder'

describe('queryBuilder', () => {
  it('builds a simple query string from key-value pairs', () => {
    const result = queryBuilder({ name: 'John', age: '30' })
    expect(result).toBe('name=John&age=30')
  })

  it('handles empty objects', () => {
    const result = queryBuilder({})
    expect(result).toBe('')
  })

  it('encodes special characters', () => {
    const result = queryBuilder({ name: 'John Doe', city: 'New York & Paris' })
    expect(result).toBe('name=John%20Doe&city=New%20York%20%26%20Paris')
  })

  it('handles arrays by repeating the key', () => {
    const result = queryBuilder({ tags: ['a', 'b', 'c'] })
    expect(result).toBe('tags=a&tags=b&tags=c')
  })

  it('handles numeric array values', () => {
    const result = queryBuilder({ ids: [1, 2, 3] })
    expect(result).toBe('ids=1&ids=2&ids=3')
  })

  it('skips null and undefined values', () => {
    const result = queryBuilder({ name: 'John', age: undefined, city: null })
    expect(result).toBe('name=John')
  })

  it('skips null and undefined array items', () => {
    const result = queryBuilder({ tags: ['a', null, undefined, 'b'] })
    expect(result).toBe('tags=a&tags=b')
  })

  it('stringifies nested objects', () => {
    const result = queryBuilder({ filter: { status: 'active', level: 1 } })
    expect(result).toBe('filter=%7B%22status%22%3A%22active%22%2C%22level%22%3A1%7D')
  })

  it('handles boolean values', () => {
    const result = queryBuilder({ active: true, deleted: false })
    expect(result).toBe('active=true&deleted=false')
  })

  it('handles numeric values', () => {
    const result = queryBuilder({ count: 42, price: 9.99 })
    expect(result).toBe('count=42&price=9.99')
  })

  it('handles empty arrays', () => {
    const result = queryBuilder({ tags: [] })
    expect(result).toBe('')
  })

  it('handles mixed types in params object', () => {
    const result = queryBuilder({
      name: 'John',
      tags: ['a', 'b'],
      active: true,
      count: 42,
    })
    expect(result).toBe('name=John&tags=a&tags=b&active=true&count=42')
  })
})
