import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { logAuditEvent } from './audit-logger'
import fs from 'fs'
import path from 'path'

describe('logAuditEvent', () => {
  const testLogPath = path.join(__dirname, 'test-audit.log')

  beforeEach(() => {
    if (fs.existsSync(testLogPath)) {
      fs.unlinkSync(testLogPath)
    }
  })

  afterEach(() => {
    if (fs.existsSync(testLogPath)) {
      fs.unlinkSync(testLogPath)
    }
  })

  it('should append a JSON line to the log file', () => {
    logAuditEvent({ action: 'user.login', userId: 'user-1', resource: '/api/login' }, testLogPath)

    const content = fs.readFileSync(testLogPath, 'utf-8')
    const lines = content.trim().split('\n')

    expect(lines).toHaveLength(1)
    const entry = JSON.parse(lines[0])
    expect(entry).toMatchObject({
      action: 'user.login',
      userId: 'user-1',
      resource: '/api/login',
    })
    expect(entry.timestamp).toBeDefined()
  })

  it('should include optional details field', () => {
    logAuditEvent(
      { action: 'course.enroll', userId: 'user-2', resource: 'course/cs101', details: 'Enrolled in CS101' },
      testLogPath,
    )

    const content = fs.readFileSync(testLogPath, 'utf-8')
    const entry = JSON.parse(content.trim())
    expect(entry.details).toBe('Enrolled in CS101')
  })

  it('should append multiple entries as separate JSON lines', () => {
    logAuditEvent({ action: 'user.login', userId: 'user-1', resource: '/api/login' }, testLogPath)
    logAuditEvent({ action: 'user.logout', userId: 'user-1', resource: '/api/logout' }, testLogPath)

    const content = fs.readFileSync(testLogPath, 'utf-8')
    const lines = content.trim().split('\n')

    expect(lines).toHaveLength(2)
    expect(JSON.parse(lines[0]).action).toBe('user.login')
    expect(JSON.parse(lines[1]).action).toBe('user.logout')
  })

  it('should include ISO timestamp in each entry', () => {
    const before = new Date().toISOString()
    logAuditEvent({ action: 'test.action', userId: 'u1', resource: 'r1' }, testLogPath)
    const after = new Date().toISOString()

    const content = fs.readFileSync(testLogPath, 'utf-8')
    const entry = JSON.parse(content.trim())

    expect(entry.timestamp).toBeDefined()
    expect(entry.timestamp >= before && entry.timestamp <= after).toBe(true)
  })

  it('should handle entries without optional details', () => {
    logAuditEvent({ action: 'user.login', userId: 'user-1', resource: '/api/login' }, testLogPath)

    const content = fs.readFileSync(testLogPath, 'utf-8')
    const entry = JSON.parse(content.trim())

    expect(entry.details).toBeUndefined()
    expect(entry.action).toBe('user.login')
    expect(entry.userId).toBe('user-1')
    expect(entry.resource).toBe('/api/login')
  })
})
