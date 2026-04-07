import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { existsSync, readFileSync, unlinkSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { AuditLogger } from './audit-logger'

describe('AuditLogger', () => {
  const testDir = join(__dirname, '__audit_test__')
  const testFile = join(testDir, 'audit.jsonl')

  beforeEach(() => {
    if (existsSync(testDir)) {
      const files = require('fs').readdirSync(testDir)
      files.forEach((f: string) => unlinkSync(join(testDir, f)))
    } else {
      mkdirSync(testDir, { recursive: true })
    }
  })

  afterEach(() => {
    if (existsSync(testFile)) {
      unlinkSync(testFile)
    }
    if (existsSync(testDir)) {
      const files = require('fs').readdirSync(testDir)
      files.forEach((f: string) => unlinkSync(join(testDir, f)))
      require('fs').rmdirSync(testDir)
    }
  })

  describe('logAuditEvent', () => {
    it('appends a JSONL line with action, userId, resource, and timestamp', () => {
      const logger = new AuditLogger(testFile)
      logger.logAuditEvent({ action: 'user.login', userId: 'user-123', resource: '/admin' })

      const content = readFileSync(testFile, 'utf-8')
      const lines = content.trim().split('\n').filter(Boolean)
      expect(lines).toHaveLength(1)

      const entry = JSON.parse(lines[0])
      expect(entry.action).toBe('user.login')
      expect(entry.userId).toBe('user-123')
      expect(entry.resource).toBe('/admin')
      expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    it('includes optional details field', () => {
      const logger = new AuditLogger(testFile)
      logger.logAuditEvent({
        action: 'course.created',
        userId: 'admin-1',
        resource: 'course-456',
        details: 'Created course "Intro to Testing"',
      })

      const content = readFileSync(testFile, 'utf-8')
      const entry = JSON.parse(content.trim())
      expect(entry.details).toBe('Created course "Intro to Testing"')
    })

    it('auto-appends ISO timestamp when not provided', () => {
      const logger = new AuditLogger(testFile)
      logger.logAuditEvent({ action: 'note.updated', userId: 'user-99', resource: 'note-7' })

      const content = readFileSync(testFile, 'utf-8')
      const entry = JSON.parse(content.trim())
      expect(entry.timestamp).toBeDefined()
      expect(() => new Date(entry.timestamp)).not.toThrow()
    })

    it('writes one JSON object per line (valid JSONL)', () => {
      const logger = new AuditLogger(testFile)
      logger.logAuditEvent({ action: 'event.a', userId: 'u1', resource: 'r1' })
      logger.logAuditEvent({ action: 'event.b', userId: 'u2', resource: 'r2' })
      logger.logAuditEvent({ action: 'event.c', userId: 'u3', resource: 'r3' })

      const content = readFileSync(testFile, 'utf-8')
      const lines = content.trim().split('\n').filter(Boolean)
      expect(lines).toHaveLength(3)

      lines.forEach((line) => {
        expect(() => JSON.parse(line)).not.toThrow()
      })
    })

    it('uses default file path when none provided', () => {
      const logger = new AuditLogger()
      expect(() => logger.logAuditEvent({ action: 'test', userId: 'u', resource: 'r' })).not.toThrow()
    })

    it('handles special characters in details', () => {
      const logger = new AuditLogger(testFile)
      logger.logAuditEvent({
        action: 'data.exported',
        userId: 'user-1',
        resource: 'report-x',
        details: 'Export with "quotes" and\nnewlines\tand\ttabs',
      })

      const content = readFileSync(testFile, 'utf-8')
      const entry = JSON.parse(content.trim())
      expect(entry.details).toBe('Export with "quotes" and\nnewlines\tand\ttabs')
    })

    it('handles empty optional fields', () => {
      const logger = new AuditLogger(testFile)
      logger.logAuditEvent({ action: 'action.only.required', userId: 'uid', resource: 'res' })

      const content = readFileSync(testFile, 'utf-8')
      const entry = JSON.parse(content.trim())
      expect(entry.action).toBe('action.only.required')
      expect(entry.userId).toBe('uid')
      expect(entry.resource).toBe('res')
      expect(entry.details).toBeUndefined()
    })

    it('each entry is a separate append operation', () => {
      const logger = new AuditLogger(testFile)
      const events = [
        { action: 'e1', userId: 'u1', resource: 'r1' },
        { action: 'e2', userId: 'u2', resource: 'r2' },
        { action: 'e3', userId: 'u3', resource: 'r3' },
      ]

      events.forEach((e) => logger.logAuditEvent(e))

      const content = readFileSync(testFile, 'utf-8')
      const lines = content.trim().split('\n').filter(Boolean)

      // Verify each line is independent and parseable
      const parsed = lines.map((l) => JSON.parse(l))
      expect(parsed.map((p) => p.action)).toEqual(['e1', 'e2', 'e3'])
    })
  })
})