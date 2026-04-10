import { describe, it, expect } from 'vitest'
import { pluralize } from './pluralize'

describe('pluralize', () => {
  it('returns singular form when count is 1', () => {
    expect(pluralize(1, 'item', 'items')).toBe('1 item')
  })

  it('returns plural form when count is not 1', () => {
    expect(pluralize(3, 'item', 'items')).toBe('3 items')
  })

  it('handles count of 0 as plural', () => {
    expect(pluralize(0, 'item', 'items')).toBe('0 items')
  })

  it('handles negative counts as plural', () => {
    expect(pluralize(-1, 'item', 'items')).toBe('-1 items')
  })

  it('handles large counts', () => {
    expect(pluralize(100, 'item', 'items')).toBe('100 items')
  })
})