import { describe, expect, it } from 'vitest'

import { squareV2 } from './sq'

describe('squareV2', () => {
  it('returns 0 for 0', () => {
    expect(squareV2(0)).toBe(0)
  })

  it('returns 9 for 3', () => {
    expect(squareV2(3)).toBe(9)
  })

  it('returns 16 for -4', () => {
    expect(squareV2(-4)).toBe(16)
  })
})
