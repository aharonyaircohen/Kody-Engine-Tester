import { describe, it, expect } from 'vitest'
import { objectDiff } from './objectDiff'

describe('objectDiff', () => {
  it('should return no changes for identical objects', () => {
    const result = objectDiff({ a: 1, b: 2 }, { a: 1, b: 2 })
    expect(result.hasChanges).toBe(false)
    expect(result.added).toEqual([])
    expect(result.removed).toEqual([])
    expect(result.changed).toEqual([])
  })

  it('should detect added keys', () => {
    const result = objectDiff({ a: 1 }, { a: 1, b: 2 })
    expect(result.hasChanges).toBe(true)
    expect(result.added).toEqual(['b'])
    expect(result.removed).toEqual([])
    expect(result.changed).toEqual([])
  })

  it('should detect removed keys', () => {
    const result = objectDiff({ a: 1, b: 2 }, { a: 1 })
    expect(result.hasChanges).toBe(true)
    expect(result.added).toEqual([])
    expect(result.removed).toEqual(['b'])
    expect(result.changed).toEqual([])
  })

  it('should detect changed values', () => {
    const result = objectDiff({ a: 1, b: 2 }, { a: 1, b: 3 })
    expect(result.hasChanges).toBe(true)
    expect(result.added).toEqual([])
    expect(result.removed).toEqual([])
    expect(result.changed).toEqual([{ key: 'b', oldValue: 2, newValue: 3 }])
  })

  it('should handle multiple changes', () => {
    const result = objectDiff({ a: 1, b: 2, c: 3 }, { a: 1, b: 5, d: 4 })
    expect(result.hasChanges).toBe(true)
    expect(result.added).toEqual(['d'])
    expect(result.removed).toEqual(['c'])
    expect(result.changed).toEqual([{ key: 'b', oldValue: 2, newValue: 5 }])
  })

  it('should handle empty objects', () => {
    expect(objectDiff({}, {}).hasChanges).toBe(false)
    expect(objectDiff({}, { a: 1 })).toEqual({
      added: ['a'],
      removed: [],
      changed: [],
      hasChanges: true,
    })
    expect(objectDiff({ a: 1 }, {})).toEqual({
      added: [],
      removed: ['a'],
      changed: [],
      hasChanges: true,
    })
  })

  it('should detect nested object changes by reference', () => {
    const obj = { x: { y: 1 } }
    const result = objectDiff(obj, obj)
    expect(result.hasChanges).toBe(false)
  })

  it('should treat different object references as changed', () => {
    const result = objectDiff({ x: { y: 1 } }, { x: { y: 2 } })
    expect(result.hasChanges).toBe(true)
    expect(result.changed).toEqual([{ key: 'x', oldValue: { y: 1 }, newValue: { y: 2 } }])
  })

  it('should handle mixed add/remove/change', () => {
    const before = { a: 1, b: 2 }
    const after = { b: 3, c: 4 }
    const result = objectDiff(before, after)
    expect(result.added).toEqual(['c'])
    expect(result.removed).toEqual(['a'])
    expect(result.changed).toEqual([{ key: 'b', oldValue: 2, newValue: 3 }])
  })
})