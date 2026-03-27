import { describe, it, expect } from 'vitest'
import { diff } from './diff'

describe('diff', () => {
  // Primitives
  it('should return empty array for identical primitives', () => {
    expect(diff(1, 1)).toEqual([])
    expect(diff('hello', 'hello')).toEqual([])
    expect(diff(true, true)).toEqual([])
    expect(diff(null, null)).toEqual([])
  })

  it('should detect changed primitive at root', () => {
    expect(diff(1, 2)).toEqual([{ path: [], type: 'changed', oldValue: 1, newValue: 2 }])
    expect(diff('a', 'b')).toEqual([{ path: [], type: 'changed', oldValue: 'a', newValue: 'b' }])
    expect(diff(true, false)).toEqual([{ path: [], type: 'changed', oldValue: true, newValue: false }])
  })

  it('should detect type change', () => {
    expect(diff(1, '1')).toEqual([{ path: [], type: 'changed', oldValue: 1, newValue: '1' }])
    expect(diff(null, 0)).toEqual([{ path: [], type: 'changed', oldValue: null, newValue: 0 }])
  })

  // Flat objects
  it('should return empty array for equal flat objects', () => {
    expect(diff({ a: 1, b: 2 }, { a: 1, b: 2 })).toEqual([])
  })

  it('should detect changed value in flat object', () => {
    expect(diff({ a: 1 }, { a: 2 })).toEqual([
      { path: ['a'], type: 'changed', oldValue: 1, newValue: 2 },
    ])
  })

  it('should detect added key in flat object', () => {
    expect(diff({ a: 1 }, { a: 1, b: 2 })).toEqual([
      { path: ['b'], type: 'added', newValue: 2 },
    ])
  })

  it('should detect removed key in flat object', () => {
    expect(diff({ a: 1, b: 2 }, { a: 1 })).toEqual([
      { path: ['b'], type: 'removed', oldValue: 2 },
    ])
  })

  // Nested objects
  it('should detect changes in nested objects', () => {
    const a = { user: { name: 'Alice', age: 30 } }
    const b = { user: { name: 'Alice', age: 31 } }
    expect(diff(a, b)).toEqual([
      { path: ['user', 'age'], type: 'changed', oldValue: 30, newValue: 31 },
    ])
  })

  it('should detect added nested key', () => {
    const a = { user: { name: 'Alice' } }
    const b = { user: { name: 'Alice', role: 'admin' } }
    expect(diff(a, b)).toEqual([
      { path: ['user', 'role'], type: 'added', newValue: 'admin' },
    ])
  })

  it('should detect removed nested key', () => {
    const a = { user: { name: 'Alice', role: 'admin' } }
    const b = { user: { name: 'Alice' } }
    expect(diff(a, b)).toEqual([
      { path: ['user', 'role'], type: 'removed', oldValue: 'admin' },
    ])
  })

  // Arrays
  it('should return empty array for equal arrays', () => {
    expect(diff([1, 2, 3], [1, 2, 3])).toEqual([])
  })

  it('should detect changed element in array', () => {
    expect(diff([1, 2, 3], [1, 9, 3])).toEqual([
      { path: ['1'], type: 'changed', oldValue: 2, newValue: 9 },
    ])
  })

  it('should detect added element in array', () => {
    expect(diff([1, 2], [1, 2, 3])).toEqual([
      { path: ['2'], type: 'added', newValue: 3 },
    ])
  })

  it('should detect removed element in array', () => {
    expect(diff([1, 2, 3], [1, 2])).toEqual([
      { path: ['2'], type: 'removed', oldValue: 3 },
    ])
  })

  // Arrays with objects
  it('should detect changes inside array objects', () => {
    const a = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
    const b = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bobby' }]
    expect(diff(a, b)).toEqual([
      { path: ['1', 'name'], type: 'changed', oldValue: 'Bob', newValue: 'Bobby' },
    ])
  })

  // Complex nested structures
  it('should handle complex nested structure with multiple changes', () => {
    const a = {
      title: 'My App',
      version: 1,
      settings: {
        theme: 'light',
        lang: 'en',
        features: ['auth', 'search'],
      },
      users: [
        { id: 1, active: true },
        { id: 2, active: false },
      ],
    }
    const b = {
      title: 'My App',
      version: 2,
      settings: {
        theme: 'dark',
        lang: 'en',
        features: ['auth', 'search', 'export'],
      },
      users: [
        { id: 1, active: true },
        { id: 2, active: true },
      ],
      owner: 'admin',
    }

    const changes = diff(a, b)
    expect(changes).toContainEqual({ path: ['version'], type: 'changed', oldValue: 1, newValue: 2 })
    expect(changes).toContainEqual({ path: ['settings', 'theme'], type: 'changed', oldValue: 'light', newValue: 'dark' })
    expect(changes).toContainEqual({ path: ['settings', 'features', '2'], type: 'added', newValue: 'export' })
    expect(changes).toContainEqual({ path: ['users', '1', 'active'], type: 'changed', oldValue: false, newValue: true })
    expect(changes).toContainEqual({ path: ['owner'], type: 'added', newValue: 'admin' })
    expect(changes).toHaveLength(5)
  })

  it('should handle deeply nested paths', () => {
    const a = { a: { b: { c: { d: 1 } } } }
    const b = { a: { b: { c: { d: 2 } } } }
    expect(diff(a, b)).toEqual([
      { path: ['a', 'b', 'c', 'd'], type: 'changed', oldValue: 1, newValue: 2 },
    ])
  })

  it('should detect change from object to primitive', () => {
    const a = { x: { nested: true } }
    const b = { x: 42 }
    expect(diff(a, b)).toEqual([
      { path: ['x'], type: 'changed', oldValue: { nested: true }, newValue: 42 },
    ])
  })

  it('should detect change from array to primitive', () => {
    const a = { x: [1, 2, 3] }
    const b = { x: 'list' }
    expect(diff(a, b)).toEqual([
      { path: ['x'], type: 'changed', oldValue: [1, 2, 3], newValue: 'list' },
    ])
  })

  it('should handle null values', () => {
    expect(diff({ a: null }, { a: null })).toEqual([])
    expect(diff({ a: 1 }, { a: null })).toEqual([
      { path: ['a'], type: 'changed', oldValue: 1, newValue: null },
    ])
    expect(diff({ a: null }, { a: 1 })).toEqual([
      { path: ['a'], type: 'changed', oldValue: null, newValue: 1 },
    ])
  })

  it('should handle empty objects', () => {
    expect(diff({}, {})).toEqual([])
    expect(diff({}, { a: 1 })).toEqual([{ path: ['a'], type: 'added', newValue: 1 }])
    expect(diff({ a: 1 }, {})).toEqual([{ path: ['a'], type: 'removed', oldValue: 1 }])
  })

  it('should handle empty arrays', () => {
    expect(diff([], [])).toEqual([])
    expect(diff([], [1])).toEqual([{ path: ['0'], type: 'added', newValue: 1 }])
    expect(diff([1], [])).toEqual([{ path: ['0'], type: 'removed', oldValue: 1 }])
  })

  it('should handle arrays nested in arrays', () => {
    const a = [[1, 2], [3, 4]]
    const b = [[1, 2], [3, 5]]
    expect(diff(a, b)).toEqual([
      { path: ['1', '1'], type: 'changed', oldValue: 4, newValue: 5 },
    ])
  })
})
