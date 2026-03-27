import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import {
  createLogger,
  jsonFormatter,
  prettyFormatter,
  consoleTransport,
  fileTransport,
  type LogEntry,
  type LogLevel,
} from './index'

// --- Helpers ---

function captureLog(
  level: LogLevel,
  minLevel: LogLevel = 'debug',
): { entry: LogEntry | null } {
  let entry: LogEntry | null = null
  const transport = (_line: string) => {
    // reconstruct entry from formatted line for capture
  }
  const entries: LogEntry[] = []
  const logger = createLogger({
    level: minLevel,
    formatter: (e) => { entry = e; return '' },
    transports: [() => { /* noop */ }],
  })
  const methods: Record<LogLevel, () => void> = {
    debug: () => logger.debug('msg'),
    info: () => logger.info('msg'),
    warn: () => logger.warn('msg'),
    error: () => logger.error('msg'),
  }
  methods[level]()
  // Use jsonFormatter to capture actual entry
  const captureLogger = createLogger({
    level: minLevel,
    formatter: jsonFormatter,
    transports: [(line) => {
      try { entry = JSON.parse(line) } catch {}
    }],
  })
  const captureMethods: Record<LogLevel, () => void> = {
    debug: () => captureLogger.debug('msg'),
    info: () => captureLogger.info('msg'),
    warn: () => captureLogger.warn('msg'),
    error: () => captureLogger.error('msg'),
  }
  captureMethods[level]()
  return { entry }
}

// --- Log level filtering ---

describe('log levels', () => {
  it('debug is emitted when minLevel is debug', () => {
    const { entry } = captureLog('debug', 'debug')
    expect(entry?.level).toBe('debug')
  })

  it('info is not emitted when minLevel is warn', () => {
    const { entry } = captureLog('info', 'warn')
    expect(entry).toBeNull()
  })

  it('warn is emitted when minLevel is warn', () => {
    const { entry } = captureLog('warn', 'warn')
    expect(entry?.level).toBe('warn')
  })

  it('error is emitted when minLevel is error', () => {
    const { entry } = captureLog('error', 'error')
    expect(entry?.level).toBe('error')
  })

  it('each level emits the correct level string', () => {
    for (const lvl of ['debug', 'info', 'warn', 'error'] as LogLevel[]) {
      const { entry } = captureLog(lvl, 'debug')
      expect(entry?.level).toBe(lvl)
    }
  })

  it('log entry contains message', () => {
    const { entry } = captureLog('info', 'debug')
    expect(entry?.message).toBe('msg')
  })

  it('log entry contains ISO timestamp', () => {
    const { entry } = captureLog('info', 'debug')
    expect(entry?.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })

  it('log entry contains context when provided', () => {
    const entries: LogEntry[] = []
    const logger = createLogger({
      level: 'debug',
      formatter: jsonFormatter,
      transports: [(line) => { try { entries.push(JSON.parse(line)) } catch {} }],
    })
    logger.info('hello', { requestId: 'abc', count: 42 })
    expect(entries[0].context).toEqual({ requestId: 'abc', count: 42 })
  })

  it('log entry has no context when none provided', () => {
    const { entry } = captureLog('info', 'debug')
    expect(entry?.context).toBeUndefined()
  })
})

// --- jsonFormatter ---

describe('jsonFormatter', () => {
  it('returns a JSON string', () => {
    const entry: LogEntry = {
      level: 'info',
      message: 'hello',
      timestamp: '2026-03-27T00:00:00.000Z',
      context: { foo: 'bar' },
    }
    const result = jsonFormatter(entry)
    expect(() => JSON.parse(result)).not.toThrow()
  })

  it('serializes level, message, timestamp, and context', () => {
    const entry: LogEntry = {
      level: 'warn',
      message: 'something went wrong',
      timestamp: '2026-03-27T00:00:00.000Z',
    }
    const parsed = JSON.parse(jsonFormatter(entry))
    expect(parsed.level).toBe('warn')
    expect(parsed.message).toBe('something went wrong')
    expect(parsed.timestamp).toBe('2026-03-27T00:00:00.000Z')
  })
})

// --- prettyFormatter ---

describe('prettyFormatter', () => {
  it('includes the message', () => {
    const entry: LogEntry = {
      level: 'info',
      message: 'server started',
      timestamp: '2026-03-27T00:00:00.000Z',
    }
    expect(prettyFormatter(entry)).toContain('server started')
  })

  it('includes the level in uppercase', () => {
    const entry: LogEntry = {
      level: 'error',
      message: 'fail',
      timestamp: '2026-03-27T00:00:00.000Z',
    }
    expect(prettyFormatter(entry)).toContain('[ERROR]')
  })

  it('includes the timestamp', () => {
    const entry: LogEntry = {
      level: 'info',
      message: 'x',
      timestamp: '2026-03-27T12:34:56.789Z',
    }
    expect(prettyFormatter(entry)).toContain('2026-03-27T12:34:56.789Z')
  })

  it('includes context as JSON when present', () => {
    const entry: LogEntry = {
      level: 'info',
      message: 'x',
      timestamp: '2026-03-27T00:00:00.000Z',
      context: { id: 1 },
    }
    expect(prettyFormatter(entry)).toContain('"id":1')
  })
})

// --- consoleTransport ---

describe('consoleTransport', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls console.log for info level', () => {
    const entry: LogEntry = { level: 'info', message: 'info msg', timestamp: '' }
    consoleTransport(entry)
    expect(console.log).toHaveBeenCalledWith('info msg')
    expect(console.warn).not.toHaveBeenCalled()
    expect(console.error).not.toHaveBeenCalled()
  })

  it('calls console.warn for warn level', () => {
    const entry: LogEntry = { level: 'warn', message: 'warn msg', timestamp: '' }
    consoleTransport(entry)
    expect(console.warn).toHaveBeenCalledWith('warn msg')
    expect(console.log).not.toHaveBeenCalled()
    expect(console.error).not.toHaveBeenCalled()
  })

  it('calls console.error for error level', () => {
    const entry: LogEntry = { level: 'error', message: 'err msg', timestamp: '' }
    consoleTransport(entry)
    expect(console.error).toHaveBeenCalledWith('err msg')
    expect(console.log).not.toHaveBeenCalled()
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('calls console.log for debug level', () => {
    const entry: LogEntry = { level: 'debug', message: 'dbg msg', timestamp: '' }
    consoleTransport(entry)
    expect(console.log).toHaveBeenCalledWith('dbg msg')
  })
})

