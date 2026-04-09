import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { SessionStore } from './session-store'
import { cleanExpiredSessions } from './session-cleanup'

describe('cleanExpiredSessions', () => {
  let store: SessionStore

  beforeEach(() => {
    store = new SessionStore()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return 0 when no sessions exist', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))

    expect(cleanExpiredSessions(store, 60000)).toBe(0)
  })

  it('should not remove sessions younger than maxAgeMs', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))

    store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')

    expect(cleanExpiredSessions(store, 60000)).toBe(0)
    expect(store.findByToken('token-1')).toBeDefined()
  })

  it('should remove sessions older than maxAgeMs', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))

    store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')

    vi.setSystemTime(new Date('2026-01-01T12:02:00Z'))

    expect(cleanExpiredSessions(store, 60000)).toBe(1)
    expect(store.findByToken('token-1')).toBeUndefined()
  })

  it('should return count of removed sessions', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))

    store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    store.create('user-2', 'token-2', 'refresh-2', '127.0.0.2', 'UA')

    vi.setSystemTime(new Date('2026-01-01T12:02:00Z'))

    expect(cleanExpiredSessions(store, 60000)).toBe(2)
    expect(store.findByToken('token-1')).toBeUndefined()
    expect(store.findByToken('token-2')).toBeUndefined()
  })

  it('should only remove sessions exceeding maxAgeMs', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))

    store.create('user-1', 'token-old', 'refresh-old', '127.0.0.1', 'UA')

    vi.setSystemTime(new Date('2026-01-01T12:02:00Z'))

    store.create('user-2', 'token-fresh', 'refresh-fresh', '127.0.0.2', 'UA')

    expect(cleanExpiredSessions(store, 60000)).toBe(1)
    expect(store.findByToken('token-old')).toBeUndefined()
    expect(store.findByToken('token-fresh')).toBeDefined()
  })
})