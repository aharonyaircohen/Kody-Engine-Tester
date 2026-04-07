import { describe, it, expect } from 'vitest'
import { identity } from './identity'

describe('identity', () => {
  it('returns a number unchanged', () => {
    expect(identity(5)).toBe(5)
  })

  it('returns a string unchanged', () => {
    expect(identity('hello')).toBe('hello')
  })

  it('returns an object unchanged', () => {
    const obj = { a: 1 }
    expect(identity(obj)).toBe(obj)
  })

  it('returns an array unchanged', () => {
    const arr = [1, 2, 3]
    expect(identity(arr)).toBe(arr)
  })

  it('returns null unchanged', () => {
    expect(identity(null)).toBe(null)
  })

  it('returns undefined unchanged', () => {
    expect(identity(undefined)).toBe(undefined)
  })

  it('returns a boolean unchanged', () => {
    expect(identity(true)).toBe(true)
    expect(identity(false)).toBe(false)
  })
})