// --- fileTransport ---

describe('fileTransport', () => {
  let tmpFile: string

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `logger-test-${Date.now()}.log`)
  })

  afterEach(() => {
    try { fs.unlinkSync(tmpFile) } catch {}
  })

  it('appends a JSON line to the file', () => {
    const transport = fileTransport(tmpFile)
    const entry: LogEntry = {
      level: 'info',
      message: 'hello',
      timestamp: '2026-03-27T00:00:00.000Z',
      context: { foo: 'bar' },
    }
    transport(JSON.stringify(entry))

    const content = fs.readFileSync(tmpFile, 'utf-8').trim()
    const parsed = JSON.parse(content)
    expect(parsed.message).toBe('hello')
    expect(parsed.context).toEqual({ foo: 'bar' })
  })

  it('appends multiple lines for multiple calls', () => {
    const transport = fileTransport(tmpFile)
    transport(JSON.stringify({ level: 'info', message: 'a', timestamp: '' }))
    transport(JSON.stringify({ level: 'warn', message: 'b', timestamp: '' }))
    const lines = fs.readFileSync(tmpFile, 'utf-8').trim().split('\n')
    expect(lines).toHaveLength(2)
    expect(JSON.parse(lines[0]).message).toBe('a')
    expect(JSON.parse(lines[1]).message).toBe('b')
  })
})

// --- createLogger factory ---

