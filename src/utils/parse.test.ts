import { describe, it, expect } from 'vitest'
import { parseQueryString } from './parse'

describe('parseQueryString', () => {
  it('parses a simple key=value pair', () => {
    expect(parseQueryString('token=abc')).toEqual({ token: 'abc' })
  })

  it('preserves equals signs inside the value', () => {
    expect(parseQueryString('token=a=b')).toEqual({ token: 'a=b' })
  })

  it('preserves multiple equals signs inside the value', () => {
    expect(parseQueryString('token=a=b=c')).toEqual({ token: 'a=b=c' })
  })

  it('handles an encoded equals sign in the value', () => {
    expect(parseQueryString('token=a%3Db')).toEqual({ token: 'a=b' })
  })

  it('strips a leading question mark', () => {
    expect(parseQueryString('?token=abc')).toEqual({ token: 'abc' })
  })

  it('parses multiple key-value pairs', () => {
    expect(parseQueryString('a=1&b=2')).toEqual({ a: '1', b: '2' })
  })

  it('handles an empty value', () => {
    expect(parseQueryString('key=')).toEqual({ key: '' })
  })

  it('handles a key with no value', () => {
    expect(parseQueryString('key')).toEqual({ key: '' })
  })

  it('returns an empty object for an empty string', () => {
    expect(parseQueryString('')).toEqual({})
  })

  it('ignores empty parts between ampersands', () => {
    expect(parseQueryString('a=1&&b=2')).toEqual({ a: '1', b: '2' })
  })
})
