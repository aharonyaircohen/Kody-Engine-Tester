import { describe, it, expect, beforeEach } from 'vitest'
import { logAuditEvent, AuditEvent } from './audit-logger'
import { promises as fs } from 'fs'
import path from 'path'

// ─── Test helpers ──────────────────────────────────────────────────────────────

const TEST_LOG_PATH = path.join(process.cwd(), 'test-audit.jsonl')

async function readJsonlLines(filePath: string): Promise<Record<string, unknown>[]> {
  const content = await fs.readFile(filePath, 'utf-8')
  const lines = content.trim().split('\n').filter(Boolean)
  return lines.map((line) => JSON.parse(line))
}

async function cleanup(): Promise<void> {
  try {
    await fs.unlink(TEST_LOG_PATH)
  } catch {
    // file may not exist
  }
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('AuditLogger', () => {
  beforeEach(async () => {
    await cleanup()
  })

  it('appends a valid JSONL entry with all required fields', () => {
    const event: AuditEvent = {
      action: 'user.login',
      userId: 'user-123',
      resource: '/api/login',
    }
    logAuditEvent(event, TEST_LOG_PATH)

    const lines = require('fs').readFileSync(TEST_LOG_PATH, 'utf-8').trim().split('\n')
    expect(lines).toHaveLength(1)

    const parsed = JSON.parse(lines[0])
    expect(parsed.action).toBe('user.login')
    expect(parsed.userId).toBe('user-123')
    expect(parsed.resource).toBe('/api/login')
    expect(parsed.timestamp).toBeDefined()
    expect(typeof parsed.timestamp).toBe('string')
    // timestamp should be parseable as ISO date
    expect(new Date(parsed.timestamp).toISOString()).toBe(parsed.timestamp)
  })

  it('includes optional details field when provided', () => {
    const event: AuditEvent = {
      action: 'course.enroll',
      userId: 'user-456',
      resource: 'course-789',
      details: 'Student enrolled in Python 101',
    }
    logAuditEvent(event, TEST_LOG_PATH)

    const lines = require('fs').readFileSync(TEST_LOG_PATH, 'utf-8').trim().split('\n')
    const parsed = JSON.parse(lines[0])
    expect(parsed.details).toBe('Student enrolled in Python 101')
  })

  it('omits details field when not provided', () => {
    const event: AuditEvent = {
      action: 'lesson.view',
      userId: 'user-789',
      resource: 'lesson-101',
    }
    logAuditEvent(event, TEST_LOG_PATH)

    const lines = require('fs').readFileSync(TEST_LOG_PATH, 'utf-8').trim().split('\n')
    const parsed = JSON.parse(lines[0])
    expect(parsed.details).toBeUndefined()
  })

  it('appends multiple events without overwriting', () => {
    logAuditEvent({ action: 'event.1', userId: 'u1', resource: 'r1' }, TEST_LOG_PATH)
    logAuditEvent({ action: 'event.2', userId: 'u2', resource: 'r2' }, TEST_LOG_PATH)
    logAuditEvent({ action: 'event.3', userId: 'u3', resource: 'r3' }, TEST_LOG_PATH)

    const lines = require('fs').readFileSync(TEST_LOG_PATH, 'utf-8').trim().split('\n')
    expect(lines).toHaveLength(3)

    expect(JSON.parse(lines[0]).action).toBe('event.1')
    expect(JSON.parse(lines[1]).action).toBe('event.2')
    expect(JSON.parse(lines[2]).action).toBe('event.3')
  })
})