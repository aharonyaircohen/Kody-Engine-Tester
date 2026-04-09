import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logAuditEvent } from './audit-logger'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

describe('audit-logger', () => {
  let tempDir: string
  let tempFile: string

  beforeEach(() => {
    tempDir = os.tmpdir()
    tempFile = path.join(tempDir, `audit-test-${Date.now()}.jsonl`)
  })

  afterEach(() => {
    try {
      fs.unlinkSync(tempFile)
    } catch {
      // ignore cleanup errors
    }
  })

  it('appends a JSON line with timestamp to the log file', () => {
    logAuditEvent({ action: 'course.created', userId: 'user-1', resource: 'course/cs101' }, tempFile)

    const content = fs.readFileSync(tempFile, 'utf-8')
    const lines = content.trim().split('\n')
    expect(lines).toHaveLength(1)

    const entry = JSON.parse(lines[0]!)
    expect(entry).toMatchObject({
      action: 'course.created',
      userId: 'user-1',
      resource: 'course/cs101',
    })
    expect(entry.timestamp).toBeTruthy()
    expect(() => new Date(entry.timestamp)).not.toThrow()
  })

  it('includes optional details field when provided', () => {
    logAuditEvent({
      action: 'lesson.completed',
      userId: 'user-2',
      resource: 'lesson/intro',
      details: 'Watched 10min of video',
    }, tempFile)

    const content = fs.readFileSync(tempFile, 'utf-8')
    const entry = JSON.parse(content)
    expect(entry.details).toBe('Watched 10min of video')
  })

  it('omits details field when not provided', () => {
    logAuditEvent({
      action: 'quiz.submitted',
      userId: 'user-3',
      resource: 'quiz/final',
    }, tempFile)

    const content = fs.readFileSync(tempFile, 'utf-8')
    const entry = JSON.parse(content)
    expect(entry.details).toBeUndefined()
  })

  it('appends to a custom log path when provided', () => {
    const customPath = path.join(tempDir, `custom-audit-${Date.now()}.log`)
    try {
      logAuditEvent({ action: 'enrollment.created', userId: 'user-4', resource: 'course/cs202' }, customPath)

      expect(fs.existsSync(customPath)).toBe(true)
    } finally {
      try { fs.unlinkSync(customPath) } catch { /* ignore */ }
    }
  })

  it('each call produces a separate JSON line', () => {
    logAuditEvent({ action: 'event-a', userId: 'u1', resource: 'r1' }, tempFile)
    logAuditEvent({ action: 'event-b', userId: 'u2', resource: 'r2' }, tempFile)

    const content = fs.readFileSync(tempFile, 'utf-8')
    const lines = content.trim().split('\n').filter(Boolean)

    expect(lines).toHaveLength(2)
    expect(JSON.parse(lines[0]!).action).toBe('event-a')
    expect(JSON.parse(lines[1]!).action).toBe('event-b')
  })
})