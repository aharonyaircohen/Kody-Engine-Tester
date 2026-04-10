import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { SessionStore } from './session-store'
import { cleanExpiredSessions } from './session-cleanup'

describe('cleanExpiredSessions', () => {
  let store: SessionStore

  beforeEach(() => {
    vi.useFakeTimers()
    store = new SessionStore()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return 0 when no sessions exist', () => {
    const count = cleanExpiredSessions(store, 60000)
    expect(count).toBe(0)
  })

  it('should return 0 when no sessions are expired', () => {
    vi.advanceTimersByTime(10000)
    store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    vi.advanceTimersByTime(10000)
    const count = cleanExpiredSessions(store, 60000) // 1 minute
    expect(count).toBe(0)
  })

  it('should remove sessions older than maxAgeMs', () => {
    store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    vi.advanceTimersByTime(120000) // advance past maxAgeMs
    const count = cleanExpiredSessions(store, 60000) // 1 minute max age
    expect(count).toBe(1)
    expect(store.findByToken('token-1')).toBeUndefined()
  })

  it('should return count of multiple removed sessions', () => {
    store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    store.create('user-2', 'token-2', 'refresh-2', '127.0.0.1', 'UA')
    vi.advanceTimersByTime(120000) // advance past maxAgeMs
    const count = cleanExpiredSessions(store, 60000)
    expect(count).toBe(2)
    expect(store.findByToken('token-1')).toBeUndefined()
    expect(store.findByToken('token-2')).toBeUndefined()
  })

  it('should only remove sessions that exceed maxAgeMs', () => {
    store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    vi.advanceTimersByTime(120000) // advance past maxAgeMs for session1
    store.create('user-2', 'token-2', 'refresh-2', '127.0.0.1', 'UA') // session2 is newer
    const count = cleanExpiredSessions(store, 60000)
    expect(count).toBe(1)
    expect(store.findByToken('token-1')).toBeUndefined()
    expect(store.findByToken('token-2')).toBeDefined()
  })

  it('should handle maxAgeMs of 0 (remove all sessions)', () => {
    vi.advanceTimersByTime(10000) // ensure created sessions are in the past
    store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    store.create('user-2', 'token-2', 'refresh-2', '127.0.0.1', 'UA')
    vi.advanceTimersByTime(1) // ensure now > createdAt
    const count = cleanExpiredSessions(store, 0)
    expect(count).toBe(2)
    expect(store.findByToken('token-1')).toBeUndefined()
    expect(store.findByToken('token-2')).toBeUndefined()
  })

  it('should not remove sessions created exactly at maxAgeMs boundary', () => {
    store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    // createdAt == now, so createdAt + maxAgeMs == now, not < now
    const count = cleanExpiredSessions(store, 60000)
    expect(count).toBe(0)
    expect(store.findByToken('token-1')).toBeDefined()
  })

  it('should remove sessions created just over maxAgeMs boundary', () => {
    store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    vi.advanceTimersByTime(60001) // advance just over maxAgeMs
    const count = cleanExpiredSessions(store, 60000)
    expect(count).toBe(1)
    expect(store.findByToken('token-1')).toBeUndefined()
  })
})