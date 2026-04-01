import { describe, it, expect } from 'vitest'
import { interpolate } from './interpolate'

describe('interpolate', () => {
  it('replaces a single placeholder with a string value', () => {
    expect(interpolate('Hello, {name}!', { name: 'World' })).toBe('Hello, World!')
  })

  it('replaces multiple placeholders with string values', () => {
    expect(interpolate('User {name} has {count} messages', { name: 'Alice', count: 5 })).toBe(
      'User Alice has 5 messages',
    )
  })

  it('replaces placeholders with number values', () => {
    expect(interpolate('Value: {num}', { num: 42 })).toBe('Value: 42')
  })

  it('leaves unmatched placeholders unchanged', () => {
    expect(interpolate('Hello, {name}!', {})).toBe('Hello, {name}!')
  })

  it('handles template with no placeholders', () => {
    expect(interpolate('Hello, World!', { name: 'Alice' })).toBe('Hello, World!')
  })

  it('handles repeated placeholders', () => {
    expect(interpolate('{greeting}, {greeting}!', { greeting: 'Hi' })).toBe('Hi, Hi!')
  })

  it('handles placeholder in the middle of string', () => {
    expect(interpolate('foo {bar} baz', { bar: 'QUX' })).toBe('foo QUX baz')
  })

  it('handles multiple consecutive placeholders', () => {
    expect(interpolate('{a}{b}{c}', { a: '1', b: '2', c: '3' })).toBe('123')
  })
})