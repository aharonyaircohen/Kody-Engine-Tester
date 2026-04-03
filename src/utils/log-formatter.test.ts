import { describe, it, expect } from 'vitest'
import { jsonFormatter, textFormatter } from './log-formatter'
import type { LogEntry } from './logger'

const entry: LogEntry = {
  level: 'info',
  message: 'server started',
  timestamp: '2026-03-27T12:34:56.789Z',
}

describe('jsonFormatter', () => {
  it('returns a JSON string', () => {
    const result = jsonFormatter(entry)
    expect(() => JSON.parse(result)).not.toThrow()
  })

  it('serializes level, message, timestamp', () => {
    const parsed = JSON.parse(jsonFormatter(entry))
    expect(parsed.level).toBe('info')
    expect(parsed.message).toBe('server started')
    expect(parsed.timestamp).toBe('2026-03-27T12:34:56.789Z')
  })

  it('serializes context when present', () => {
    const e: LogEntry = { ...entry, context: { requestId: 'abc', count: 42 } }
    const parsed = JSON.parse(jsonFormatter(e))
    expect(parsed.context).toEqual({ requestId: 'abc', count: 42 })
  })

  it('omits context when undefined', () => {
    const parsed = JSON.parse(jsonFormatter(entry))
    expect(parsed.context).toBeUndefined()
  })
})

describe('textFormatter', () => {
  it('includes the message', () => {
    expect(textFormatter(entry)).toContain('server started')
  })

  it('includes the level in uppercase', () => {
    expect(textFormatter(entry)).toContain('[INFO]')
  })

  it('includes the timestamp', () => {
    expect(textFormatter(entry)).toContain('2026-03-27T12:34:56.789Z')
  })

  it('strips ANSI color codes', () => {
    // textFormatter should produce output with no ANSI escape sequences
    const output = textFormatter(entry)
    expect(output).not.toMatch(/\x1b\[[0-9;]+m/)
  })

  it('includes context as key=value when present', () => {
    const e: LogEntry = { ...entry, context: { requestId: 'abc' } }
    expect(textFormatter(e)).toContain('requestId=abc')
  })

  it('handles warn level', () => {
    const e: LogEntry = { ...entry, level: 'warn', message: 'slow query' }
    expect(textFormatter(e)).toContain('[WARN]')
    expect(textFormatter(e)).toContain('slow query')
  })

  it('handles error level', () => {
    const e: LogEntry = { ...entry, level: 'error', message: 'fail' }
    expect(textFormatter(e)).toContain('[ERROR]')
    expect(textFormatter(e)).toContain('fail')
  })

  it('handles debug level', () => {
    const e: LogEntry = { ...entry, level: 'debug', message: 'dbg' }
    expect(textFormatter(e)).toContain('[DEBUG]')
    expect(textFormatter(e)).toContain('dbg')
  })
})
