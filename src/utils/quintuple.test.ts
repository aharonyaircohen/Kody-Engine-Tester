import { describe, expect, it } from 'vitest'

import { quintuple } from './quintuple'

describe('quintuple', () => {
  it('returns 5 times the input', () => {
    expect(quintuple(0)).toBe(0)
    expect(quintuple(1)).toBe(5)
    expect(quintuple(2)).toBe(10)
    expect(quintuple(5)).toBe(25)
    expect(quintuple(10)).toBe(50)
  })

  it('works with negative numbers', () => {
    expect(quintuple(-1)).toBe(-5)
    expect(quintuple(-5)).toBe(-25)
  })

  it('works with floating point numbers', () => {
    expect(quintuple(0.5)).toBe(2.5)
    expect(quintuple(1.5)).toBe(7.5)
  })
})