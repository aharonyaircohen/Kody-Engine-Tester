import { describe, it, expect } from 'vitest'
import { sanitizeInput } from './sanitize'

describe('sanitizeInput', () => {
  it('returns empty string for empty input', () => {
    expect(sanitizeInput('')).toBe('')
    expect(sanitizeInput(undefined as unknown as string)).toBe('')
  })

  it('strips HTML tags', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('alert("xss")')
    expect(sanitizeInput('<b>bold</b>')).toBe('bold')
    expect(sanitizeInput('<p>paragraph</p>')).toBe('paragraph')
    expect(sanitizeInput('<a href="http://evil.com">evil</a>')).toBe('evil')
  })

  it('strips HTML tags with attributes', () => {
    expect(sanitizeInput('<div class="test" onclick="evil()">content</div>')).toBe('content')
    expect(sanitizeInput('<img src="x" onerror="alert(1)">')).toBe('')
    expect(sanitizeInput('<input type="text" value="test">')).toBe('')
  })

  it('strips nested HTML tags', () => {
    // trim() is applied last, so leading/trailing whitespace inside tags is removed
    expect(sanitizeInput('<div><p>nested<span>text</span></p></div>')).toBe('nestedtext')
    expect(sanitizeInput('<ul><li>item1</li><li>item2</li></ul>')).toBe('item1item2')
  })

  it('strips incomplete HTML tags', () => {
    expect(sanitizeInput('hello < world')).toBe('hello < world')
    expect(sanitizeInput('text with < unclosed tag')).toBe('text with < unclosed tag')
    expect(sanitizeInput('</closed> tag')).toBe('tag')
    // `< >` matches as an incomplete tag (space + >), leaving < which then gets trimmed
    expect(sanitizeInput('< >')).toBe('')
  })

  it('removes null bytes', () => {
    expect(sanitizeInput('hello\0world')).toBe('helloworld')
    // \0<script>\0 becomes <script> after null removal, then HTML strip removes it
    expect(sanitizeInput('\0<script>\0')).toBe('')
    expect(sanitizeInput('test\0\0input')).toBe('testinput')
    // null byte in the middle of text
    expect(sanitizeInput('te\0st')).toBe('test')
  })

  it('trims leading whitespace', () => {
    expect(sanitizeInput('   hello')).toBe('hello')
    expect(sanitizeInput('\t\nhello')).toBe('hello')
    expect(sanitizeInput('  <b>bold</b>  ')).toBe('bold')
  })

  it('trims trailing whitespace', () => {
    expect(sanitizeInput('hello   ')).toBe('hello')
    expect(sanitizeInput('hello\t\n')).toBe('hello')
    expect(sanitizeInput('  <b>bold</b>  ')).toBe('bold')
  })

  it('trims both leading and trailing whitespace', () => {
    expect(sanitizeInput('  hello world  ')).toBe('hello world')
    expect(sanitizeInput('\t\n  text  \n\t')).toBe('text')
  })

  it('normalizes unicode to NFC form', () => {
    // é in composed form (NFC) vs decomposed form (NFD)
    // NFD: e + combining acute accent (U+0065 U+0301)
    // NFC: é (U+00E9)
    const nfd = 'e\u0301' // 'é' in NFD (decomposed)
    const nfc = '\u00E9' // 'é' in NFC (composed)

    expect(sanitizeInput(nfd)).toBe(nfc)
    expect(sanitizeInput(nfd)).not.toBe(nfd)
  })

  it('normalizes accented characters to NFC', () => {
    // Various accented characters in NFD form
    const nfdString = 'caf\u0065\u0301' // café in decomposed form
    expect(sanitizeInput(nfdString)).toBe('café')
  })

  it('preserves regular text unchanged', () => {
    expect(sanitizeInput('hello world')).toBe('hello world')
    expect(sanitizeInput('Hello, World!')).toBe('Hello, World!')
    expect(sanitizeInput('123')).toBe('123')
  })

  it('handles mixed content with HTML and text', () => {
    expect(sanitizeInput('Hello <b>World</b>!')).toBe('Hello World!')
    expect(sanitizeInput('User: <script>evil()</script> - Welcome!')).toBe('User: evil() - Welcome!')
  })

  it('handles whitespace-only input', () => {
    expect(sanitizeInput('   ')).toBe('')
    expect(sanitizeInput('\t\n')).toBe('')
    expect(sanitizeInput('  \t  \n  ')).toBe('')
  })

  it('handles unicode text without HTML', () => {
    expect(sanitizeInput('日本語')).toBe('日本語')
    expect(sanitizeInput('Ελληνικά')).toBe('Ελληνικά')
    expect(sanitizeInput('العربية')).toBe('العربية')
  })

  it('handles newlines and line breaks', () => {
    expect(sanitizeInput('line1\nline2')).toBe('line1\nline2')
    expect(sanitizeInput('line1\r\nline2')).toBe('line1\r\nline2')
    expect(sanitizeInput('<div>\ncontent\n</div>')).toBe('content')
  })
})