describe('createLogger', () => {
  it('returns an object with debug, info, warn, error methods', () => {
    const logger = createLogger()
    expect(typeof logger.debug).toBe('function')
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.warn).toBe('function')
    expect(typeof logger.error).toBe('function')
  })

  it('accepts custom formatter', () => {
    let called = false
    const customFormatter = () => { called = true; return 'formatted' }
    const logger = createLogger({ level: 'debug', formatter: customFormatter, transports: [() => {}] })
    logger.debug('msg')
    expect(called).toBe(true)
  })

  it('accepts multiple transports', () => {
    const calls: string[] = []
    const t1 = (_l: string) => calls.push('t1')
    const t2 = (_l: string) => calls.push('t2')
    const logger = createLogger({ transports: [t1, t2] })
    logger.info('msg')
    expect(calls).toEqual(['t1', 't2'])
  })

  it('swallows transport errors', () => {
    const bad = () => { throw new Error('transport fail') }
    const good = vi.fn()
    const logger = createLogger({ transports: [bad, good] })
    expect(() => logger.info('msg')).not.toThrow()
    expect(good).toHaveBeenCalled()
  })

  it('defaults to consoleTransport', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const logger = createLogger()
    logger.info('hello')
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('passes formatted string to transport', () => {
    let received = ''
    const logger = createLogger({
      level: 'debug',
      formatter: jsonFormatter,
      transports: [(line) => { received = line }],
    })
    logger.info('hello', { id: 1 })
    const parsed = JSON.parse(received)
    expect(parsed.message).toBe('hello')
    expect(parsed.context).toEqual({ id: 1 })
  })
})

// --- child logger ---

describe('child logger', () => {
  it('child() returns a logger with merged context', () => {
    const entries: LogEntry[] = []
    const transport = (line: string) => { try { entries.push(JSON.parse(line)) } catch {} }
    const parent = createLogger({ level: 'debug', formatter: jsonFormatter, transports: [transport] })
    const child = parent.child({ requestId: 'abc' })
    child.info('request started')

    expect(entries[0].context).toEqual({ requestId: 'abc' })
  })

  it('child context is merged with call-time context', () => {
    const entries: LogEntry[] = []
    const transport = (line: string) => { try { entries.push(JSON.parse(line)) } catch {} }
    const parent = createLogger({ level: 'debug', formatter: jsonFormatter, transports: [transport] })
    const child = parent.child({ requestId: 'abc' })
    child.info('request started', { userId: 42 })

    expect(entries[0].context).toEqual({ requestId: 'abc', userId: 42 })
  })

  it('parent context is preserved in child', () => {
    const entries: LogEntry[] = []
    const transport = (line: string) => { try { entries.push(JSON.parse(line)) } catch {} }
    const parent = createLogger({ level: 'debug', formatter: jsonFormatter, transports: [transport] })
    const child = parent.child({ requestId: 'abc' })
    const grandchild = child.child({ traceId: 'xyz' })
    grandchild.info('deep')

    expect(entries[0].context).toEqual({ requestId: 'abc', traceId: 'xyz' })
  })

  it('child does not pollute parent context', () => {
    const entries: LogEntry[] = []
    const transport = (line: string) => { try { entries.push(JSON.parse(line)) } catch {} }
    const parent = createLogger({ level: 'debug', formatter: jsonFormatter, transports: [transport] })
    const child = parent.child({ childKey: 'c' })
    parent.info('parent msg')
    child.info('child msg')

    expect(entries[0].context).toBeUndefined()
    expect(entries[1].context).toEqual({ childKey: 'c' })
  })

  it('child inherits minLevel from parent', () => {
    const entries: LogEntry[] = []
    const transport = (line: string) => { try { entries.push(JSON.parse(line)) } catch {} }
    const parent = createLogger({ level: 'warn', formatter: jsonFormatter, transports: [transport] })
    const child = parent.child({ requestId: 'x' })
    child.info('should be filtered')
    child.warn('should pass')

    expect(entries).toHaveLength(1)
    expect(entries[0].level).toBe('warn')
  })

  it('child has its own debug, info, warn, error methods', () => {
    const child = createLogger({ level: 'debug' }).child({})
    expect(typeof child.debug).toBe('function')
    expect(typeof child.info).toBe('function')
    expect(typeof child.warn).toBe('function')
    expect(typeof child.error).toBe('function')
  })
})
