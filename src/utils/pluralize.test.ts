import { describe, it, expect } from 'vitest'
import { pluralize } from './pluralize'

describe('pluralize', () => {
  it('returns singular form when count is 1', () => {
    expect(pluralize('item', 1)).toBe('item')
  })

  it('returns plural form with s appended when count is not 1', () => {
    expect(pluralize('item', 5)).toBe('items')
  })

  it('returns plural form for count of 0', () => {
    expect(pluralize('item', 0)).toBe('items')
  })

  it('returns plural form for negative counts', () => {
    expect(pluralize('item', -1)).toBe('items')
  })

  it('handles irregular plurals via options', () => {
    expect(pluralize('cherry', 2, { irregular: { cherry: 'cherries' } })).toBe('cherries')
  })

  it('falls back to regular plural when irregular not found', () => {
    expect(pluralize('apple', 2, { irregular: { cherry: 'cherries' } })).toBe('apples')
  })

  it('handles count of 1 with irregular plural defined but not used', () => {
    expect(pluralize('cherry', 1, { irregular: { cherry: 'cherries' } })).toBe('cherry')
  })

  it('handles empty string', () => {
    expect(pluralize('', 1)).toBe('')
    expect(pluralize('', 5)).toBe('s')
  })

  it('handles single character', () => {
    expect(pluralize('a', 1)).toBe('a')
    expect(pluralize('a', 5)).toBe('as')
  })
})
