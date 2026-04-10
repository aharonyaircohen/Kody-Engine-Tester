import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

// Import the module under test
import { logAuditEvent, AUDIT_LOG_PATH } from './audit-logger'

describe('audit-logger', () => {
  const testLogDir = path.join(process.cwd(), 'logs')
  const testLogFile = path.join(testLogDir, 'audit.jsonl')

  beforeEach(() => {
    // Clean up test log file before each test
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile)
    }
  })

  afterEach(() => {
    // Clean up test log file after each test
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile)
    }
  })

  it('appends a JSON line to logs/audit.jsonl', () => {
    logAuditEvent({ action: 'user.login', userId: 'u1', resource: '/admin' })

    expect(fs.existsSync(testLogFile)).toBe(true)
    const content = fs.readFileSync(testLogFile, 'utf-8')
    const lines = content.trim().split('\n').filter(Boolean)
    expect(lines).toHaveLength(1)
  })

  it('each line contains timestamp, action, userId, resource', () => {
    logAuditEvent({ action: 'user.login', userId: 'u1', resource: '/admin' })

    const content = fs.readFileSync(testLogFile, 'utf-8')
    const line = JSON.parse(content.trim().split('\n')[0])

    expect(line.timestamp).toBeDefined()
    expect(line.action).toBe('user.login')
    expect(line.userId).toBe('u1')
    expect(line.resource).toBe('/admin')
  })

  it('includes details when provided', () => {
    logAuditEvent({ action: 'user.login', userId: 'u1', resource: '/admin', details: 'Login from Chrome' })

    const content = fs.readFileSync(testLogFile, 'utf-8')
    const line = JSON.parse(content.trim().split('\n')[0])

    expect(line.details).toBe('Login from Chrome')
  })

  it('omits details field when not provided', () => {
    logAuditEvent({ action: 'user.login', userId: 'u1', resource: '/admin' })

    const content = fs.readFileSync(testLogFile, 'utf-8')
    const line = JSON.parse(content.trim().split('\n')[0])

    expect(line.details).toBeUndefined()
  })

  it('creates the log file if it does not exist', () => {
    expect(fs.existsSync(testLogFile)).toBe(false)
    logAuditEvent({ action: 'user.login', userId: 'u1', resource: '/admin' })
    expect(fs.existsSync(testLogFile)).toBe(true)
  })

  it('creates the logs directory if it does not exist', () => {
    // Ensure the logs directory doesn't exist
    if (fs.existsSync(testLogDir)) {
      fs.rmdirSync(testLogDir)
    }
    expect(fs.existsSync(testLogDir)).toBe(false)

    logAuditEvent({ action: 'user.login', userId: 'u1', resource: '/admin' })

    expect(fs.existsSync(testLogDir)).toBe(true)
    expect(fs.existsSync(testLogFile)).toBe(true)
  })

  it('produces valid JSONL with multiple calls', () => {
    logAuditEvent({ action: 'user.login', userId: 'u1', resource: '/admin' })
    logAuditEvent({ action: 'user.logout', userId: 'u1', resource: '/admin' })
    logAuditEvent({ action: 'course.view', userId: 'u2', resource: '/courses/123' })

    const content = fs.readFileSync(testLogFile, 'utf-8')
    const lines = content.trim().split('\n').filter(Boolean)

    expect(lines).toHaveLength(3)
    lines.forEach((line) => {
      expect(() => JSON.parse(line)).not.toThrow()
    })
  })

  it('timestamp is in ISO format', () => {
    logAuditEvent({ action: 'user.login', userId: 'u1', resource: '/admin' })

    const content = fs.readFileSync(testLogFile, 'utf-8')
    const line = JSON.parse(content.trim().split('\n')[0])

    expect(line.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })
})