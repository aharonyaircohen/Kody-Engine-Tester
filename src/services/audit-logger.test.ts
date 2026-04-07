import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { logAuditEvent } from './audit-logger'

describe('audit-logger', () => {
  const testDir = path.join(process.cwd(), '.test-audit-tmp')
  const testFilePath = path.join(testDir, 'audit.jsonl')

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true })
    }
  })

  afterEach(() => {
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath)
    }
    if (fs.existsSync(testDir)) {
      fs.rmdirSync(testDir, { recursive: true })
    }
  })

  describe('logAuditEvent', () => {
    it('appends a JSONL entry to the file', () => {
      logAuditEvent({ action: 'user.login', userId: 'u1', resource: '/login' }, { filePath: testFilePath })

      const content = fs.readFileSync(testFilePath, 'utf-8')
      const lines = content.trim().split('\n')
      expect(lines).toHaveLength(1)

      const entry = JSON.parse(lines[0])
      expect(entry.action).toBe('user.login')
      expect(entry.userId).toBe('u1')
      expect(entry.resource).toBe('/login')
      expect(entry.timestamp).toBeDefined()
    })

    it('includes optional details field', () => {
      logAuditEvent(
        { action: 'document.update', userId: 'u2', resource: 'doc-123', details: 'Updated title' },
        { filePath: testFilePath }
      )

      const content = fs.readFileSync(testFilePath, 'utf-8')
      const entry = JSON.parse(content.trim())
      expect(entry.details).toBe('Updated title')
    })

    it('appends multiple entries without overwriting', () => {
      logAuditEvent({ action: 'event.1', userId: 'u1', resource: 'r1' }, { filePath: testFilePath })
      logAuditEvent({ action: 'event.2', userId: 'u2', resource: 'r2' }, { filePath: testFilePath })

      const content = fs.readFileSync(testFilePath, 'utf-8')
      const lines = content.trim().split('\n')
      expect(lines).toHaveLength(2)
      expect(JSON.parse(lines[0]).action).toBe('event.1')
      expect(JSON.parse(lines[1]).action).toBe('event.2')
    })

    it('includes ISO timestamp in each entry', () => {
      const before = new Date()
      logAuditEvent({ action: 'test.action', userId: 'u1', resource: 'test' }, { filePath: testFilePath })
      const after = new Date()

      const content = fs.readFileSync(testFilePath, 'utf-8')
      const entry = JSON.parse(content.trim())
      const timestamp = new Date(entry.timestamp)

      expect(timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(timestamp.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('handles entry without optional details', () => {
      logAuditEvent({ action: 'minimal.event', userId: 'u1', resource: 'res' }, { filePath: testFilePath })

      const content = fs.readFileSync(testFilePath, 'utf-8')
      const entry = JSON.parse(content.trim())
      expect(entry.details).toBeUndefined()
      expect(entry.action).toBe('minimal.event')
    })
  })
})
