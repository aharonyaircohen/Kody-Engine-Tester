import { describe, it, expect } from 'vitest'
import { slugify } from './slugify'

describe('slugify', () => {
  it('converts a simple string to lowercase hyphenated slug', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('handles accented characters', () => {
    expect(slugify('café')).toBe('cafe')
    expect(slugify('naïve')).toBe('naive')
    expect(slugify('résumé')).toBe('resume')
  })

  it('handles unicode characters', () => {
    expect(slugify('日本語')).toBe('')
    expect(slugify('你好世界')).toBe('')
    expect(slugify('Hello 世界')).toBe('hello')
  })

  it('removes special characters', () => {
    expect(slugify('Hello@World!')).toBe('hello-world')
    expect(slugify('foo@bar.com')).toBe('foo-bar-com')
  })

  it('collapses multiple spaces into single hyphens', () => {
    expect(slugify('hello   world')).toBe('hello-world')
  })

  it('trims leading/trailing spaces and collapses multiple internal spaces', () => {
    expect(slugify('  Foo   Bar  ')).toBe('foo-bar')
  })

  it('collapses multiple hyphens into one', () => {
    expect(slugify('hello---world')).toBe('hello-world')
    expect(slugify('hello--world--test')).toBe('hello-world-test')
  })

  it('strips leading hyphens', () => {
    expect(slugify('---hello')).toBe('hello')
  })

  it('strips trailing hyphens', () => {
    expect(slugify('hello---')).toBe('hello')
  })

  it('strips both leading and trailing hyphens', () => {
    expect(slugify('---hello world---')).toBe('hello-world')
  })

  it('handles mixed accented chars and special chars', () => {
    expect(slugify('Café au lait!')).toBe('cafe-au-lait')
  })

  it('handles empty string', () => {
    expect(slugify('')).toBe('')
  })

  it('handles null/undefined as falsy', () => {
    expect(slugify(null as unknown as string)).toBe('')
    expect(slugify(undefined as unknown as string)).toBe('')
  })

  it('handles single word', () => {
    expect(slugify('Hello')).toBe('hello')
  })

  it('handles numbers mixed with letters', () => {
    expect(slugify('Hello 123 World')).toBe('hello-123-world')
  })

  it('handles underscores as hyphens', () => {
    expect(slugify('hello_world')).toBe('hello-world')
  })

  it('handles mixed case', () => {
    expect(slugify('HeLLo WoRLD')).toBe('hello-world')
  })

  it('handles string with only special chars', () => {
    expect(slugify('@#$%')).toBe('')
  })

  it('handles real-world URL-like strings', () => {
    expect(slugify('My Blog Post Title!')).toBe('my-blog-post-title')
    expect(slugify('Hello... World')).toBe('hello-world')
  })
})
