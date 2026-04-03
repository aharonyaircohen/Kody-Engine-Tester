import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import {
  consoleTransport,
  fileTransport,
  bufferedFileTransport,
} from './logTransport'
import type { LogEntry } from '../utils/logger'

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

describe('fileTransport', () => {
  let tmpFile: string

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `log-transport-test-${Date.now()}.log`)
  })

  afterEach(() => {
    try { fs.unlinkSync(tmpFile) } catch {}
  })

  it('appends a line to the file', () => {
    const transport = fileTransport(tmpFile)
    transport('{"level":"info","message":"hello","timestamp":"2026-03-27T00:00:00.000Z"}')

    const content = fs.readFileSync(tmpFile, 'utf-8').trim()
    expect(content).toBe('{"level":"info","message":"hello","timestamp":"2026-03-27T00:00:00.000Z"}')
  })

  it('appends multiple lines for multiple calls', () => {
    const transport = fileTransport(tmpFile)
    transport('line one')
    transport('line two')
    const lines = fs.readFileSync(tmpFile, 'utf-8').trim().split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[0]).toBe('line one')
    expect(lines[1]).toBe('line two')
  })
})

describe('bufferedFileTransport', () => {
  let tmpFile: string

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `buffered-transport-test-${Date.now()}.log`)
  })

  afterEach(() => {
    try { fs.unlinkSync(tmpFile) } catch {}
  })

  it('does not write until flush is called', () => {
    const transport = bufferedFileTransport(tmpFile, { flushInterval: 10000 })
    transport('line one')
    // file should not exist yet (buffer not flushed)
    expect(fs.existsSync(tmpFile)).toBe(false)
  })

  it('writes all buffered lines on flush', () => {
    const transport = bufferedFileTransport(tmpFile, { flushInterval: 10000 })
    transport('line one')
    transport('line two')
    transport.flush()
    const lines = fs.readFileSync(tmpFile, 'utf-8').trim().split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[0]).toBe('line one')
    expect(lines[1]).toBe('line two')
  })

  it('flushes automatically after flushInterval', async () => {
    const transport = bufferedFileTransport(tmpFile, { flushInterval: 50 })
    transport('auto flushed line')
    // Wait for the interval to fire
    await new Promise((r) => setTimeout(r, 80))
    const content = fs.readFileSync(tmpFile, 'utf-8').trim()
    expect(content).toBe('auto flushed line')
  })

  it('flushes on destroy', () => {
    const transport = bufferedFileTransport(tmpFile, { flushInterval: 10000 })
    transport('destroyed line')
    transport.destroy()
    const content = fs.readFileSync(tmpFile, 'utf-8').trim()
    expect(content).toBe('destroyed line')
  })
})
