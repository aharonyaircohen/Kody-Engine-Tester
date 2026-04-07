import { describe, it, expect, beforeEach } from 'vitest'
import { SessionStore } from './session-store'
import { cleanExpiredSessions } from './session-cleanup'

describe('cleanExpiredSessions', () => {
  let store: SessionStore

  beforeEach(() => {
    store = new SessionStore()
  })

  it('should return 0 when no sessions exist', () => {
    expect(cleanExpiredSessions(store, 60000)).toBe(0)
  })

  it('should return 0 when no sessions are expired', () => {
    store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    expect(cleanExpiredSessions(store, 60000)).toBe(0)
  })

  it('should remove sessions older than maxAgeMs', () => {
    const session = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    // Manually age the session
    store['sessions'].set(session.id, { ...session, createdAt: new Date(Date.now() - 120000) })
    const removed = cleanExpiredSessions(store, 60000)
    expect(removed).toBe(1)
    expect(store.findByToken('token-1')).toBeUndefined()
  })

  it('should return count of removed sessions', () => {
    const s1 = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    const s2 = store.create('user-1', 'token-2', 'refresh-2', '127.0.0.1', 'UA')
    const s3 = store.create('user-1', 'token-3', 'refresh-3', '127.0.0.1', 'UA')
    store['sessions'].set(s1.id, { ...s1, createdAt: new Date(Date.now() - 120000) })
    store['sessions'].set(s2.id, { ...s2, createdAt: new Date(Date.now() - 180000) })
    store['sessions'].set(s3.id, { ...s3, createdAt: new Date(Date.now() - 30000) })
    const removed = cleanExpiredSessions(store, 60000)
    expect(removed).toBe(2)
    expect(store.findByToken('token-1')).toBeUndefined()
    expect(store.findByToken('token-2')).toBeUndefined()
    expect(store.findByToken('token-3')).toBeDefined()
  })

  it('should not remove sessions within maxAgeMs', () => {
    const session = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    store['sessions'].set(session.id, { ...session, createdAt: new Date(Date.now() - 30000) })
    const removed = cleanExpiredSessions(store, 60000)
    expect(removed).toBe(0)
    expect(store.findByToken('token-1')).toBeDefined()
  })
})
