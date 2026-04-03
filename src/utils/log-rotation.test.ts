import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { RotatingFileTransport } from './log-rotation'

describe('RotatingFileTransport', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'log-rotation-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  function makePath(name: string): string {
    return path.join(tmpDir, name)
  }

  it('writes to the target file without rotation when under limit', () => {
    const transport = new RotatingFileTransport(makePath('app.log'), {
      maxSize: 1024,
      maxFiles: 3,
    })
    transport.writeLine('line one')
    transport.writeLine('line two')

    const content = fs.readFileSync(makePath('app.log'), 'utf-8').trim()
    expect(content).toBe('line one\nline two')
  })

  it('rotates when file exceeds maxSize', () => {
    const transport = new RotatingFileTransport(makePath('app.log'), {
      maxSize: 20, // small limit
      maxFiles: 3,
    })
    // first line triggers rotation since it exceeds 20 bytes
    transport.writeLine('this is a longer line that exceeds the limit')
    transport.writeLine('second line')

    // After rotation, app.log should have second line
    const content = fs.readFileSync(makePath('app.log'), 'utf-8').trim()
    expect(content).toBe('second line')
    // Backup should exist
    expect(fs.existsSync(makePath('app.log.1'))).toBe(true)
  })

  it('keeps up to maxFiles backups', () => {
    const transport = new RotatingFileTransport(makePath('app.log'), {
      maxSize: 10, // very small to trigger on each line
      maxFiles: 3,
    })
    transport.writeLine('aaaaa') // rotates: app.log.1 = aaaaa
    transport.writeLine('bbbbb') // rotates: app.log.2 = bbbbb
    transport.writeLine('ccccc') // rotates: app.log.3 = ccccc
    transport.writeLine('ddddd') // rotates: should remove oldest (app.log.1), shift 2->3, 1->2, create .1 = ddddd

    expect(fs.existsSync(makePath('app.log.1'))).toBe(true)
    expect(fs.existsSync(makePath('app.log.2'))).toBe(true)
    expect(fs.existsSync(makePath('app.log.3'))).toBe(true)
    expect(fs.existsSync(makePath('app.log.4'))).toBe(false)
  })

  it('current file has the latest content after multiple rotations', () => {
    const transport = new RotatingFileTransport(makePath('app.log'), {
      maxSize: 10,
      maxFiles: 2,
    })
    transport.writeLine('first')
    transport.writeLine('second')
    transport.writeLine('third')

    const content = fs.readFileSync(makePath('app.log'), 'utf-8').trim()
    expect(content).toBe('third')
  })

  it('flushes pending writes before rotation', () => {
    const transport = new RotatingFileTransport(makePath('app.log'), {
      maxSize: 10,
      maxFiles: 2,
    })
    transport.writeLine('short')
    transport.writeLine('alsoshort')
    transport.writeLine('third')

    // app.log should have "third", backup should have "alsoshort"
    expect(fs.readFileSync(makePath('app.log'), 'utf-8').trim()).toBe('third')
    expect(fs.readFileSync(makePath('app.log.1'), 'utf-8').trim()).toBe('alsoshort')
  })
})
