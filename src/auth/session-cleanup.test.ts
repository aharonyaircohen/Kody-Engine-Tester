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

  it('returns 0 when no sessions exist', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))

    const count = cleanExpiredSessions(store, 60000)

    expect(count).toBe(0)
  })

  it('returns 0 when no sessions are expired', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))

    store.create('user1', 'token1', 'refresh1', '127.0.0.1', 'Mozilla/1.0')

    const count = cleanExpiredSessions(store, 60000) // 1 minute max age, session is 0ms old

    expect(count).toBe(0)
    expect(store.getAllSessions()).toHaveLength(1)
  })

  it('removes sessions older than maxAgeMs', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))

    store.create('user1', 'token1', 'refresh1', '127.0.0.1', 'Mozilla/1.0')

    // Advance time by 2 minutes
    vi.setSystemTime(new Date('2026-01-01T12:02:00Z'))

    const count = cleanExpiredSessions(store, 60000) // 1 minute max age

    expect(count).toBe(1)
    expect(store.getAllSessions()).toHaveLength(0)
  })

  it('returns count of removed sessions', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))

    store.create('user1', 'token1', 'refresh1', '127.0.0.1', 'Mozilla/1.0')
    store.create('user2', 'token2', 'refresh2', '127.0.0.2', 'Mozilla/2.0')
    store.create('user3', 'token3', 'refresh3', '127.0.0.3', 'Mozilla/3.0')

    // Advance time by 2 minutes
    vi.setSystemTime(new Date('2026-01-01T12:02:00Z'))

    const count = cleanExpiredSessions(store, 60000) // 1 minute max age

    expect(count).toBe(3)
    expect(store.getAllSessions()).toHaveLength(0)
  })

  it('removes only expired sessions when some are still valid', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))

    store.create('user1', 'token1', 'refresh1', '127.0.0.1', 'Mozilla/1.0')
    store.create('user2', 'token2', 'refresh2', '127.0.0.2', 'Mozilla/2.0')

    // Advance time by 90 seconds
    vi.setSystemTime(new Date('2026-01-01T12:01:30Z'))

    // Create a new session at this time
    store.create('user3', 'token3', 'refresh3', '127.0.0.3', 'Mozilla/3.0')

    // Now we have: user1 and user2 at 90 seconds old, user3 at 0 seconds old
    // With maxAge of 60 seconds, only user1 and user2 should be removed

    const count = cleanExpiredSessions(store, 60000)

    expect(count).toBe(2)
    expect(store.getAllSessions()).toHaveLength(1)
    expect(store.getAllSessions()[0].userId).toBe('user3')
  })

  it('handles sessions at exactly maxAgeMs boundary', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))

    store.create('user1', 'token1', 'refresh1', '127.0.0.1', 'Mozilla/1.0')

    // Advance time by exactly maxAgeMs
    vi.setSystemTime(new Date('2026-01-01T12:01:00Z'))

    // At exactly maxAgeMs, age = 60000ms which is NOT greater than maxAgeMs, so should not be removed
    const count = cleanExpiredSessions(store, 60000)

    expect(count).toBe(0)
    expect(store.getAllSessions()).toHaveLength(1)
  })

  it('handles maxAgeMs of 0', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))

    store.create('user1', 'token1', 'refresh1', '127.0.0.1', 'Mozilla/1.0')

    // Advance timers by 1ms so session has age > 0
    vi.advanceTimersByTime(1)

    // Any positive age will be > 0, so session should be removed
    const count = cleanExpiredSessions(store, 0)

    expect(count).toBe(1)
    expect(store.getAllSessions()).toHaveLength(0)
  })
})