import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { createLogger } from '@/utils/logger'
import { jsonFormatter, textFormatter } from '@/utils/log-formatter'
import { fileTransport, bufferedFileTransport } from '@/services/logTransport'
import { RotatingFileTransport } from '@/utils/log-rotation'

describe('Logging pipeline integration', () => {
  let tmpDir: string

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'logging-pipeline-test-'))
  })

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  function makePath(name: string): string {
    return path.join(tmpDir, name)
  }

  describe('formatter → fileTransport', () => {
    it('writes JSON-formatted log entries to a file', () => {
      const filePath = makePath('json.log')
      const transport = fileTransport(filePath)
      const logger = createLogger({
        level: 'debug',
        formatter: jsonFormatter,
        transports: [transport],
      })

      logger.info('server started', { port: 3000 })
      logger.warn('slow request', { duration: 1500 })
      logger.error('connection refused', { host: 'db.example.com' })

      const content = fs.readFileSync(filePath, 'utf-8').trim()
      const lines = content.split('\n')
      expect(lines).toHaveLength(3)

      const first = JSON.parse(lines[0])
      expect(first.message).toBe('server started')
      expect(first.context).toEqual({ port: 3000 })

      const second = JSON.parse(lines[1])
      expect(second.level).toBe('warn')
      expect(second.message).toBe('slow request')

      const third = JSON.parse(lines[2])
      expect(third.level).toBe('error')
    })

    it('writes text-formatted log entries to a file', () => {
      const filePath = makePath('text.log')
      const transport = fileTransport(filePath)
      const logger = createLogger({
        level: 'debug',
        formatter: textFormatter,
        transports: [transport],
      })

      logger.info('server started', { port: 3000 })

      const content = fs.readFileSync(filePath, 'utf-8')
      expect(content).toContain('[INFO]')
      expect(content).toContain('server started')
      expect(content).toContain('port=3000')
      // textFormatter strips ANSI codes
      expect(content).not.toMatch(/\x1b\[[0-9;]+m/)
    })
  })

  describe('formatter → bufferedFileTransport', () => {
    it('writes buffered entries to a file after flush', () => {
      const filePath = makePath('buffered.log')
      const transport = bufferedFileTransport(filePath, { flushInterval: 10000 })
      const logger = createLogger({
        level: 'debug',
        formatter: jsonFormatter,
        transports: [(line) => transport(line)],
      })

      logger.info('buffered entry', { id: 1 })
      expect(fs.existsSync(filePath)).toBe(false) // not flushed yet

      transport.flush()
      expect(fs.existsSync(filePath)).toBe(true)
      const content = fs.readFileSync(filePath, 'utf-8')
      expect(content).toContain('buffered entry')
    })
  })

  describe('formatter → RotatingFileTransport', () => {
    it('rotates when maxSize is exceeded', () => {
      const filePath = makePath('rotating.log')
      const rotating = new RotatingFileTransport(filePath, {
        maxSize: 30,
        maxFiles: 3,
      })
      const transport = fileTransport(filePath)
      const logger = createLogger({
        level: 'debug',
        formatter: jsonFormatter,
        transports: [(line) => rotating.writeLine(line)],
      })

      logger.info('first entry', { id: 1 })
      logger.info('second entry that will exceed the size limit', { id: 2 })

      // After second entry, rotation should have happened
      expect(fs.existsSync(`${filePath}.1`)).toBe(true)
      // Current file should have the latest entry
      const content = fs.readFileSync(filePath, 'utf-8').trim()
      expect(content).toContain('second entry')
    })

    it('keeps correct number of backup files', () => {
      const filePath = makePath('rotating2.log')
      const rotating = new RotatingFileTransport(filePath, {
        maxSize: 10, // very small — triggers on almost every line
        maxFiles: 3,
      })
      const logger = createLogger({
        level: 'debug',
        formatter: jsonFormatter,
        transports: [(line) => rotating.writeLine(line)],
      })

      for (let i = 1; i <= 5; i++) {
        logger.info(`entry ${i}`)
      }

      // Should only have 3 backup files max
      expect(fs.existsSync(`${filePath}.1`)).toBe(true)
      expect(fs.existsSync(`${filePath}.2`)).toBe(true)
      expect(fs.existsSync(`${filePath}.3`)).toBe(true)
      expect(fs.existsSync(`${filePath}.4`)).toBe(false)
    })
  })

  describe('full pipeline: formatter → bufferedFileTransport → RotatingFileTransport', () => {
    it('chains all three layers correctly', async () => {
      const filePath = makePath('full-pipeline.log')
      const rotating = new RotatingFileTransport(filePath, {
        maxSize: 30,
        maxFiles: 3,
      })
      const buffered = bufferedFileTransport(filePath, { flushInterval: 50 })

      const logger = createLogger({
        level: 'debug',
        formatter: jsonFormatter,
        transports: [
          (line) => {
            buffered(line)
            rotating.writeLine(line)
          },
        ],
      })

      logger.info('pipeline test', { traceId: 'abc' })

      // buffered writes are async — wait for flush
      await new Promise((r) => setTimeout(r, 80))

      const content = fs.readFileSync(filePath, 'utf-8').trim()
      expect(content).toContain('pipeline test')
      expect(content).toContain('traceId')
    })
  })
})
