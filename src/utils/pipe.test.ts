import { describe, expect, it } from 'vitest'
import { pipe } from './pipe'

describe('pipe', () => {
  it('returns the value unchanged with no functions', () => {
    const result = pipe()(42)
    expect(result).toBe(42)
  })

  it('applies a single function', () => {
    const double = (n: number) => n * 2
    expect(pipe(double)(5)).toBe(10)
  })

  it('composes two functions left-to-right', () => {
    const add1 = (n: number) => n + 1
    const double = (n: number) => n * 2
    expect(pipe(add1, double)(3)).toBe(8) // (3+1)*2
  })

  it('composes three functions left-to-right', () => {
    const add1 = (n: number) => n + 1
    const double = (n: number) => n * 2
    const square = (n: number) => n * n
    expect(pipe(add1, double, square)(3)).toBe(64) // ((3+1)*2)^2
  })

  it('handles string transformations', () => {
    const trim = (s: string) => s.trim()
    const upper = (s: string) => s.toUpperCase()
    const exclaim = (s: string) => `${s}!`
    expect(pipe(trim, upper, exclaim)('  hello  ')).toBe('HELLO!')
  })

  it('handles type transformation through the chain', () => {
    const toString = (n: number) => String(n)
    const addBang = (s: string) => `${s}!`
    const result = pipe(toString, addBang)(42)
    expect(result).toBe('42!')
  })

  it('composes ten functions', () => {
    const inc = (n: number) => n + 1
    expect(pipe(inc, inc, inc, inc, inc, inc, inc, inc, inc, inc)(0)).toBe(10)
  })

  it('identity function passes value through', () => {
    const identity = <T>(x: T): T => x
    expect(pipe(identity)(99)).toBe(99)
  })

  it('works with objects', () => {
    type User = { name: string; age: number }
    const setAge = (u: User): User => ({ ...u, age: 30 })
    const upperName = (u: User): User => ({ ...u, name: u.name.toUpperCase() })
    const result = pipe(setAge, upperName)({ name: 'alice', age: 0 })
    expect(result).toEqual({ name: 'ALICE', age: 30 })
  })

  it('works with arrays', () => {
    const double = (arr: number[]) => arr.map((x) => x * 2)
    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0)
    expect(pipe(double, sum)([1, 2, 3])).toBe(12)
  })
})
