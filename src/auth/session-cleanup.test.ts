import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SessionStore } from './session-store'
import { cleanExpiredSessions } from './session-cleanup'

describe('cleanExpiredSessions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns 0 when no sessions exist', () => {
    const store = new SessionStore()
    const count = cleanExpiredSessions(store, 1000)
    expect(count).toBe(0)
  })

  it('returns 0 when no sessions are expired', () => {
    const store = new SessionStore()
    store.create('user1', 'token1', 'refresh1', '127.0.0.1', 'Test Agent')
    vi.advanceTimersByTime(500)
    const count = cleanExpiredSessions(store, 1000)
    expect(count).toBe(0)
  })

  it('removes sessions older than maxAgeMs', () => {
    const store = new SessionStore()
    store.create('user1', 'token1', 'refresh1', '127.0.0.1', 'Test Agent')
    vi.advanceTimersByTime(1500)
    const count = cleanExpiredSessions(store, 1000)
    expect(count).toBe(1)
  })

  it('returns count of removed sessions', () => {
    const store = new SessionStore()
    store.create('user1', 'token1', 'refresh1', '127.0.0.1', 'Test Agent')
    store.create('user2', 'token2', 'refresh2', '127.0.0.2', 'Test Agent')
    vi.advanceTimersByTime(1500)
    const count = cleanExpiredSessions(store, 1000)
    expect(count).toBe(2)
  })

  it('only removes sessions that exceed maxAgeMs', () => {
    const store = new SessionStore()
    store.create('user1', 'token1', 'refresh1', '127.0.0.1', 'Test Agent')
    vi.advanceTimersByTime(500)
    store.create('user2', 'token2', 'refresh2', '127.0.0.2', 'Test Agent')
    vi.advanceTimersByTime(1000)
    const count = cleanExpiredSessions(store, 1000)
    expect(count).toBe(1)
  })

  it('handles sessions with missing createdAt gracefully', () => {
    const store = new SessionStore()
    const session = store.create('user1', 'token1', 'refresh1', '127.0.0.1', 'Test Agent')
    ;(session as unknown as { createdAt: Date }).createdAt = new Date(NaN)
    const count = cleanExpiredSessions(store, 1000)
    expect(count).toBe(1)
  })
})