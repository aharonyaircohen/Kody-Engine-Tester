import { describe, it, expect } from 'vitest'
import { normalizeFeatureMarker } from './normalize-feature-marker'

describe('normalizeFeatureMarker', () => {
  it('converts simple string to lowercase hyphenated marker', () => {
    expect(normalizeFeatureMarker('Hello World')).toBe('hello-world')
  })

  it('trims leading and trailing whitespace', () => {
    expect(normalizeFeatureMarker('  hello  ')).toBe('hello')
  })

  it('collapses multiple spaces into single hyphens', () => {
    expect(normalizeFeatureMarker('hello   world')).toBe('hello-world')
  })

  it('collapses multiple hyphens into one', () => {
    expect(normalizeFeatureMarker('hello---world')).toBe('hello-world')
    expect(normalizeFeatureMarker('hello--world--test')).toBe('hello-world-test')
  })

  it('strips leading hyphens', () => {
    expect(normalizeFeatureMarker('---hello')).toBe('hello')
  })

  it('strips trailing hyphens', () => {
    expect(normalizeFeatureMarker('hello---')).toBe('hello')
  })

  it('strips both leading and trailing hyphens', () => {
    expect(normalizeFeatureMarker('---hello world---')).toBe('hello-world')
  })

  it('handles empty string', () => {
    expect(normalizeFeatureMarker('')).toBe('')
  })

  it('handles null/undefined as falsy', () => {
    expect(normalizeFeatureMarker(null as unknown as string)).toBe('')
    expect(normalizeFeatureMarker(undefined as unknown as string)).toBe('')
  })

  it('handles already-normalized marker', () => {
    expect(normalizeFeatureMarker('already-normalized')).toBe('already-normalized')
  })

  it('handles mixed case with spaces', () => {
    expect(normalizeFeatureMarker('Mixed Case WiTh Spaces')).toBe('mixed-case-with-spaces')
  })

  it('handles whitespace and hyphens all stripped', () => {
    expect(normalizeFeatureMarker('  ---  ')).toBe('')
  })

  it('preserves unicode characters (not NFD-stripped)', () => {
    expect(normalizeFeatureMarker('你好世界')).toBe('你好世界')
  })

  it('preserves accented characters (not diacritic-stripped)', () => {
    expect(normalizeFeatureMarker('Café au lait')).toBe('café-au-lait')
  })

  it('preserves special characters (not replaced with hyphens)', () => {
    expect(normalizeFeatureMarker('@feature!')).toBe('@feature!')
  })
})
