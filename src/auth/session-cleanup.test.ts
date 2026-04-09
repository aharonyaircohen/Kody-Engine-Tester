import { describe, it, expect, beforeEach } from 'vitest'
import { SessionStore } from './session-store'
import { cleanExpiredSessions } from './session-cleanup'

describe('cleanExpiredSessions', () => {
  let store: SessionStore

  beforeEach(() => {
    store = new SessionStore()
  })

  it('should return 0 for empty store', () => {
    const count = cleanExpiredSessions(store, 1000)
    expect(count).toBe(0)
  })

  it('should not remove sessions younger than maxAgeMs', () => {
    store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    const count = cleanExpiredSessions(store, 60 * 60 * 1000) // 1 hour
    expect(count).toBe(0)
    expect(store['sessions'].size).toBe(1)
  })

  it('should remove sessions older than maxAgeMs', () => {
    const session = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    store['sessions'].set(session.id, { ...session, createdAt: new Date(Date.now() - 2000) })
    const count = cleanExpiredSessions(store, 1000) // 1 second
    expect(count).toBe(1)
    expect(store['sessions'].size).toBe(0)
  })

  it('should only remove expired sessions when mix exists', () => {
    const session1 = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    store['sessions'].set(session1.id, { ...session1, createdAt: new Date(Date.now() - 2000) })
    store.create('user-2', 'token-2', 'refresh-2', '127.0.0.1', 'UA') // fresh session
    const count = cleanExpiredSessions(store, 1000)
    expect(count).toBe(1)
    expect(store['sessions'].size).toBe(1)
    expect(store.findByToken('token-2')).toBeDefined()
  })

  it('should return correct count when multiple sessions expire', () => {
    const session1 = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
    store['sessions'].set(session1.id, { ...session1, createdAt: new Date(Date.now() - 5000) })
    const session2 = store.create('user-2', 'token-2', 'refresh-2', '127.0.0.1', 'UA')
    store['sessions'].set(session2.id, { ...session2, createdAt: new Date(Date.now() - 3000) })
    const count = cleanExpiredSessions(store, 1000)
    expect(count).toBe(2)
    expect(store['sessions'].size).toBe(0)
  })
})
