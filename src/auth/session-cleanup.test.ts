import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SessionStore } from './session-store'
import { cleanExpiredSessions } from './session-cleanup'

describe('cleanExpiredSessions', () => {
  let store: SessionStore
  const now = new Date('2026-04-10T12:00:00Z')

  beforeEach(() => {
    store = new SessionStore()
    vi.useFakeTimers()
    vi.setSystemTime(now)
  })

  it('should return 0 when no sessions exist', () => {
    const removed = cleanExpiredSessions(store, 60 * 1000)
    expect(removed).toBe(0)
  })

  it('should return 0 when no sessions are expired', () => {
    store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    const removed = cleanExpiredSessions(store, 60 * 1000)
    expect(removed).toBe(0)
    expect(store.getAll()).toHaveLength(1)
  })

  it('should remove sessions older than maxAgeMs', () => {
    const session = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    // Manually set createdAt to 2 minutes ago
    store['sessions'].set(session.id, { ...session, createdAt: new Date(now.getTime() - 2 * 60 * 1000) })

    const removed = cleanExpiredSessions(store, 60 * 1000)
    expect(removed).toBe(1)
    expect(store.getAll()).toHaveLength(0)
  })

  it('should not remove sessions younger than maxAgeMs', () => {
    const session = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    // Manually set createdAt to 30 seconds ago
    store['sessions'].set(session.id, { ...session, createdAt: new Date(now.getTime() - 30 * 1000) })

    const removed = cleanExpiredSessions(store, 60 * 1000)
    expect(removed).toBe(0)
    expect(store.getAll()).toHaveLength(1)
  })

  it('should remove only expired sessions when mixed', () => {
    const session1 = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    store['sessions'].set(session1.id, { ...session1, createdAt: new Date(now.getTime() - 2 * 60 * 1000) })

    const session2 = store.create('user-2', 'token-2', 'refresh-2', '127.0.0.1', 'UA')
    // session2 is still fresh

    const removed = cleanExpiredSessions(store, 60 * 1000)
    expect(removed).toBe(1)
    expect(store.getAll()).toHaveLength(1)
    expect(store.findByToken('token-2')).toBeDefined()
  })

  it('should return correct count when multiple sessions expire', () => {
    const session1 = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    store['sessions'].set(session1.id, { ...session1, createdAt: new Date(now.getTime() - 2 * 60 * 1000) })

    const session2 = store.create('user-2', 'token-2', 'refresh-2', '127.0.0.1', 'UA')
    store['sessions'].set(session2.id, { ...session2, createdAt: new Date(now.getTime() - 3 * 60 * 1000) })

    const session3 = store.create('user-3', 'token-3', 'refresh-3', '127.0.0.1', 'UA')
    store['sessions'].set(session3.id, { ...session3, createdAt: new Date(now.getTime() - 5 * 60 * 1000) })

    const removed = cleanExpiredSessions(store, 60 * 1000)
    expect(removed).toBe(3)
    expect(store.getAll()).toHaveLength(0)
  })

  it('should handle exactly maxAgeMs as boundary (not expired)', () => {
    const session = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    // Manually set createdAt to exactly maxAgeMs ago
    store['sessions'].set(session.id, { ...session, createdAt: new Date(now.getTime() - 60 * 1000) })

    const removed = cleanExpiredSessions(store, 60 * 1000)
    expect(removed).toBe(0) // exactly at boundary is NOT expired (age > maxAgeMs required)
  })
})
