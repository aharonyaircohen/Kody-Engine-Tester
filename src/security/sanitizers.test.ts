import { describe, it, expect } from 'vitest'
import {
  sanitizeHtml,
  sanitizeSql,
  sanitizeUrl,
  sanitizeFilePath,
  sanitizeObject,
} from './sanitizers'
import { s } from '../utils/schema'

describe('sanitizeHtml', () => {
  it('passes plain text through unchanged', () => {
    expect(sanitizeHtml('hello world')).toBe('hello world')
  })

  it('strips script tags', () => {
    expect(sanitizeHtml('<script>alert(1)</script>')).toBe('alert(1)')
  })

  it('strips img onerror attack', () => {
    expect(sanitizeHtml('<img src=x onerror="alert(1)">')).toBe('')
  })

  it('strips nested tags', () => {
    expect(sanitizeHtml('<div><p>Hello <b>World</b></p></div>')).toBe('Hello World')
  })

  it('decodes HTML entities', () => {
    expect(sanitizeHtml('&lt;script&gt;')).toBe('<script>')
  })

  it('strips event handler attributes', () => {
    expect(sanitizeHtml('<div onclick="evil()">Click me</div>')).toBe('Click me')
  })

  it('strips anchor tag with javascript href', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">click</a>')).toBe('click')
  })

  it('returns empty string for null byte', () => {
    expect(sanitizeHtml('hello\u0000world')).toBe('helloworld')
  })
})

describe('sanitizeSql', () => {
  it('passes safe strings unchanged', () => {
    expect(sanitizeSql('hello world')).toBe('hello world')
  })

  it('escapes single quotes', () => {
    expect(sanitizeSql("O'Reilly")).toBe("O\\'Reilly")
  })

  it('escapes double quotes', () => {
    expect(sanitizeSql('say "hello"')).toBe('say \\"hello\\"')
  })

  it('escapes backslashes', () => {
    expect(sanitizeSql('C:\\path\\file')).toBe('C:\\\\path\\\\file')
  })

  it('escapes null bytes', () => {
    expect(sanitizeSql('hello\u0000world')).toBe('hello\\0world')
  })

  it('escapes newline characters', () => {
    expect(sanitizeSql('line1\nline2')).toBe('line1\\nline2')
  })

  it('escapes carriage returns', () => {
    expect(sanitizeSql('line1\rline2')).toBe('line1\\rline2')
  })

  it('escapes SQL injection attack string', () => {
    expect(sanitizeSql("'; DROP TABLE users; --")).toBe("\\'; DROP TABLE users; --")
  })
})

describe('sanitizeUrl', () => {
  it('accepts https URL', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com/')
  })

  it('accepts http URL', () => {
    expect(sanitizeUrl('http://example.com/path')).toBe('http://example.com/path')
  })

  it('accepts relative path', () => {
    expect(sanitizeUrl('/api/users')).toBe('/api/users')
  })

  it('rejects javascript: protocol', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('')
  })

  it('rejects data URI', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('')
  })

  it('rejects null bytes', () => {
    expect(sanitizeUrl('https://example.com\u0000evil')).toBe('')
  })

  it('returns empty string for invalid URL', () => {
    expect(sanitizeUrl('not a url')).toBe('')
  })

  it('normalizes URL with query string', () => {
    expect(sanitizeUrl('https://example.com/search?q=test&page=1')).toBe(
      'https://example.com/search?q=test&page=1',
    )
  })
})

describe('sanitizeFilePath', () => {
  it('passes safe filenames through', () => {
    expect(sanitizeFilePath('readme.txt')).toBe('readme.txt')
  })

  it('passes safe paths through', () => {
    expect(sanitizeFilePath('uploads/avatar.png')).toBe('uploads/avatar.png')
  })

  it('prevents path traversal with ../', () => {
    expect(sanitizeFilePath('../etc/passwd')).toBe('')
  })

  it('prevents double dot on Windows with ..\\', () => {
    expect(sanitizeFilePath('..\\windows\\system32')).toBe('')
  })

  it('rejects null bytes', () => {
    expect(sanitizeFilePath('file\u0000.txt')).toBe('')
  })

  it('collapses excessive slashes', () => {
    expect(sanitizeFilePath('uploads///images//photo.png')).toBe('uploads/images/photo.png')
  })

  it('rejects absolute path starting with /', () => {
    expect(sanitizeFilePath('/etc/passwd')).toBe('')
  })

  it('rejects path that resolves to traversal after normalization', () => {
    expect(sanitizeFilePath('uploads/../.htaccess')).toBe('')
  })

  it('rejects empty result after sanitization', () => {
    expect(sanitizeFilePath('')).toBe('')
  })
})

describe('sanitizeObject', () => {
  it('sanitizes string fields with HTML stripped', () => {
    const schema = s.object({ name: s.string() })
    const result = sanitizeObject({ name: '<b>John</b>' }, schema)
    expect(result).toEqual({ name: 'John' })
  })

  it('leaves number fields unchanged', () => {
    const schema = s.object({ age: s.number() })
    const result = sanitizeObject({ age: 25 }, schema)
    expect(result).toEqual({ age: 25 })
  })

  it('leaves boolean fields unchanged', () => {
    const schema = s.object({ active: s.boolean() })
    const result = sanitizeObject({ active: true }, schema)
    expect(result).toEqual({ active: true })
  })

  it('drops unknown input keys not in schema', () => {
    const schema = s.object({ name: s.string() })
    const result = sanitizeObject({ name: 'John', secret: 'token123' }, schema)
    expect(result).toEqual({ name: 'John' })
  })

  it('recursively sanitizes nested objects', () => {
    const schema = s.object({
      user: s.object({ name: s.string() }),
    })
    const result = sanitizeObject({ user: { name: '<script>evil</script>' } }, schema)
    expect(result).toEqual({ user: { name: 'evil' } })
  })

  it('recursively sanitizes arrays', () => {
    const schema = s.object({ tags: s.array(s.string()) })
    const result = sanitizeObject({ tags: ['<b>one</b>', '<i>two</i>'] }, schema)
    expect(result).toEqual({ tags: ['one', 'two'] })
  })

  it('sanitizes HTML in string fields', () => {
    const schema = s.object({ query: s.string() })
    const result = sanitizeObject({ query: '<b>search</b>' }, schema)
    expect(result).toEqual({ query: 'search' })
  })

  it('returns empty object when input is empty and schema is empty', () => {
    const schema = s.object({})
    const result = sanitizeObject({}, schema)
    expect(result).toEqual({})
  })
})
