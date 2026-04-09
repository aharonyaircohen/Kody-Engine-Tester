import { describe, it, expect } from 'vitest'
import { queryBuilder } from './queryBuilder'

describe('queryBuilder', () => {
  it('builds simple key-value pairs with quotes', () => {
    expect(queryBuilder({ name: 'John' })).toBe('name="John"')
  })

  it('handles empty objects', () => {
    expect(queryBuilder({})).toBe('')
  })

  it('handles special character encoding with quotes', () => {
    expect(queryBuilder({ msg: 'hello world' })).toBe('msg="hello%20world"')
    expect(queryBuilder({ msg: 'a&b' })).toBe('msg="a%26b"')
  })

  it('handles array key repetition with quotes', () => {
    expect(queryBuilder({ tags: ['a', 'b', 'c'] })).toBe('tags="a"&tags="b"&tags="c"')
  })

  it('handles numeric array values with quotes', () => {
    expect(queryBuilder({ ids: [1, 2, 3] })).toBe('ids="1"&ids="2"&ids="3"')
  })

  it('skips null and undefined at top level', () => {
    expect(queryBuilder({ a: null, b: 'value' })).toBe('b="value"')
    expect(queryBuilder({ a: undefined, b: 'value' })).toBe('b="value"')
  })

  it('skips null and undefined in arrays', () => {
    expect(queryBuilder({ items: ['a', null, 'c'] })).toBe('items="a"&items="c"')
    expect(queryBuilder({ items: ['a', undefined, 'c'] })).toBe('items="a"&items="c"')
  })

  it('handles nested objects with JSON stringification', () => {
    expect(queryBuilder({ filter: { type: 'active' } })).toBe('filter="%7B%22type%22%3A%22active%22%7D"')
  })

  it('handles boolean values with quotes', () => {
    expect(queryBuilder({ active: true })).toBe('active="true"')
    expect(queryBuilder({ active: false })).toBe('active="false"')
  })

  it('handles numeric values with quotes', () => {
    expect(queryBuilder({ count: 42 })).toBe('count="42"')
    expect(queryBuilder({ price: 3.14 })).toBe('price="3.14"')
  })

  it('handles empty arrays', () => {
    expect(queryBuilder({ items: [] })).toBe('')
  })

  it('handles dollar signs', () => {
    expect(queryBuilder({ price: '$100' })).toBe('price="%24100"')
  })

  it('handles mixed types', () => {
    expect(queryBuilder({ name: 'John', age: 30, active: true })).toBe(
      'name="John"&age="30"&active="true"'
    )
  })

  it('handles single quotes in values', () => {
    expect(queryBuilder({ msg: "it's cool" })).toBe("msg=\"it's%20cool\"")
  })

  it('handles double quotes in values', () => {
    expect(queryBuilder({ msg: 'say "hello"' })).toBe('msg="say%20%22hello%22"')
  })
})
