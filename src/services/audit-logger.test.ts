import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { logAuditEvent, configureAuditLogger, resetAuditLoggerConfig, AuditEvent } from './audit-logger'

describe('auditLogger', () => {
  const testLogFile = path.join(process.cwd(), 'logs', 'test-audit.jsonl')

  beforeEach(() => {
    configureAuditLogger({ filePath: testLogFile })
  })

  afterEach(() => {
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile)
    }
    resetAuditLoggerConfig()
  })

  describe('logAuditEvent', () => {
    it('should append a JSON line to the audit log file', () => {
      const event: AuditEvent = {
        action: 'user.login',
        userId: 'user-123',
        resource: 'auth',
      }

      logAuditEvent(event)

      const content = fs.readFileSync(testLogFile, 'utf-8')
      const lines = content.trim().split('\n')
      expect(lines).toHaveLength(1)

      const parsed = JSON.parse(lines[0])
      expect(parsed.action).toBe('user.login')
      expect(parsed.userId).toBe('user-123')
      expect(parsed.resource).toBe('auth')
      expect(parsed.timestamp).toBeDefined()
    })

    it('should include details when provided', () => {
      const event: AuditEvent = {
        action: 'course.created',
        userId: 'admin-1',
        resource: 'courses/cs101',
        details: 'Created new course CS101',
      }

      logAuditEvent(event)

      const content = fs.readFileSync(testLogFile, 'utf-8')
      const parsed = JSON.parse(content.trim())
      expect(parsed.details).toBe('Created new course CS101')
    })

    it('should append multiple events as separate lines', () => {
      const event1: AuditEvent = { action: 'a', userId: 'u1', resource: 'r1' }
      const event2: AuditEvent = { action: 'b', userId: 'u2', resource: 'r2' }

      logAuditEvent(event1)
      logAuditEvent(event2)

      const content = fs.readFileSync(testLogFile, 'utf-8')
      const lines = content.trim().split('\n')
      expect(lines).toHaveLength(2)

      expect(JSON.parse(lines[0]).action).toBe('a')
      expect(JSON.parse(lines[1]).action).toBe('b')
    })

    it('should include ISO timestamp in each entry', () => {
      const event: AuditEvent = {
        action: 'test.timestamp',
        userId: 'user-1',
        resource: 'test',
      }

      logAuditEvent(event)

      const content = fs.readFileSync(testLogFile, 'utf-8')
      const parsed = JSON.parse(content.trim())

      expect(parsed.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('configureAuditLogger', () => {
    it('should allow custom file path', () => {
      const customPath = path.join(process.cwd(), 'logs', 'custom-audit.jsonl')

      configureAuditLogger({ filePath: customPath })

      logAuditEvent({ action: 'test', userId: 'u1', resource: 'r1' })

      expect(fs.existsSync(customPath)).toBe(true)
      fs.unlinkSync(customPath)
    })
  })
})
