import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SessionStore } from './session-store'
import { cleanExpiredSessions } from './session-cleanup'

describe('cleanExpiredSessions', () => {
  let store: SessionStore

  beforeEach(() => {
    store = new SessionStore()
    vi.useFakeTimers()
  })

  it('should return 0 when no sessions exist', () => {
    const count = cleanExpiredSessions(store, 60000)
    expect(count).toBe(0)
  })

  it('should remove sessions older than maxAgeMs', () => {
    const session = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    // Advance time past maxAgeMs
    vi.advanceTimersByTime(60001)
    const count = cleanExpiredSessions(store, 60000)
    expect(count).toBe(1)
    expect(store.findByToken('token-1')).toBeUndefined()
  })

  it('should not remove sessions newer than maxAgeMs', () => {
    const session = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    cleanExpiredSessions(store, 60000)
    expect(store.findByToken('token-1')?.id).toBe(session.id)
  })

  it('should return correct count when multiple sessions expire', () => {
    store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    store.create('user-1', 'token-2', 'refresh-2', '127.0.0.1', 'UA')
    store.create('user-2', 'token-3', 'refresh-3', '127.0.0.1', 'UA')
    vi.advanceTimersByTime(60001)
    const count = cleanExpiredSessions(store, 60000)
    expect(count).toBe(3)
    expect(store.findByToken('token-1')).toBeUndefined()
    expect(store.findByToken('token-2')).toBeUndefined()
    expect(store.findByToken('token-3')).toBeUndefined()
  })

  it('should remove only expired sessions when mix of old and new', () => {
    const oldSession = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    vi.advanceTimersByTime(60001)
    const newSession = store.create('user-2', 'token-2', 'refresh-2', '127.0.0.1', 'UA')
    const count = cleanExpiredSessions(store, 60000)
    expect(count).toBe(1)
    expect(store.findByToken('token-1')).toBeUndefined()
    expect(store.findByToken('token-2')?.id).toBe(newSession.id)
  })

  it('should handle maxAgeMs of 0', () => {
    const session = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    const count = cleanExpiredSessions(store, 0)
    expect(count).toBe(1)
    expect(store.findByToken('token-1')).toBeUndefined()
  })

  it('should handle very large maxAgeMs', () => {
    store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    store.create('user-1', 'token-2', 'refresh-2', '127.0.0.1', 'UA')
    const count = cleanExpiredSessions(store, Number.MAX_SAFE_INTEGER)
    expect(count).toBe(0)
    expect(store.findByToken('token-1')).toBeDefined()
    expect(store.findByToken('token-2')).toBeDefined()
  })

  it('should handle partial expiration with multiple user sessions', () => {
    // Create 3 sessions for user-1
    const s1 = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    vi.advanceTimersByTime(10000)
    const s2 = store.create('user-1', 'token-2', 'refresh-2', '127.0.0.1', 'UA')
    vi.advanceTimersByTime(10000)
    const s3 = store.create('user-1', 'token-3', 'refresh-3', '127.0.0.1', 'UA')
    vi.advanceTimersByTime(10000)

    // Only the first session is old enough to be cleaned with 25000ms maxAge
    const count = cleanExpiredSessions(store, 25000)
    expect(count).toBe(1)
    expect(store.findByToken('token-1')).toBeUndefined()
    expect(store.findByToken('token-2')?.id).toBe(s2.id)
    expect(store.findByToken('token-3')?.id).toBe(s3.id)
  })

  it('should correctly identify expiration boundary', () => {
    const session = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    // Advance exactly to maxAgeMs - 1 (should not expire)
    vi.advanceTimersByTime(59999)
    let count = cleanExpiredSessions(store, 60000)
    expect(count).toBe(0)
    expect(store.findByToken('token-1')?.id).toBe(session.id)

    // Advance 1 more ms (should expire)
    vi.advanceTimersByTime(1)
    count = cleanExpiredSessions(store, 60000)
    expect(count).toBe(1)
    expect(store.findByToken('token-1')).toBeUndefined()
  })
})